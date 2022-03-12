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
from ..schemas import HTTPExceptionSchema, MoviePropertySchema, StudioSchema

logger = get_logger()
router = APIRouter(prefix="/studios")


@router.post(
    "",
    response_model=StudioSchema,
    response_description="The created studio",
    responses={
        409: {
            "model": HTTPExceptionSchema,
            "description": "Duplicate Studio",
        },
    },
    summary="Add studio",
    tags=["studios"],
)
def studios_add(
    body: MoviePropertySchema,
    db: Session = Depends(get_db_session),
):
    try:
        name = body.name.strip()
        studio = crud.add_studio(db, name)

        logger.debug("Added studio %s", name)
    except DuplicateEntryException as e:
        logger.warn(str(e))

        raise HTTPException(status.HTTP_409_CONFLICT, detail={"message": str(e)})

    return studio


@router.delete(
    "/{id}",
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
    summary="Delete studio",
    tags=["studios"],
)
def studios_delete(
    id: int,
    db: Session = Depends(get_db_session),
):
    try:
        name = crud.delete_studio(db, id)
        logger.debug("Deleted studio %s", name)
    except IntegrityConstraintException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_412_PRECONDITION_FAILED, detail={"message": str(e)}
        )
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(status.HTTP_404_NOT_FOUND, detail={"message": str(e)})

    return {"message": f'Deleted studio "{name}" (ID {id})'}


@router.get(
    "",
    response_model=List[StudioSchema],
    response_description="A list of studios",
    summary="Get all studios",
    tags=["studios"],
)
def studios_get_all(db: Session = Depends(get_db_session)):
    return crud.get_all_studios(db)


@router.put(
    "/{id}",
    response_model=StudioSchema,
    response_description="The updated studio",
    responses={
        404: {
            "model": HTTPExceptionSchema,
            "description": "Invalid ID",
        },
        409: {
            "model": HTTPExceptionSchema,
            "description": "Duplicate Studio",
        },
        500: {
            "model": HTTPExceptionSchema,
            "description": "Path Error",
        },
    },
    summary="Rename studio",
    tags=["studios"],
)
def studios_update(
    id: int,
    body: MoviePropertySchema,
    db: Session = Depends(get_db_session),
):
    try:
        studio_name = crud.get_studio(db, id).name

        name = body.name.strip()
        studio = crud.update_studio(db, id, name)

        for movie in studio.movies:
            util.rename_movie_file(movie, studio_current=studio_name)
            db.commit()

        logger.debug("Renamed studio %s -> %s", studio_name, name)
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

    return studio
