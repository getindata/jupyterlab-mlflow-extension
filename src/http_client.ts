import { ServerConnection } from '@jupyterlab/services';

import { URLExt } from '@jupyterlab/coreutils';

export interface IGitCloneResult {
    status: boolean;
    stdout: string;
    stderr: string;
}

export interface ILabResult{
    status: boolean;
    stdout: string;
    stderr: string;}

export interface IKerberosAuthParams {
    password: string;
}

export interface ISparkUIResult {
  url: string;
  isAvailable: boolean;
}

function httpRequest(
    url: string,
    method: string,
    request: Object | null = null
  ): Promise<Response> {
    const fullRequest = {
      method: method,
      body: request ? JSON.stringify(request) : null
    },

    setting = ServerConnection.makeSettings(),
    fullUrl = URLExt.join(setting.baseUrl, url);
    return ServerConnection.makeRequest(fullUrl, fullRequest, setting);
  }

export class HttpClient {
    private async _make_request(url: string, method: string = 'GET', request: Object | null = null) {
      try {
        const response = await httpRequest(url, method, request);
        if (response.status !== 200) {
          const data = await response.json();
          throw new ServerConnection.ResponseError(response, data.message);
        }
        return response.json();
      } catch (err) {
        throw ServerConnection.NetworkError;
      }
    }

    async configureGitRepo(params: string): Promise<IGitCloneResult> {
      return await this._make_request('/mlflow/gitclone', 'POST', { "git_repo_params": params})
    }

    async configureModelRun(params: string): Promise<ILabResult> {
      return await this._make_request('/mlflow/run', 'POST',  { "run_params": params})
    }

    async configureModelBuild(params: string): Promise<ILabResult> {
      return await this._make_request('/mlflow/build', 'POST',  { "build_params": params})
    }

    async configureModelServe(params: string): Promise<ILabResult> {
      return await this._make_request('/mlflow/serve', 'POST',  { "serve_params": params})
    }

    async configureModelTest(params: string): Promise<ILabResult> {
      return await this._make_request('/mlflow/test', 'POST',  { "test_params": params})
    }

}