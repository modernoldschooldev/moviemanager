from fastapi import APIRouter, Depends, status
from fastapi.exceptions import HTTPException
from sqlalchemy.orm import Session

from .. import crud, util
from ..config import get_logger
from ..database import get_db_session
from ..exceptions import *
from ..schemas import *

logger = get_logger()
router = APIRouter(prefix="/series")


@router.post(
    "",
    response_model=SeriesSchema,
    response_description="The created series",
    responses={
        409: {
            "model": HTTPExceptionSchema,
            "description": "Duplicate Series",
        },
    },
    summary="Add series",
    tags=["series"],
)
def series_add(
    body: MoviePropertySchema,
    db: Session = Depends(get_db_session),
):
    try:
        name = body.name.strip()
        series = crud.add_series(db, name)

        logger.debug("Added series %s", name)
    except DuplicateEntryException as e:
        logger.warn(str(e))

        raise HTTPException(status.HTTP_409_CONFLICT, detail={"message": str(e)})

    return series


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
    summary="Delete series",
    tags=["series"],
)
def series_delete(
    id: int,
    db: Session = Depends(get_db_session),
):
    try:
        name = crud.delete_series(db, id)
        logger.debug("Deleted series %s", name)
    except IntegrityConstraintException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_412_PRECONDITION_FAILED, detail={"message": str(e)}
        )
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(status.HTTP_404_NOT_FOUND, detail={"message": str(e)})

    return {"message": f'Deleted series "{name}" (ID {id})'}


@router.get(
    path="",
    response_model=List[SeriesSchema],
    response_description="A list of series",
    summary="Get all series",
    tags=["series"],
)
def series_get_all(db: Session = Depends(get_db_session)):
    return crud.get_all_series(db)


@router.put(
    "/{id}",
    response_model=SeriesSchema,
    response_description="The updated series",
    responses={
        404: {
            "model": HTTPExceptionSchema,
            "description": "Invalid ID",
        },
        409: {
            "model": HTTPExceptionSchema,
            "description": "Duplicate Series",
        },
        500: {
            "model": HTTPExceptionSchema,
            "description": "Path Error",
        },
    },
    summary="Rename series",
    tags=["series"],
)
def series_update(
    id: int,
    body: MoviePropertySchema,
    db: Session = Depends(get_db_session),
):
    try:
        series_name = crud.get_series(db, id).name

        name = body.name.strip()
        series = crud.update_series(db, id, name)

        for movie in series.movies:
            util.rename_movie_file(movie, series_current=series_name)
            db.commit()

        logger.debug("Renamed series %s -> %s", series_name, name)
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

    return series
