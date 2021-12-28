from sqlalchemy import create_engine, event
from sqlalchemy.engine.base import Engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from .config import get_config

config = get_config()


def _fk_pragma_on_connect(e: Engine, _):
    # Thanks to conny for the SQLAlchemy foreign key pragma solution
    # https://stackoverflow.com/a/7831210/1730980

    e.execute('pragma foreign_keys=ON')


# create the sqlite engine
# set check_same_thread to False or sqlite will have issues if uvicorn
# changes threads while accessing the database
engine = create_engine(
    f'sqlite:///{config["sqlite_db"]}',
    connect_args={'check_same_thread': False}
)

# enable foreign key integry checks on sqlite
event.listen(engine, 'connect', _fk_pragma_on_connect)

# this creates our database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# this is the object that will define our database schema
Base = declarative_base()


def get_db() -> Session:
    """Returns a new database session."""

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
