from typing import List

from fastapi import Depends, FastAPI, status
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, schemas, util
from .config import init
from .database import SessionLocal, engine
from .exceptions import (DuplicateEntryException, IntegrityConstraintException,
                         InvalidIDException, ListFilesException, PathException)
from .models import Base

# setup logging and get app configuration
logger, config = init()

# create FastAPI application
app = FastAPI()

# add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r'https?://(?:127\.0\.0\.1|localhost):300[0-9]',
    allow_methods=['*'],
    allow_headers=['*'],
)

# create Sqlite database schema
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
            'description': 'Duplicate Actor',
        },
    },
)
def add_actor(
    data: schemas.MoviePropertySchema,
    db: Session = Depends(get_db)
):

    try:
        name = data.name.strip()

        actor = crud.add_actor(db, name)
        logger.debug('Added new actor %s', name)
    except DuplicateEntryException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': str(e)}
        )

    return actor


@app.put(
    '/actors/{id}',
    response_model=schemas.Actor,
    responses={
        404: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        409: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Duplicate Actor',
        },
        500: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Path Error',
        },
    }
)
def update_actor(
    id: int,
    data: schemas.MoviePropertySchema,
    db: Session = Depends(get_db)
):
    try:
        actor_name = crud.get_actor(db, id).name

        name = data.name.strip()
        actor = crud.update_actor(db, id, name)

        for movie in actor.movies:
            util.rename_movie_file(movie, actor_current=actor_name)
            db.commit()

        logger.debug('Renamed actor %s -> %s', actor_name, name)
    except DuplicateEntryException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': str(e)}
        )
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )
    except PathException as e:
        logger.error(str(e))

        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={'message': str(e)}
        )

    return actor


@app.delete(
    '/actors/{id}',
    responses={
        404: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        412: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Integrity Constraint Failed',
        },
    }
)
def delete_actor(
    id: int,
    db: Session = Depends(get_db)
):
    try:
        name = crud.delete_actor(db, id)
        logger.debug('Deleted actor %s', name)
    except IntegrityConstraintException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_412_PRECONDITION_FAILED,
            detail={'message': str(e)}
        )
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )

    return {
        'message': f'Deleted actor "{name}" (ID {id})'
    }

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
            'description': 'Duplicate Category',
        },
    },
)
def add_category(
    data: schemas.MoviePropertySchema,
    db: Session = Depends(get_db)
):
    try:
        name = data.name.strip()
        category = crud.add_category(db, name)

        logger.debug('Added category %s', name)
    except DuplicateEntryException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': str(e)}
        )

    return category


@app.put(
    '/categories/{id}',
    response_model=schemas.Category,
    responses={
        404: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        409: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Duplicate Category'
        },
        500: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Path Error',
        },
    }
)
def update_category(
    id: int,
    data: schemas.MoviePropertySchema,
    db: Session = Depends(get_db)
):
    try:
        category_name = crud.get_category(db, id).name

        name = data.name.strip()
        category = crud.update_category(db, id, name)

        for movie in category.movies:
            util.rename_movie_file(movie, category_current=category_name)
            db.commit()

        logger.debug('Renamed category %s -> %s', category_name, name)
    except DuplicateEntryException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': str(e)}
        )
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )
    except PathException as e:
        logger.error(str(e))

        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={'message': str(e)}
        )

    return category


@app.delete(
    '/categories/{id}',
    responses={
        404: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        412: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Integrity Constraint Failed',
        },
    }
)
def delete_category(
    id: int,
    db: Session = Depends(get_db)
):
    try:
        name = crud.delete_category(db, id)
        logger.debug('Deleted category %s', name)
    except IntegrityConstraintException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_412_PRECONDITION_FAILED,
            detail={'message': str(e)}
        )
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )

    return {
        'message': f'Deleted category "{name}" (ID {id})'
    }

################################################################################
# /movie_actor endpoints


