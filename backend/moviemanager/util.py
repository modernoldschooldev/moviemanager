import os
import os.path
from typing import List

from fastapi import status
from fastapi.exceptions import HTTPException

from . import models
from .config import get_config

config = get_config()


def generate_movie_filename(movie: models.Movie) -> str:
    # [Studio] {Series SeriesNumber} Name (Actor 1, Actor 2, ..., Actor N).extension
    filename = ''
    _, ext = os.path.splitext(movie.filename)

    if movie.studio is not None:
        filename += f'[{movie.studio.name}]'

    if movie.series is not None:
        if len(filename) > 0:
            filename += ' '

        filename += f'{{{movie.series.name}'

        if movie.series_number is not None:
            filename += f' {movie.series_number}'

        filename += '}'

    if movie.name is not None:
        if len(filename) > 0:
            filename += ' '

        filename += f'{movie.name}'

    if len(movie.actors) > 0:
        actor_names = [actor.name for actor in movie.actors]
        actors = f'({", ".join(actor_names)})'

        if len(filename) + len(actors) < 250:
            if len(filename) > 0:
                filename += ' '

            filename += actors

    filename += ext

    if (filename == ext):
        filename = movie.filename

    return filename


def list_files(path: str) -> List[str]:
    try:
        files = sorted(os.listdir(path))
    except:
        raise Exception(f'Unable to read path {path}')

    return files


def migrate_file(movie: models.Movie, adding: bool = True):
    base_current = config['imports'] if adding else config['movies']
    base_new = config['movies'] if adding else config['imports']

    path_current = f'{base_current}/{movie.filename}'
    path_new = f'{base_new}/{movie.filename}'

    # logger.info(f'migrating {path_current} -> {path_new}')
    os.rename(path_current, path_new)


def rename_movie_file(movie: models.Movie) -> None:
    filename_current = movie.filename
    filename_new = generate_movie_filename(movie)

    path_base = config['movies']
    path_current = f'{path_base}/{filename_current}'
    path_new = f'{path_base}/{filename_new}'

    if path_current != path_new:
        if os.path.exists(path_new):
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                detail={
                    'message': f'New filename conflicts with existing movie file {filename_new}'
                }
            )

        os.rename(path_current, path_new)
        movie.filename = filename_new
