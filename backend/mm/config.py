import os
import sys
from logging import Logger, getLogger
from logging.config import dictConfig
from typing import Dict

import yaml

DEFAULT_CONFIG_PATH = './config.yaml'
DEFAULT_LOGGING_CONFIG_PATH = './logging.yaml'


def run_once(f):
    def helper(*args, **kwargs):
        if not helper.has_run:
            helper.has_run = True
            helper.data = f(*args, **kwargs)

        return helper.data

    helper.has_run = False
    return helper


@run_once
def get_config() -> Dict[str, str]:
    path = os.getenv('CONFIG_PATH', DEFAULT_CONFIG_PATH)

    try:
        with open(path, 'r') as f:
            data = yaml.safe_load(f)
    except:
        print(
            f'Failed to read config file {path}', file=sys.stderr
        )
        sys.exit(1)

    return data


def get_logger() -> Logger:
    return getLogger('main')


def setup_logging() -> None:
    path = os.getenv('LOGGING_CONFIG_PATH', DEFAULT_LOGGING_CONFIG_PATH)

    try:
        with open(path, 'r') as f:
            data = yaml.safe_load(f)
    except:
        print(f'Failed to read logging config file {path}', file=sys.stderr)
        sys.exit(1)

    dictConfig(data)
