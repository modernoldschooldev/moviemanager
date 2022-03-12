from fastapi import APIRouter, Depends, status
from fastapi.exceptions import HTTPException
from sqlalchemy.orm import Session

from .. import crud
from ..config import get_logger
from ..database import get_db_session
from ..exceptions import *
from ..schemas import *

logger = get_logger()
router = APIRouter(prefix="/movie_actor")


@router.post(
    "",
    response_model=MovieSchema,
    response_description="The updated movie information",
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
    summary="Add actor to movie",
    tags=["movie_actor"],
)
def movie_actor_add(
    movie_id: int,
    actor_id: int,
    db: Session = Depends(get_db_session),
):
    try:
        movie, actor = crud.add_movie_actor(db, movie_id, actor_id)
        logger.debug("Added actor %s to movie %s", actor.name, movie.filename)
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
    "",
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
    summary="Delete actor from movie",
    tags=["movie_actor"],
)
def movie_actor_delete(
    movie_id: int,
    actor_id: int,
    db: Session = Depends(get_db_session),
):
    try:
        movie, actor = crud.delete_movie_actor(db, movie_id, actor_id)
        logger.debug("Deleted actor %s from movie %s", actor.name, movie.filename)
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(status.HTTP_404_NOT_FOUND, detail={"message": str(e)})
    except PathException as e:
        logger.error(str(e))

        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"message": str(e)}
        )

    return movie
