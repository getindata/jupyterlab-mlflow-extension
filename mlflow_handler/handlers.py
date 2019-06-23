from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler
import docker
import mlflow
import logging

from git import Repo
import json
import requests
import  docker.errors

import json


global_base_url = ""
def getGitRepo(modelName: str):
    import os
    cwd = os.getcwd()
    git_repo = Repo("%s/%s" % (cwd, modelName ) )
    return git_repo

def pullRepo(repo: Repo):
    origin = repo.remote()
    origin.pull()

def cloneRepo(git_url: str, local_dir: str):
    Repo.clone_from(git_url, local_dir)

def getProjectName(repo: Repo):
    project_name = repo.working_dir.split('/')[-1]
    return project_name

class MLFlowModelServeHandler(IPythonHandler):


    def post(self):
        log = logging.getLoggerClass()
        client = docker.from_env()
        params = json.loads(self.request.body.decode('utf-8'))
        image = params['serve_params'].split('|')[0]
        port = params['serve_params'].split('|')[1]
        container_name = params['serve_params'].split('|')[2]
        try:
            container = client.containers.get(container_name)
            container.stop()
            container.remove()
        except :
            print("Container %s does not exist" % (container_name) )
        try:
            container = client.containers.run("%s" %(image),name=container_name, detach = True, ports = {'8080/tcp': port} )
        except docker.errors.ImageNotFound as e:
            print(e.explanation)
            self.finish(e.explanation)
        except docker.errors.APIError as e:
            print(e.explanation)
            self.finish(e.explanation)
        finally:
            pass
        print("Serving image %s as % at port %s" % (image, container_name, port))
        self.finish("Serving image %s as % at port %s" % (image, container_name, port) )


class MLFlowModelRunHandler(IPythonHandler):
    def post(self):
        params = json.loads(self.request.body.decode('utf-8'))
        model_name = params['run_params']
        git_repo = getGitRepo(model_name)
        # pullRepo(git_repo)
        project_name = getProjectName(git_repo)

        import subprocess
        mlflow.set_tracking_uri('https://gid-mlflow.appspot.com')
        print("%s/%s" % (project_name,git_repo.active_branch))
        # try:
        #     mlflow.create_experiment("%s" % (project_name))
        # except:
        #     pass
        #remove branch from experiment name
        process_run = mlflow.projects.run(uri="%s/." % (model_name),
                                          experiment_name="%s" % (project_name))
        # process_run = mlflow.projects.run(uri="%s/." % (model_name),experiment_name = "%s/%s" % (project_name,git_repo.active_branch))
        process_run.wait()
        process_id = process_run.run_id
        self.finish(process_run.run_id)


class MLFlowModelBuildHandler(IPythonHandler):
    def post(self):
        params = json.loads(self.request.body.decode('utf-8'))
        model_name = params['build_params']
        git_repo = getGitRepo(model_name)
        sha = git_repo.head.object.hexsha
        # pullRepo(git_repo)
        project_name = getProjectName(git_repo)
        import subprocess
        mlflow.set_tracking_uri('https://gid-mlflow.appspot.com')
        process_run = mlflow.projects.run("%s/." % (model_name))
        process_run.wait()
        process_id = process_run.run_id
        # process_build = subprocess.Popen("mlflow models build-docker -m  mlruns/0/%s/artifacts/model/ -n getindata/%s:%s" % (process_id,project_name,process_id), shell=True, stdout=subprocess.PIPE)
        process_build = subprocess.Popen("mlflow models build-docker -m  gs://gid-mlflow-artifacts/0/%s/artifacts/model -n getindata/%s:%s" % (process_id,project_name,sha), shell=True, stdout=subprocess.PIPE)

        # process_build.wait()
        self.finish("Docker build image getindata/%s:%s finished with %s code" %(project_name,process_id,process_build.returncode))

class MLFlowModelTestHandler(IPythonHandler):
    def post(self):
        test_data_file = "test_data.json"
        params = json.loads(self.request.body.decode('utf-8'))
        container_name = params['test_params']
        client = docker.from_env()
        container = client.containers.get(container_name)
        # print(container.ports)
        host_port = container.ports['8080/tcp'][0]['HostPort']
        # print(host_port)
        data = {}
        with open('%s/%s' % (container_name, test_data_file)) as jsonfile:
            data = json.load(jsonfile)
        res = requests.post("http://localhost:%s/invocations" % (host_port), json = data)
        # print(res.status_code)
        print("Testing container %s running image %s" % (container_name, container.image))
        print("### Model tested with:\n %s \n and got result \n %s " % (data, res.json()) )
        self.finish()


class MLFlowGitCloneHandler(IPythonHandler):
    def post(self):
        params = json.loads(self.request.body.decode('utf-8'))
        git_url = params['git_repo_params'].split('|')[0]
        local_dir = params['git_repo_params'].split('|')[1]
        cloneRepo(git_url, local_dir)




def load_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """

    mlflowHandlers = [
        ("/mlflow/serve", MLFlowModelServeHandler),
        ("/mlflow/run", MLFlowModelRunHandler),
        ("/mlflow/build", MLFlowModelBuildHandler),
        ("/mlflow/test", MLFlowModelTestHandler),
        ("/mlflow/gitclone", MLFlowGitCloneHandler)
    ]
    web_app = nb_server_app.web_app
    host_pattern = '.*$'
    base_url = web_app.settings['base_url']
    global_base_url = nb_server_app.connection_url
    print(global_base_url)
    # route_pattern = url_path_join(web_app.settings['base_url'], '/mlflow/serve')

    handlers = [(url_path_join(base_url, handler[0]), handler[1]) for handler in mlflowHandlers]
    web_app.add_handlers(host_pattern, handlers)



