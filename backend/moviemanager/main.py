from . import create_app
from .config import setup_logging
from .database import init_db

################################################################################
# setup logging and database connection

setup_logging()
init_db()

################################################################################
# create the FastAPI app

app = create_app()
