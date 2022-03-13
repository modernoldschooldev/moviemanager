import sqlite3
from pathlib import Path

import pytest
from pytest_mock import MockerFixture

from .. import crud
from ..database import get_db_session, init_db
from ..exceptions import DuplicateEntryException


@pytest.fixture(scope="module", autouse=True)
def setup_database(tmp_path_factory, module_mocker: MockerFixture, request):
    path: Path = tmp_path_factory.mktemp("database") / "db.sqlite3"
    module_mocker.patch(
        "moviemanager.database.get_sqlite_path", return_value=path.as_posix()
    )

    connection = sqlite3.connect(path.as_posix())
    filename = Path(request.fspath).parent / "data" / "init.sql"

    with open(filename, "r") as f:
        connection.executescript(f.read())

    init_db()


@pytest.fixture()
def db():
    yield from get_db_session()


def test_add_actor(db):
    actor = crud.add_actor(db, "Josh Hartnett")
    actor2 = crud.get_actor(db, actor.id)

    assert actor.name == "Josh Hartnett"
    assert actor2.name == "Josh Hartnett"


def test_add_actor_duplicate(db):
    with pytest.raises(DuplicateEntryException):
        crud.add_actor(db, "Tom Hanks")


def test_get_actor(db):
    actor = crud.get_actor(db, 1)

    assert actor.name == "Christian Bale"


def test_get_actor_by_name(db):
    name = "Robin Williams"
    actor = crud.get_actor_by_name(db, name)

    assert actor.name == name
    assert actor.id == 2


def test_get_actor_by_name_not_found(db):
    actor = crud.get_actor_by_name(db, "xxxxxxxxxxxxxxxx")

    assert actor is None
