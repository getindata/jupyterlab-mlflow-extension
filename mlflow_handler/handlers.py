from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler
import docker
import mlflow

from git import Repo
import json

def getGitRepo():
    import os
    cwd = os.getcwd()
    git_repo = Repo(cwd)
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
    def get(self):
        print(self.base_url)
        client = docker.from_env()
        client.containers.get()
        git_repo = getGitRepo()
        project_name = getProjectName(git_repo)

        container = client.containers.run("getindata/%s" %(project_name),name="", detach = True,)
        self.finish( )

class MLFlowModelBuildHandler(IPythonHandler):
    def get(self):
        git_repo = getGitRepo()
        pullRepo(git_repo)
        project_name = getProjectName(git_repo)
        import subprocess
        process_run = mlflow.projects.run(".")
        process_run.wait()
        process_id = process_run.run_id
        process_build = subprocess.Popen("mlflow models build-docker -m  mlruns/0/%s/artifacts/model_wine/ -n getindata/%s:%s" % (process_id,project_name,process_id), shell=True, stdout=subprocess.PIPE)
        process_build.wait()

        self.finish("Docker build image getindata/%s:%s finished with %s code" %(project_name,process_id,process_build.returncode))

class MLFlowModelTestHandler(IPythonHandler):
    def get(self):
        pass

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
        ("/mlflow/build", MLFlowModelBuildHandler),
        ("/mlflow/test", MLFlowModelTestHandler),
        ("/mlflow/gitclone", MLFlowGitCloneHandler)
    ]
    web_app = nb_server_app.web_app
    host_pattern = '.*$'
    base_url = web_app.settings['base_url']
    # route_pattern = url_path_join(web_app.settings['base_url'], '/mlflow/serve')

    handlers = [(url_path_join(base_url, handler[0]), handler[1]) for handler in mlflowHandlers]
    web_app.add_handlers(host_pattern, handlers)



