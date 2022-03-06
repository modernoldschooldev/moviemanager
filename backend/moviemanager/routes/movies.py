from fastapi import APIRouter, Depends, status
from fastapi.exceptions import HTTPException
from sqlalchemy.orm import Session

from .. import crud, util
from ..config import get_logger
from ..database import get_db_session
from ..exceptions import *
from ..schemas import *

logger = get_logger()
router = APIRouter()


@router.delete(
    "/movies/{id}",
    response_model=MessageSchema,
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
    summary="Delete movie and move file back to imports folder",
    tags=["movies"],
)
def movies_delete(
    id: int,
    db: Session = Depends(get_db_session),
):
    try:
        name = crud.delete_movie(db, id)
        logger.debug("Deleted movie %s", name)
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(status.HTTP_404_NOT_FOUND, detail={"message": str(e)})
    except PathException as e:
        logger.error(str(e))

        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"message": str(e)}
        )

    return {"message": f'Deleted movie "{name}" (ID {id})'}


@router.get(
    "/movies",
    response_model=List[MovieFileSchema],
    response_description="A list of movie IDs and filenames",
    summary="Get all movies",
    tags=["movies"],
)
def movies_get_all(db: Session = Depends(get_db_session)):
    return crud.get_all_movies(db)


@router.get(
    "/movies/{id}",
    response_model=MovieSchema,
    response_description="The requested movie information",
    responses={
        404: {
            "model": HTTPExceptionSchema,
            "description": "Invalid ID",
        },
    },
    summary="Get movie information",
    tags=["movies"],
)
def movies_get_one(id: int, db: Session = Depends(get_db_session)):
    movie = crud.get_movie(db, id)

    if movie is None:
        message = f"Movie ID {id} does not exist"
        logger.warn(message)

        raise HTTPException(status.HTTP_404_NOT_FOUND, detail={"message": message})

    return movie


@router.post(
    "/movies",
    response_model=List[MovieFileSchema],
    response_description="A list of the imported movie filenames and IDs",
    responses={
        409: {
            "model": HTTPExceptionSchema,
            "description": "Duplicate Movie",
        },
        500: {
            "model": HTTPExceptionSchema,
            "description": "Path Error",
        },
    },
    summary="Add movies from imports folder",
    tags=["movies"],
)
def movies_import(db: Session = Depends(get_db_session)):
    try:
        files = util.list_files(util.get_movie_path(util.PathType.IMPORT))
    except ListFilesException as e:
        logger.error(str(e))

        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"message": str(e)}
        )

    movies = []

    for file in files:
        # skip the .keep files
        if file == ".keep":
            continue

        (name, studio_id, series_id, series_number, actors) = util.parse_file_info(
            db, file
        )

        try:
            # attempt to migrate the file before adding to the DB
            # if this fails, we don't want a DB entry
            util.migrate_file(file)

            movie = crud.add_movie(
                db, file, name, studio_id, series_id, series_number, actors
            )
            movies.append(movie)

            logger.debug("Imported movie %s", movie.filename)
        except DuplicateEntryException as e:
            logger.warn(str(e))

            raise HTTPException(status.HTTP_409_CONFLICT, detail={"message": str(e)})
        except PathException as e:
            logger.error(str(e))

            raise HTTPException(
                status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"message": str(e)}
            )

    return movies


@router.put(
    "/movies/{id}",
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
    summary="Update movie information",
    tags=["movies"],
)
def movies_update(
    id: int,
    body: MovieUpdateSchema,
    db: Session = Depends(get_db_session),
):
    try:
        movie = crud.update_movie(db, id, body)
        logger.debug("Successfully updated movie %s", movie.filename)
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(status.HTTP_404_NOT_FOUND, detail={"message": str(e)})
    except PathException as e:
        logger.error(str(e))

        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"message": str(e)}
        )

    return movie
