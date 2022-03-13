from pathlib import Path

import pytest
from pytest_mock import MockerFixture

from .. import crud
from ..database import get_db_session, init_db


@pytest.fixture(scope="module", autouse=True)
def setup_database(tmp_path_factory, module_mocker: MockerFixture):
    path: Path = tmp_path_factory.mktemp("database") / "db.sqlite3"
    module_mocker.patch(
        "moviemanager.database.get_sqlite_path", return_value=path.as_posix()
    )

    init_db()


@pytest.fixture()
def db():
    yield from get_db_session()


def test_add_actor(db):
    actor = crud.add_actor(db, "Josh Hartnett")

    assert actor.id == 1
    assert actor.name == "Josh Hartnett"
