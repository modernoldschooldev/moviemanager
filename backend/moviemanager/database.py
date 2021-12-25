from sqlalchemy import create_engine, event
from sqlalchemy.engine.base import Engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


def _fk_pragma_on_connect(e: Engine, _):
    # Thanks to conny for the SQLAlchemy foreign key pragma solution
    # https://stackoverflow.com/a/7831210/1730980

    e.execute('pragma foreign_keys=ON')


engine = create_engine(
    'sqlite:///./sqlite.db',
    connect_args={'check_same_thread': False}
)
event.listen(engine, 'connect', _fk_pragma_on_connect)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
