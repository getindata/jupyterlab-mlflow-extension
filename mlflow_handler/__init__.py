from mlflow_handler.handlers import load_extension

def _jupyter_server_extension_paths():
    return [{"module": "mlflow_handler"}]


def _jupyter_nbextension_paths():
    return [{"section": "notebook", "dest": "mlflow_handler"}]


def load_jupyter_server_extension(nb_server_app):
    load_extension(nb_server_app)
