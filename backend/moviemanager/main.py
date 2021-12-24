from typing import List

from fastapi import Depends, FastAPI, status
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, schemas
from .config import get_config
from .database import SessionLocal, engine
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
        }
    },
)
def add_actor(
    data: schemas.MoviePropertySchema,
    db: Session = Depends(get_db)
):
    # TODO: trim whitespace
    actor = crud.add_actor(db, data.name)

    if actor is None:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': f'Actor {data.name} already in database'}
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
        }
    },
)
def add_category(
    data: schemas.MoviePropertySchema,
    db: Session = Depends(get_db)
):
    # TODO: trim whitespace
    category = crud.add_category(db, data.name)

    if category is None:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': f'Category {data.name} already in database'}
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
        }
    },
)
def add_movie_actor(
    movie_id: int,
    actor_id: int,
    db: Session = Depends(get_db)
):
    movie = crud.add_movie_actor(db, movie_id, actor_id)

    # TODO: error code is overly broad
    if movie is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={
                'message':
                f'Movie ID {movie_id} or Actor ID {actor_id} does not exist'
            }
        )

    return movie


@app.delete(
    '/movie_actor',
    response_model=schemas.Movie,
    responses={
        404: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Invalid ID'
        }
    },
)
def delete_movie_actor(
    movie_id: int,
    actor_id: int,
    db: Session = Depends(get_db)
):
    movie = crud.delete_movie_actor(db, movie_id, actor_id)

    # TODO: error code overly broad
    if movie is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={
                'message':
                f'Movie ID {movie_id} or Actor ID {actor_id} does not exist'
            }
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
        }
    },
)
def add_movie_category(
    movie_id: int,
    category_id: int,
    db: Session = Depends(get_db)
):
    movie = crud.add_movie_category(db, movie_id, category_id)

    # TODO: error code overly broad
    if movie is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={
                'message':
                f'Movie ID {movie_id} or Category ID {category_id} does not exist'
            }
        )

    return movie


@app.delete(
    '/movie_category',
    response_model=schemas.Movie,
    responses={
        404: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Invalid ID'
        }
    },
)
def delete_movie_category(
    movie_id: int,
    category_id: int,
    db: Session = Depends(get_db)
):
    movie = crud.delete_movie_category(db, movie_id, category_id)

    # TODO: error code overly broad
    if movie is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={
                'message':
                f'Movie ID {movie_id} or Category ID {category_id} does not exist'
            }
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
        }
    },
)
def get_movie(id: int, db: Session = Depends(get_db)):
    movie = crud.get_movie(db, id)

    if movie is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': f'Movie with id {id} does not exist'}
        )

    return movie


@app.post(
    '/movies',
    response_model=List[schemas.Movie],
    responses={
        500: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'A fatal error'
        }
    }
)
def import_movies(db: Session = Depends(get_db)):
    try:
        files = list_files(config['imports'])
    except Exception as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={'message': str(e)}
        )

    # TODO: can this be a list comprehension with a generator expression?
    movies = []

    for file in files:
        name, studio_id, series_id, series_number, actors = \
            parse_filename(db, file)
        movie = crud.add_movie(
            db, file, name, studio_id, series_id, series_number, actors
        )

        # TODO: should this throw an exception?
        if movie is not None:
            movies.append(movie)

    return movies


@app.put(
    '/movies/{id}',
    response_model=schemas.Movie,
    responses={
        404: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Invalid ID'
        }
    },
)
def update_movie_data(
    id: int,
    data: schemas.MovieUpdateSchema,
    db: Session = Depends(get_db)
):
    movie = crud.update_movie(db, id, data)

    if movie is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': f'Movie with id {id} does not exist'}
        )

    return movie


@app.delete(
    '/movies/{id}'
)
def delete_movie(
    id: int,
    db: Session = Depends(get_db)
):
    crud.delete_movie(db, id)

    # TODO: what if movie doesn't exist?
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
        }
    },
)
def add_series(
    data: schemas.MoviePropertySchema,
    db: Session = Depends(get_db)
):
    # TODO: trim whitespace
    series = crud.add_series(db, data.name)

    if series is None:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': f'Series {data.name} already in database'}
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
        }
    },
)
def add_studio(
    data: schemas.MoviePropertySchema,
    db: Session = Depends(get_db)
):
    # TODO: trim whitespace
    studio = crud.add_studio(db, data.name)

    if studio is None:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': f'Studio {data.name} already in database'}
        )

    return studio

# TODO: add endpoints for deleting/updating actor/category/series/studio
