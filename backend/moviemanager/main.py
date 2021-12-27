from typing import List

from fastapi import Depends, FastAPI, status
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, util
from .config import init
from .database import SessionLocal, engine
from .exceptions import (DuplicateEntryException, IntegrityConstraintException,
                         InvalidIDException, ListFilesException, PathException)
from .models import Base
from .schemas import *

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

# create sqlite database table schemas
Base.metadata.create_all(bind=engine)

################################################################################
# Database Session Fetcher


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

################################################################################
# Root Endpoint


@app.get(
    '/',
    response_model=MessageSchema,
)
def hello():
    return {'message': "Hello from FastAPI"}

################################################################################
# /actors endpoints


@app.get(
    '/actors',
    response_model=List[ActorSchema]
)
def actors_get_all(db: Session = Depends(get_db)):
    return crud.get_all_actors(db)


@app.post(
    '/actors',
    response_model=ActorSchema,
    responses={
        409: {
            'model': HTTPExceptionSchema,
            'description': 'Duplicate Actor',
        },
    },
)
def actors_add(
    body: MoviePropertySchema,
    db: Session = Depends(get_db),
):

    try:
        name = body.name.strip()

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
    response_model=ActorSchema,
    responses={
        404: {
            'model': HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        409: {
            'model': HTTPExceptionSchema,
            'description': 'Duplicate Actor',
        },
        500: {
            'model': HTTPExceptionSchema,
            'description': 'Path Error',
        },
    }
)
def actors_update(
    id: int,
    body: MoviePropertySchema,
    db: Session = Depends(get_db),
):
    try:
        actor_name = crud.get_actor(db, id).name

        name = body.name.strip()
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
    response_model=MessageSchema,
    responses={
        404: {
            'model': HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        412: {
            'model': HTTPExceptionSchema,
            'description': 'Integrity Constraint Failed',
        },
    },
)
def actors_delete(
    id: int,
    db: Session = Depends(get_db),
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
    response_model=List[CategorySchema]
)
def categories_get_all(db: Session = Depends(get_db)):
    return crud.get_all_categories(db)


