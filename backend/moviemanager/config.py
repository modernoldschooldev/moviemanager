import os
import sys
from logging import Logger, getLogger
from logging.config import dictConfig
from typing import Dict, Tuple

import yaml

DEFAULT_CONFIG_PATH = './config.yaml'
DEFAULT_LOGGING_PATH = './logging.yaml'

################################################################################
# function decorator


def run_once(f):
    def helper(*args, **kwargs):
        if not helper.has_run:
            helper.has_run = True
            helper.data = f(*args, **kwargs)

        return helper.data

    helper.has_run = False
    return helper

################################################################################
# config functions


def init() -> Tuple[Logger, Dict[str, str]]:
    setup_logging()

    logger = get_logger()
    config = get_config()

    return (logger, config)


@run_once
def get_config() -> Dict[str, str]:
    path = os.getenv('MM_CONFIG_PATH', DEFAULT_CONFIG_PATH)

    try:
        with open(path, 'r') as f:
            data = yaml.safe_load(f)
    except:
        logger = getLogger()
        logger.critical('Failed to read the config file %s', path)

        sys.exit(1)

    return data


def get_logger() -> Logger:
    return getLogger('moviemanager')


def setup_logging() -> None:
    path = os.getenv('MM_LOGGING_PATH', DEFAULT_LOGGING_PATH)

    try:
        with open(path, 'r') as f:
            data = yaml.safe_load(f)
    except:
        logger = getLogger()
        logger.critical('Failed to read the logging config file %s', path)

        sys.exit(1)

    dictConfig(data)
