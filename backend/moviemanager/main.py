from typing import List

from fastapi import Depends, FastAPI, status
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, schemas
from .config import get_config
from .database import SessionLocal, engine
from .exceptions import (DuplicateEntryException, InvalidIDException,
                         ListFilesException, PathException)
from .models import Base
from .util import list_files, parse_filename

config = get_config()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r'https?://(?:127\.0\.0\.1|localhost):300[0-9]',
    allow_methods=['*'],
    allow_headers=['*'],
)

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

################################################################################
# Root Endpoint


@app.get('/')
def hello():
    return "Hello from FastAPI"

################################################################################
# /actors endpoints


@app.get(
    '/actors',
    response_model=List[schemas.Actor]
)
def get_all_actors(db: Session = Depends(get_db)):
    return crud.get_all_actors(db)


@app.post(
    '/actors',
    response_model=schemas.Actor,
    responses={
        409: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Duplicate Actor'
        },
    },
)
def add_actor(
    data: schemas.MoviePropertySchema,
    db: Session = Depends(get_db)
):
    try:
        actor = crud.add_actor(db, data.name.strip())
    except DuplicateEntryException as e:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': str(e)}
        )

    return actor

################################################################################
# /categories endpoints


@app.get(
    '/categories',
    response_model=List[schemas.Category]
)
def get_all_categories(db: Session = Depends(get_db)):
    return crud.get_all_categories(db)


@app.post(
    '/categories',
    response_model=schemas.Category,
    responses={
        409: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Duplicate Category'
        },
    },
)
def add_category(
    data: schemas.MoviePropertySchema,
    db: Session = Depends(get_db)
):
    try:
        category = crud.add_category(db, data.name.strip())
    except DuplicateEntryException as e:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': str(e)}
        )

    return category

################################################################################
# /movie_actor endpoints


@app.post(
    '/movie_actor',
    response_model=schemas.Movie,
    responses={
        404: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Invalid ID'
        },
        409: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Duplicate Actor'
        },
        500: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Path Error'
        },
    },
)
def add_movie_actor(
    movie_id: int,
    actor_id: int,
    db: Session = Depends(get_db)
):
    try:
        movie = crud.add_movie_actor(db, movie_id, actor_id)
    except DuplicateEntryException as e:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': str(e)}
        )
    except InvalidIDException as e:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )
    except PathException as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={'message': str(e)}
        )

    return movie


@app.delete(
    '/movie_actor',
    response_model=schemas.Movie,
    responses={
        404: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Invalid ID'
        },
        500: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Path Error'
        },
    },
)
def delete_movie_actor(
    movie_id: int,
    actor_id: int,
    db: Session = Depends(get_db)
):
    try:
        movie = crud.delete_movie_actor(db, movie_id, actor_id)
    except InvalidIDException as e:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )
    except PathException as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={'message': str(e)}
        )

    return movie

################################################################################
# /movie_category endpoints


@app.post(
    '/movie_category',
    response_model=schemas.Movie,
    responses={
        404: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Invalid ID'
        },
        409: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Duplicate Category'
        },
        500: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Path Error'
        },
    },
)
def add_movie_category(
    movie_id: int,
    category_id: int,
    db: Session = Depends(get_db)
):
    try:
        movie = crud.add_movie_category(db, movie_id, category_id)
    except DuplicateEntryException as e:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': str(e)}
        )
    except InvalidIDException as e:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )
    except PathException as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={'message': str(e)}
        )

    return movie


@app.delete(
    '/movie_category',
    response_model=schemas.Movie,
    responses={
        404: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Invalid ID'
        },
        500: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Path Error'
        },
    },
)
def delete_movie_category(
    movie_id: int,
    category_id: int,
    db: Session = Depends(get_db)
):
    try:
        movie = crud.delete_movie_category(db, movie_id, category_id)
    except InvalidIDException as e:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )
    except PathException as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={'message': str(e)}
        )

    return movie

################################################################################
# /movies endpoints


@app.get(
    '/movies',
    response_model=List[schemas.MovieFile]
)
def get_all_movies(db: Session = Depends(get_db)):
    return crud.get_all_movies(db)


@app.get(
    '/movies/{id}',
    response_model=schemas.Movie,
    responses={
        404: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Invalid ID'
        },
    },
)
def get_movie(id: int, db: Session = Depends(get_db)):
    movie = crud.get_movie(db, id)

    if movie is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': f'Movie ID {id} does not exist'}
        )

    return movie


@app.post(
    '/movies',
    response_model=List[schemas.Movie],
    responses={
        409: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Duplicate Movie'
        },
        500: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Path Error'
        },
    }
)
def import_movies(db: Session = Depends(get_db)):
    try:
        files = list_files(config['imports'])
    except ListFilesException as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={'message': str(e)}
        )

    movies = []

    for file in files:
        name, studio_id, series_id, series_number, actors = \
            parse_filename(db, file)

        try:
            movie = crud.add_movie(
                db, file, name, studio_id, series_id, series_number, actors
            )
            movies.append(movie)
        except DuplicateEntryException as e:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                detail={'message': str(e)}
            )
        except PathException as e:
            raise HTTPException(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={'message': str(e)}
            )

    return movies


@app.put(
    '/movies/{id}',
    response_model=schemas.Movie,
    responses={
        404: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Invalid ID'
        },
        500: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Path Error'
        },
    },
)
def update_movie_data(
    id: int,
    data: schemas.MovieUpdateSchema,
    db: Session = Depends(get_db)
):
    try:
        movie = crud.update_movie(db, id, data)
    except InvalidIDException as e:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )
    except PathException as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={'message': str(e)}
        )

    return movie


@app.delete(
    '/movies/{id}',
    responses={
        404: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Invalid ID'
        },
        500: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Path Error'
        },
    },
)
def delete_movie(
    id: int,
    db: Session = Depends(get_db)
):
    try:
        crud.delete_movie(db, id)
    except InvalidIDException as e:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )
    except PathException as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={'message': str(e)}
        )

    return {
        'message': f'Deleted movie with ID {id}'
    }

################################################################################
# /series endpoints


@app.get(
    '/series',
    response_model=List[schemas.Series]
)
def get_all_series(db: Session = Depends(get_db)):
    return crud.get_all_series(db)


@app.post(
    '/series',
    response_model=schemas.Series,
    responses={
        409: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Duplicate Series'
        },
    },
)
def add_series(
    data: schemas.MoviePropertySchema,
    db: Session = Depends(get_db)
):
    try:
        series = crud.add_series(db, data.name.strip())
    except DuplicateEntryException as e:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': str(e)}
        )

    return series

################################################################################
# /studios endpoints


@app.get(
    '/studios',
    response_model=List[schemas.Studio]
)
def get_all_studios(db: Session = Depends(get_db)):
    return crud.get_all_studios(db)


@app.post(
    '/studios',
    response_model=schemas.Studio,
    responses={
        409: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Duplicate Studio'
        },
    },
)
def add_studio(
    data: schemas.MoviePropertySchema,
    db: Session = Depends(get_db)
):
    try:
        studio = crud.add_studio(db, data.name.strip())
    except DuplicateEntryException as e:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': str(e)}
        )

    return studio