@app.post(
    '/movie_actor',
    response_model=schemas.Movie,
    responses={
        404: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        409: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Duplicate Actor',
        },
        500: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Path Error',
        },
    },
)
def add_movie_actor(
    movie_id: int,
    actor_id: int,
    db: Session = Depends(get_db)
):
    try:
        movie, actor = crud.add_movie_actor(db, movie_id, actor_id)
        logger.debug('Added actor %s to movie %s', actor.name, movie.filename)
    except DuplicateEntryException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': str(e)}
        )
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )
    except PathException as e:
        logger.error(str(e))

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
            'description': 'Invalid ID',
        },
        500: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Path Error',
        },
    },
)
def delete_movie_actor(
    movie_id: int,
    actor_id: int,
    db: Session = Depends(get_db)
):
    try:
        movie, actor = crud.delete_movie_actor(db, movie_id, actor_id)
        logger.debug(
            'Deleted actor %s from movie %s', actor.name, movie.filename
        )
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )
    except PathException as e:
        logger.error(str(e))

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
            'description': 'Invalid ID',
        },
        409: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Duplicate Category',
        },
        500: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Path Error',
        },
    },
)
def add_movie_category(
    movie_id: int,
    category_id: int,
    db: Session = Depends(get_db)
):
    try:
        movie, category = crud.add_movie_category(db, movie_id, category_id)
        logger.debug(
            'Added category %s to movie %s', category.name, movie.filename
        )
    except DuplicateEntryException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': str(e)}
        )
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )
    except PathException as e:
        logger.error(str(e))

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
            'description': 'Invalid ID',
        },
        500: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Path Error',
        },
    },
)
def delete_movie_category(
    movie_id: int,
    category_id: int,
    db: Session = Depends(get_db)
):
    try:
        movie, category = crud.delete_movie_category(db, movie_id, category_id)
        logger.debug(
            'Deleted category %s from movie %s', category.name, movie.filename
        )
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )
    except PathException as e:
        logger.error(str(e))

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
            'description': 'Invalid ID',
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
            'description': 'Duplicate Movie',
        },
        500: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Path Error',
        },
    }
)
def import_movies(db: Session = Depends(get_db)):
    try:
        files = util.list_files(config['imports'])
    except ListFilesException as e:
        logger.error(str(e))

        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={'message': str(e)}
        )

    movies = []

    for file in files:
        (
            name,
            studio_id,
            series_id,
            series_number,
            actors
        ) = util.parse_file_info(db, file)

        try:
            # attempt to migrate the file before adding to the DB
            # if this fails, we don't want a DB entry
            util.migrate_file(file)

            movie = crud.add_movie(
                db, file, name, studio_id, series_id, series_number, actors
            )
            movies.append(movie)

            logger.debug('Imported movie %s', movie.filename)
        except DuplicateEntryException as e:
            logger.warn(str(e))

            raise HTTPException(
                status.HTTP_409_CONFLICT,
                detail={'message': str(e)}
            )
        except PathException as e:
            logger.error(str(e))

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
            'description': 'Invalid ID',
        },
        500: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Path Error',
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
        logger.debug('Successfully updated movie %s', movie.filename)
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )
    except PathException as e:
        logger.error(str(e))

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
            'description': 'Invalid ID',
        },
        500: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Path Error',
        },
    },
)
def delete_movie(
    id: int,
    db: Session = Depends(get_db)
):
    try:
        name = crud.delete_movie(db, id)
        logger.debug('Deleted movie %s', name)
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )
    except PathException as e:
        logger.error(str(e))

        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={'message': str(e)}
        )

    return {
        'message': f'Deleted movie "{name}" (ID {id})'
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
            'description': 'Duplicate Series',
        },
    },
)
def add_series(
    data: schemas.MoviePropertySchema,
    db: Session = Depends(get_db)
):
    try:
        name = data.name.strip()
        series = crud.add_series(db, name)

        logger.debug('Added series %s', name)
    except DuplicateEntryException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': str(e)}
        )

    return series


@app.put(
    '/series/{id}',
    response_model=schemas.Series,
    responses={
        404: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        409: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Duplicate Series',
        },
        500: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Path Error',
        },
    }
)
def update_series(
    id: int,
    data: schemas.MoviePropertySchema,
    db: Session = Depends(get_db)
):
    try:
        series_name = crud.get_series(db, id).name

        name = data.name.strip()
        series = crud.update_series(db, id, name)

        for movie in series.movies:
            util.rename_movie_file(movie, series_current=series_name)
            db.commit()

        logger.debug('Renamed series %s -> %s', series_name, name)
    except DuplicateEntryException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': str(e)}
        )
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )
    except PathException as e:
        logger.error(str(e))

        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={'message': str(e)}
        )

    return series


@app.delete(
    '/series/{id}',
    responses={
        404: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        412: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Integrity Constraint Failed',
        },
    }
)
def delete_series(
    id: int,
    db: Session = Depends(get_db)
):
    try:
        name = crud.delete_series(db, id)
        logger.debug('Deleted series %s', name)
    except IntegrityConstraintException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_412_PRECONDITION_FAILED,
            detail={'message': str(e)}
        )
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )

    return {
        'message': f'Deleted series "{name}" (ID {id})'
    }


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
            'description': 'Duplicate Studio',
        },
    },
)
def add_studio(
    data: schemas.MoviePropertySchema,
    db: Session = Depends(get_db)
):
    try:
        name = data.name.strip()
        studio = crud.add_studio(db, name)

        logger.debug('Added studio %s', name)
    except DuplicateEntryException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': str(e)}
        )

    return studio


@app.put(
    '/studios/{id}',
    response_model=schemas.Studio,
    responses={
        404: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        409: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Duplicate Studio',
        },
        500: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Path Error',
        },
    }
)
def update_studio(
    id: int,
    data: schemas.MoviePropertySchema,
    db: Session = Depends(get_db)
):
    try:
        studio_name = crud.get_studio(db, id).name

        name = data.name.strip()
        studio = crud.update_studio(db, id, name)

        for movie in studio.movies:
            util.rename_movie_file(movie, studio_current=studio_name)
            db.commit()

        logger.debug('Renamed studio %s -> %s', studio_name, name)
    except DuplicateEntryException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={'message': str(e)}
        )
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )
    except PathException as e:
        logger.error(str(e))

        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={'message': str(e)}
        )

    return studio


@app.delete(
    '/studios/{id}',
    responses={
        404: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        412: {
            'model': schemas.HTTPExceptionSchema,
            'description': 'Integrity Constraint Failed',
        },
    }
)
def delete_studio(
    id: int,
    db: Session = Depends(get_db)
):
    try:
        name = crud.delete_studio(db, id)
        logger.debug('Deleted studio %s', name)
    except IntegrityConstraintException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_412_PRECONDITION_FAILED,
            detail={'message': str(e)}
        )
    except InvalidIDException as e:
        logger.warn(str(e))

        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': str(e)}
        )

    return {
        'message': f'Deleted studio "{name}" (ID {id})'
    }
