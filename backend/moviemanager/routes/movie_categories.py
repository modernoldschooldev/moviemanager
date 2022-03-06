from fastapi import APIRouter, Depends, status
from fastapi.exceptions import HTTPException
from sqlalchemy.orm import Session

from .. import crud
from ..config import get_logger
from ..database import get_db_session
from ..exceptions import *
from ..schemas import *

logger = get_logger()
router = APIRouter()


@router.post(
    "/movie_category",
    response_model=MovieSchema,
    response_description="The updated movie information",
    responses={
        404: {
            "model": HTTPExceptionSchema,
            "description": "Invalid ID",
        },
        409: {
            "model": HTTPExceptionSchema,
            "description": "Duplicate Category",
        },
        500: {
            "model": HTTPExceptionSchema,
            "description": "Path Error",
        },
    },
    summary="Add category to movie",
    tags=["movie_category"],
)
def movie_category_add(
    movie_id: int,
    category_id: int,
    db: Session = Depends(get_db_session),
):
    try:
        movie, category = crud.add_movie_category(db, movie_id, category_id)
        logger.debug("Added category %s to movie %s", category.name, movie.filename)
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

    return movie


@router.delete(
    "/movie_category",
    response_model=MovieSchema,
    response_description="The updated movie information",
    responses={
        404: {
            "model": HTTPExceptionSchema,
            "description": "Invalid ID",
        },
        500: {
            "model": HTTPExceptionSchema,
            "description": "Path Error",
        },
    },
    summary="Delete category from movie",
    tags=["movie_category"],
)
def movie_category_delete(
    movie_id: int,
    category_id: int,
    db: Session = Depends(get_db_session),
):
    try:
        movie, category = crud.delete_movie_category(db, movie_id, category_id)
        logger.debug("Deleted category %s from movie %s", category.name, movie.filename)
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(status.HTTP_404_NOT_FOUND, detail={"message": str(e)})
    except PathException as e:
        logger.error(str(e))

        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"message": str(e)}
        )

    return movie
