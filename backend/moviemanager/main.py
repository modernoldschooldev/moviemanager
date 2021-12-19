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


@app.get('/')
def hello():
    return "Hello from FastAPI"


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


@app.get(
    '/movies',
    response_model=List[schemas.MovieFile]
)
def get_all_movies(db: Session = Depends(get_db)):
    return crud.get_all_movies(db)


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
