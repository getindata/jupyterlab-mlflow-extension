"""
Setup Module to setup Python Handlers (Spark Handlers) for the Spark Extension.
"""
import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name='mlflow_handler',
    version='0.1.0',
    author='ING - Jaroslaw Osmanski',
    description="A server extension for JupyterLab that enables Spark integration",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=setuptools.find_packages(),
    install_requires=[
        'notebook',
        'docker',
        'gitpython',
        'pandas',
        'sklearn',
        'google-cloud-storage',
        'mlflow'
    ],
    package_data={'mlflow_handler': ['*']}
)
