from pathlib import Path

from setuptools import find_packages, setup

this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text()

setup(
    name="EinSolchesDing",
    version="0.0.1",
    description="EinSolchesDing created by Samuel Brinkmann",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=find_packages(),
    package_data={},
    scripts=[],
    install_requires=[
        "pandas<3.0.0", # Version 20/08/2024
        "pygame<3.0.0", # Version 20/08/2024
    ],
    extras_require={
        "test": ["pytest", "pylint!=2.5.0", "isort", "refurb"],
    },
    author="Samuel Brinkmann",
    license="MIT",
    tests_require=["pytest==4.4.1"],
    setup_requires=["pytest-runner"],
)