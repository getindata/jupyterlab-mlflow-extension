import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {IMainMenu} from '@jupyterlab/mainmenu'

import {IFrame, ICommandPalette} from '@jupyterlab/apputils'

import {Menu} from '@phosphor/widgets'

import '../style/index.css';


import { Dialog, showDialog } from '@jupyterlab/apputils';
import { GitClonePromptForm } from './forms';
import { ModelPromptForm } from './forms';
import { ProjectPromptForm } from './forms';

import { HttpClient } from './http_client';


const http_client = new HttpClient();
const GIT_REPO = 'gitRepo';

function dialogClone(warnText? :string) {
  showDialog({
    title: 'Configure git repo',
    body: new GitClonePromptForm(warnText),
    buttons: [
      Dialog.cancelButton({label: 'Skip'}),
      Dialog.okButton({label: "Submit", className: GIT_REPO}),
    ]
  }).then(result => {
    if (result.button.className == GIT_REPO) {
      console.log("Got repo result:", result.value);
      return http_client.configureGitRepo(result.value)
    }
  }).then(IGitCloneResult => {
      if (IGitCloneResult && !IGitCloneResult.status) {
        dialogClone(IGitCloneResult.stderr);
      }
  }).catch(e => {
    console.error("an error occured", e);
  })
}


function dialogRun(warnText? :string) {
  showDialog({
    title: 'Project to run',
    body: new ProjectPromptForm(warnText),
    buttons: [
      Dialog.cancelButton({label: 'Skip'}),
      Dialog.okButton({label: "Submit", className: GIT_REPO}),
    ]
  }).then(result => {
    if (result.button.className == GIT_REPO) {
      console.log("Got repo result:", result.value);
      return http_client.configureModelRun(result.value)
    }
  }).then(ILabResult => {
      if (ILabResult && !ILabResult.status) {
        dialogRun(ILabResult.stderr);
      }
  }).catch(e => {
    console.error("an error occured", e);
  })
}



function dialogBuild(warnText? :string) {
  showDialog({
    title: 'Project to build',
    body: new ProjectPromptForm(warnText),
    buttons: [
      Dialog.cancelButton({label: 'Skip'}),
      Dialog.okButton({label: "Submit", className: GIT_REPO}),
    ]
  }).then(result => {
    if (result.button.className == GIT_REPO) {
      console.log("Got repo result:", result.value);
      return http_client.configureModelBuild(result.value)
    }
  }).then(ILabResult => {
      if (ILabResult && !ILabResult.status) {
        dialogBuild(ILabResult.stderr);
      }
  }).catch(e => {
    console.error("an error occured", e);
  })
}


function dialogServe(warnText? :string) {
  showDialog({
    title: 'Model to serve',
    body: new ModelPromptForm(warnText),
    buttons: [
      Dialog.cancelButton({label: 'Skip'}),
      Dialog.okButton({label: "Submit", className: GIT_REPO}),
    ]
  }).then(result => {
    if (result.button.className == GIT_REPO) {
      console.log("Got repo result:", result.value);
      return http_client.configureModelServe(result.value)
    }
  }).then(ILabResult => {
      if (ILabResult && !ILabResult.status) {
        dialogServe(ILabResult.stderr);
      }
  }).catch(e => {
    console.error("an error occured", e);
  })
}

function dialogTest(warnText? :string) {
  showDialog({
    title: 'Container to test',
    body: new ProjectPromptForm(warnText),
    buttons: [
      Dialog.cancelButton({label: 'Skip'}),
      Dialog.okButton({label: "Submit", className: GIT_REPO}),
    ]
  }).then(result => {
    if (result.button.className == GIT_REPO) {
      console.log("Got repo result:", result.value);
      return http_client.configureModelTest(result.value)
    }
  }).then(ILabResult => {
      if (ILabResult && !ILabResult.status) {
        dialogTest(ILabResult.stderr);
      }
  }).catch(e => {
    console.error("an error occured", e);
  })
}


/**
 * Initialization data for the jupyterlab_myext extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_myext',
  autoStart: true,
  requires: [IMainMenu, ICommandPalette],
  activate: activate_custom_menu
};


export default extension;

export const BookMarks = [
    {
        name: 'MLFlow Tracking UI',
        url: 'http://gid-mlflow.appspot.com',
        description: 'MLFlow Tracking UI',
        target: 'widget'
    },
    {
        name: 'Clone model',
        url: '/mlflow/gitclone',
        description: 'MLFlow clone model',
        target: 'gitclone'
    },
   {
        name: 'Run model',
        url: '/mlflow/run',
        description: 'MLFlow run model',
        target: 'runmodel'
    },
    {
        name: 'Build model',
        url: '/mlflow/build',
        description: 'MLFlow build model',
        target: 'buildmodel'
    },
    {
        name: 'Serve model',
        url: '/mlflow/serve',
        description: 'MLFlow serve model',
        target: 'servemodel'
    },
     {
        name: 'Test model',
        url: '/mlflow/test',
        description: 'MLFlow test model',
        target: 'testmodel'
    }

];

export function activate_custom_menu(app: JupyterLab, mainMenu: IMainMenu, palette:
    ICommandPalette): Promise<void>{

    // create new commands and add them to app.commands

    function appendNewCommand(item: any) {
        let iframe: IFrame = null;
        let command = `BookMark-${item.name}:show`;
        app.commands.addCommand(command, {

            label: item.name,
            execute: () => {
                if (item.target == '_blank') {
                    let win = window.open(item.url, '_blank');
                    win.focus();

                }
                else if (item.target == 'gitclone'){
                  dialogClone()
                }
                else if (item.target == 'runmodel'){
                  dialogRun()
                }
                else if (item.target == 'buildmodel'){
                  dialogBuild()
                }
                else if (item.target == 'servemodel'){
                  dialogServe()
                }
                else if (item.target == 'testmodel'){
                  dialogTest()
                }
                else if (item.target == 'widget') {
                    if (!iframe) {
                        iframe = new IFrame();
                        iframe.url = item.url;
                        iframe.id = item.name;
                        iframe.title.label = item.name;
                        iframe.title.closable = true;
                        iframe.node.style.overflowY = 'auto';
                    }

                    if (iframe == null || !iframe.isAttached) {
                        app.shell.addToMainArea(iframe);
                        app.shell.activateById(iframe.id);
                    } else {
                        app.shell.activateById(iframe.id);
                    }
                }
            }
        });
    }

    BookMarks.forEach(item => appendNewCommand(item));

    // add to mainMenu
    let menu = Private.createMenu(app);
    mainMenu.addMenu(menu, {rank: 80});
    return Promise.resolve(void 0);
}

/**
 * A namespace for help plugin private functions.
 */

namespace Private {

    /**
     * Creates a menu for the help plugin.
     */
    export function createMenu(app: JupyterLab): Menu {

        const {commands} = app;
        let menu:Menu = new Menu({commands});
        menu.title.label = 'MLFlow';
        BookMarks.forEach(item => menu.addItem({command: `BookMark-${item.name}:show`}));

        return menu;
    }
}
