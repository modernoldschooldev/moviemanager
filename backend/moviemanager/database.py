from sqlalchemy import create_engine, event
from sqlalchemy.engine import Connection
from sqlalchemy.orm import Session, sessionmaker

from . import models
from .config import get_sqlite_path

__factory = None


def _fk_pragma_on_connect(conn: Connection, _):
    # Thanks to conny for the SQLAlchemy foreign key pragma solution
    # https://stackoverflow.com/a/7831210/1730980

    conn.execute("pragma foreign_keys=ON")


def get_db_session() -> Session:
    """Returns a new database session."""

    if __factory is None:
        raise Exception("Must call init_db first!")

    with __factory() as db:
        yield db


def init_db() -> None:
    global __factory

    # create the sqlite engine
    # set check_same_thread to False or sqlite will have issues if uvicorn
    # changes threads while accessing the database
    engine = create_engine(
        f"sqlite:///{get_sqlite_path()}",
        echo=False,
        connect_args={"check_same_thread": False},
    )

    # enable foreign key integry checks on sqlite
    event.listen(engine, "connect", _fk_pragma_on_connect)

    # this creates our database sessions
    __factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # create sqlite database table schemas
    models.TableBase.metadata.create_all(bind=engine)
