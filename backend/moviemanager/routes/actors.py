from typing import List

from fastapi import APIRouter, Depends, status
from fastapi.exceptions import HTTPException
from sqlalchemy.orm import Session

from .. import crud, util
from ..config import get_logger
from ..database import get_db_session
from ..exceptions import (
    DuplicateEntryException,
    IntegrityConstraintException,
    InvalidIDException,
    PathException,
)
from ..schemas import (
    ActorSchema,
    HTTPExceptionSchema,
    MessageSchema,
    MoviePropertySchema,
)

logger = get_logger()
router = APIRouter(prefix="/actors")


@router.post(
    "",
    response_model=ActorSchema,
    response_description="The created actor",
    responses={
        409: {
            "model": HTTPExceptionSchema,
            "description": "Duplicate Actor",
        },
    },
    summary="Add actor",
    tags=["actors"],
)
def actors_add(
    body: MoviePropertySchema,
    db: Session = Depends(get_db_session),
):
    try:
        name = body.name.strip()

        actor = crud.add_actor(db, name)
        logger.debug("Added new actor %s", name)
    except DuplicateEntryException as e:
        logger.warn(str(e))

        raise HTTPException(status.HTTP_409_CONFLICT, detail={"message": str(e)})

    return actor


@router.delete(
    "/{id}",
    response_model=MessageSchema,
    responses={
        404: {
            "model": HTTPExceptionSchema,
            "description": "Invalid ID",
        },
        412: {
            "model": HTTPExceptionSchema,
            "description": "Integrity Constraint Failed",
        },
    },
    summary="Delete actor",
    tags=["actors"],
)
def actors_delete(
    id: int,
    db: Session = Depends(get_db_session),
):
    try:
        name = crud.delete_actor(db, id)
        logger.debug("Deleted actor %s", name)
    except IntegrityConstraintException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_412_PRECONDITION_FAILED, detail={"message": str(e)}
        )
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(status.HTTP_404_NOT_FOUND, detail={"message": str(e)})

    return {"message": f'Deleted actor "{name}" (ID {id})'}


@router.get(
    "",
    response_model=List[ActorSchema],
    response_description="A list of actors",
    summary="Get all actors",
    tags=["actors"],
)
def actors_get_all(db: Session = Depends(get_db_session)):
    return crud.get_all_actors(db)


@router.put(
    "/{id}",
    response_model=ActorSchema,
    response_description="The updated actor",
    responses={
        404: {
            "model": HTTPExceptionSchema,
            "description": "Invalid ID",
        },
        409: {
            "model": HTTPExceptionSchema,
            "description": "Duplicate Actor",
        },
        500: {
            "model": HTTPExceptionSchema,
            "description": "Path Error",
        },
    },
    summary="Rename actor",
    tags=["actors"],
)
def actors_update(
    id: int,
    body: MoviePropertySchema,
    db: Session = Depends(get_db_session),
):
    try:
        actor_name = crud.get_actor(db, id).name

        name = body.name.strip()
        actor = crud.update_actor(db, id, name)

        for movie in actor.movies:
            util.rename_movie_file(movie, actor_current=actor_name)
            db.commit()

        logger.debug("Renamed actor %s -> %s", actor_name, name)
    except DuplicateEntryException as e:
        logger.warn(str(e))

        raise HTTPException(status.HTTP_409_CONFLICT, detail={"message": str(e)})
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(status.HTTP_404_NOT_FOUND, detail={"message": str(e)})
    except PathException as e:
        logger.error(str(e))

        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"message": str(e)}
        )

    return actor
