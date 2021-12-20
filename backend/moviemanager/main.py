from os.path import splitext
from typing import List

from fastapi import Depends, FastAPI, status
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, schemas
from .config import get_config
from .database import SessionLocal, engine
from .models import Base
from .util import list_files

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
    category = crud.add_category(db, data.name)

    if category is None:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': f'Category {data.name} already in database'}
        )

    return category

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

    movies = []

    for file in files:
        name, _ = splitext(file)
        movie = crud.add_movie(db, file, name)

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
    studio = crud.add_studio(db, data.name)

    if studio is None:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': f'Studio {data.name} already in database'}
        )

    return studio
