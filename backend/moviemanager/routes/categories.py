from typing import List

from fastapi import APIRouter, Depends, status
from fastapi.exceptions import HTTPException
from sqlalchemy.orm import Session

from .. import crud, models, util
from ..config import get_logger
from ..database import get_db_session
from ..exceptions import (
    DuplicateEntryException,
    IntegrityConstraintException,
    InvalidIDException,
    PathException,
)
from ..schemas import (
    CategorySchema,
    HTTPExceptionSchema,
    MessageSchema,
    MoviePropertySchema,
)

logger = get_logger()
router = APIRouter(prefix="/categories")


@router.post(
    "",
    response_model=CategorySchema,
    response_description="The created category",
    responses={
        409: {
            "model": HTTPExceptionSchema,
            "description": "Duplicate Category",
        },
    },
    summary="Add category",
    tags=["categories"],
)
def categories_add(
    body: MoviePropertySchema,
    db: Session = Depends(get_db_session),
):
    try:
        name = body.name.strip()
        category = crud.add_category(db, name)

        logger.debug("Added category %s", name)
    except DuplicateEntryException as e:
        logger.warn(str(e))

        raise HTTPException(status.HTTP_409_CONFLICT, detail={"message": str(e)})

    return category


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
    summary="Delete category",
    tags=["categories"],
)
def categories_delete(
    id: int,
    db: Session = Depends(get_db_session),
):
    try:
        name = crud.delete_category(db, id)
        logger.debug("Deleted category %s", name)
    except IntegrityConstraintException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_412_PRECONDITION_FAILED, detail={"message": str(e)}
        )
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(status.HTTP_404_NOT_FOUND, detail={"message": str(e)})

    return {"message": f'Deleted category "{name}" (ID {id})'}


@router.get(
    "",
    response_model=List[CategorySchema],
    response_description="A list of categories",
    summary="Get all categories",
    tags=["categories"],
)
def categories_get_all(db: Session = Depends(get_db_session)):
    return crud.get_all_categories(db)


@router.put(
    "/{id}",
    response_model=CategorySchema,
    response_description="The updated category",
    responses={
        404: {
            "model": HTTPExceptionSchema,
            "description": "Invalid ID",
        },
        409: {"model": HTTPExceptionSchema, "description": "Duplicate Category"},
        500: {
            "model": HTTPExceptionSchema,
            "description": "Path Error",
        },
    },
    summary="Rename category",
    tags=["categories"],
)
def categories_update(
    id: int,
    body: MoviePropertySchema,
    db: Session = Depends(get_db_session),
):
    try:
        category_name = crud.get_category(db, id).name

        name = body.name.strip()
        category = crud.update_category(db, id, name)

        movie: models.Movie
        for movie in category.movies:
            util.update_category_link(movie.filename, category_name, False)
            util.update_category_link(movie.filename, name, True)

        logger.debug("Renamed category %s -> %s", category_name, name)
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

    return category