@app.post(
    '/categories',
    response_model=CategorySchema,
    responses={
        409: {
            'model': HTTPExceptionSchema,
            'description': 'Duplicate Category',
        },
    },
)
def categories_add(
    body: MoviePropertySchema,
    db: Session = Depends(get_db),
):
    try:
        name = body.name.strip()
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
    response_model=CategorySchema,
    responses={
        404: {
            'model': HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        409: {
            'model': HTTPExceptionSchema,
            'description': 'Duplicate Category'
        },
        500: {
            'model': HTTPExceptionSchema,
            'description': 'Path Error',
        },
    }
)
def categories_update(
    id: int,
    body: MoviePropertySchema,
    db: Session = Depends(get_db),
):
    try:
        category_name = crud.get_category(db, id).name

        name = body.name.strip()
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
    response_model=MessageSchema,
    responses={
        404: {
            'model': HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        412: {
            'model': HTTPExceptionSchema,
            'description': 'Integrity Constraint Failed',
        },
    }
)
def categories_delete(
    id: int,
    db: Session = Depends(get_db),
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
    response_model=MovieSchema,
    responses={
        404: {
            'model': HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        409: {
            'model': HTTPExceptionSchema,
            'description': 'Duplicate Actor',
        },
        500: {
            'model': HTTPExceptionSchema,
            'description': 'Path Error',
        },
    },
)
def movie_actor_add(
    movie_id: int,
    actor_id: int,
    db: Session = Depends(get_db),
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
    response_model=MovieSchema,
    responses={
        404: {
            'model': HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        500: {
            'model': HTTPExceptionSchema,
            'description': 'Path Error',
        },
    },
)
def movie_actor_delete(
    movie_id: int,
    actor_id: int,
    db: Session = Depends(get_db),
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
    response_model=MovieSchema,
    responses={
        404: {
            'model': HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        409: {
            'model': HTTPExceptionSchema,
            'description': 'Duplicate Category',
        },
        500: {
            'model': HTTPExceptionSchema,
            'description': 'Path Error',
        },
    },
)
def movie_category_add(
    movie_id: int,
    category_id: int,
    db: Session = Depends(get_db),
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
    response_model=MovieSchema,
    responses={
        404: {
            'model': HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        500: {
            'model': HTTPExceptionSchema,
            'description': 'Path Error',
        },
    },
)
def movie_category_delete(
    movie_id: int,
    category_id: int,
    db: Session = Depends(get_db),
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
    response_model=List[MovieFileSchema]
)
def movies_get_all(db: Session = Depends(get_db)):
    return crud.get_all_movies(db)


@app.get(
    '/movies/{id}',
    response_model=MovieSchema,
    responses={
        404: {
            'model': HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
    },
)
def movies_get_one(id: int, db: Session = Depends(get_db)):
    movie = crud.get_movie(db, id)

    if movie is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={'message': f'Movie ID {id} does not exist'}
        )

    return movie


@app.post(
    '/movies',
    response_model=List[MovieSchema],
    responses={
        409: {
            'model': HTTPExceptionSchema,
            'description': 'Duplicate Movie',
        },
        500: {
            'model': HTTPExceptionSchema,
            'description': 'Path Error',
        },
    }
)
def movies_import(db: Session = Depends(get_db)):
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
    response_model=MovieSchema,
    responses={
        404: {
            'model': HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        500: {
            'model': HTTPExceptionSchema,
            'description': 'Path Error',
        },
    },
)
def movies_update(
    id: int,
    body: MovieUpdateSchema,
    db: Session = Depends(get_db),
):
    try:
        movie = crud.update_movie(db, id, body)
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
    response_model=MessageSchema,
    responses={
        404: {
            'model': HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        500: {
            'model': HTTPExceptionSchema,
            'description': 'Path Error',
        },
    },
)
def movies_delete(
    id: int,
    db: Session = Depends(get_db),
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
    response_model=List[SeriesSchema]
)
def series_get_all(db: Session = Depends(get_db)):
    return crud.get_all_series(db)


@app.post(
    '/series',
    response_model=SeriesSchema,
    responses={
        409: {
            'model': HTTPExceptionSchema,
            'description': 'Duplicate Series',
        },
    },
)
def series_add(
    body: MoviePropertySchema,
    db: Session = Depends(get_db),
):
    try:
        name = body.name.strip()
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
    response_model=SeriesSchema,
    responses={
        404: {
            'model': HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        409: {
            'model': HTTPExceptionSchema,
            'description': 'Duplicate Series',
        },
        500: {
            'model': HTTPExceptionSchema,
            'description': 'Path Error',
        },
    }
)
def series_update(
    id: int,
    body: MoviePropertySchema,
    db: Session = Depends(get_db),
):
    try:
        series_name = crud.get_series(db, id).name

        name = body.name.strip()
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
    response_model=MessageSchema,
    responses={
        404: {
            'model': HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        412: {
            'model': HTTPExceptionSchema,
            'description': 'Integrity Constraint Failed',
        },
    }
)
def series_delete(
    id: int,
    db: Session = Depends(get_db),
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
    response_model=List[StudioSchema]
)
def studios_get_all(db: Session = Depends(get_db)):
    return crud.get_all_studios(db)


@app.post(
    '/studios',
    response_model=StudioSchema,
    responses={
        409: {
            'model': HTTPExceptionSchema,
            'description': 'Duplicate Studio',
        },
    },
)
def studios_add(
    body: MoviePropertySchema,
    db: Session = Depends(get_db),
):
    try:
        name = body.name.strip()
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
    response_model=StudioSchema,
    responses={
        404: {
            'model': HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        409: {
            'model': HTTPExceptionSchema,
            'description': 'Duplicate Studio',
        },
        500: {
            'model': HTTPExceptionSchema,
            'description': 'Path Error',
        },
    }
)
def studios_update(
    id: int,
    body: MoviePropertySchema,
    db: Session = Depends(get_db),
):
    try:
        studio_name = crud.get_studio(db, id).name

        name = body.name.strip()
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
            'model': HTTPExceptionSchema,
            'description': 'Invalid ID',
        },
        412: {
            'model': HTTPExceptionSchema,
            'description': 'Integrity Constraint Failed',
        },
    }
)
def studios_delete(
    id: int,
    db: Session = Depends(get_db),
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
