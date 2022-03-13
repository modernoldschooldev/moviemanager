import os
import sys
from logging import Logger, getLogger
from logging.config import dictConfig

import yaml

DEFAULT_DB_PATH = "./db"

################################################################################
# config functions


def get_db_path() -> str:
    """Returns the movie DB path."""

    return os.getenv("MM_DB_PATH", DEFAULT_DB_PATH)


def get_log_config() -> str:
    """Returns the logging config path."""

    path_override = os.getenv("MM_LOG_CONFIG_PATH")

    if path_override is not None:
        path = path_override
    else:
        path = f"{get_db_path()}/logging.yaml"

    return path


def get_logger() -> Logger:
    """Returns the application logger."""

    return getLogger("moviemanager")


def get_sqlite_path() -> str:
    """Returns path to the sqlite DB file."""

    path = os.getenv("MM_SQLITE_PATH", f"{get_db_path()}/sqlite.db")

    return f"sqlite:///{path}"


def setup_logging() -> None:
    """Configures logging for the application using the yaml config file."""

    path = get_log_config()

    try:
        with open(path, "r") as f:
            data = yaml.safe_load(f)
    except OSError:
        logger = getLogger()
        logger.critical("Failed to read the logging config file %s", path)

        sys.exit(1)

    dictConfig(data)
