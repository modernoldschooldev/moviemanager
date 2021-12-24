import os
import os.path
import re
from pathlib import Path
from typing import List, Optional, Tuple

from fastapi import status
from fastapi.exceptions import HTTPException
from sqlalchemy.orm import Session

from . import crud, models
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


def generate_sort_name(name: str) -> str:
    return re.sub(
        r'^(?:a|an|the) ',
        '',
        re.sub(
            r'[^a-z0-9 ]',
            '',
            name.lower(),
        ),
    )


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
    if os.path.exists(path_new):
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                'message': f'Unable to move {path_current} -> {path_new} as it already exists'
            }
        )

    os.rename(path_current, path_new)


def parse_filename(
    db: Session, filename: str
) -> Tuple[
    str,
    Optional[int],
    Optional[int],
    Optional[int],
    List[models.Actor],
]:
    name, _ = os.path.splitext(filename)

    # [Studio] {Series Series#} Name (Actor, Actor ...)
    regex = (
        r'^'
        r'(?:\[([A-Za-z0-9 .,\'-]+)\])?'
        r' ?'
        r'(?:{([A-Za-z0-9 .,\'-]+?)(?: ([0-9]+))?})?'
        r' ?'
        r'([A-Za-z0-9 .,\'-]+)?'
        r' ?'
        r'(?:\(([A-Za-z0-9 .,\'-]+)\))?'
        r'$'
    )

    studio_id = None
    series_id = None
    series_number = None
    actors = None

    matches = re.search(regex, name)

    if matches is not None:
        studio_name, series_name, series_number, name, actor_names = matches.groups()

        if studio_name is not None:
            studio = crud.get_studio_by_name(db, studio_name)

            if studio is not None:
                studio_id = studio.id

        if series_name is not None:
            series = crud.get_series_by_name(db, series_name)

            if series is not None:
                series_id = series.id

        if actor_names is not None:
            actors = [
                actor for actor in
                (
                    crud.get_actor_by_name(db, actor_name)
                    for actor_name in actor_names.split(', ')
                )
                if actor is not None
            ]

    return (name, studio_id, series_id, series_number, actors)


def remove_movie(movie: models.Movie) -> None:
    migrate_file(movie, False)

    for actor in movie.actors:
        update_actor_link(movie.filename, actor.name, False)

    for category in movie.categories:
        update_category_link(movie.filename, category.name, False)

    if movie.series is not None:
        update_series_link(movie.filename, movie.series.name, False)

    if movie.studio is not None:
        update_studio_link(movie.filename, movie.studio.name, False)


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

        actor: models.Actor
        for actor in movie.actors:
            update_actor_link(filename_current, actor.name, False)
            update_actor_link(filename_new, actor.name, True)

        category: models.Category
        for category in movie.categories:
            update_category_link(filename_current, category.name, False)
            update_category_link(filename_new, category.name, True)

        if movie.series is not None:
            update_series_link(filename_current, movie.series.name, False)
            update_series_link(filename_new, movie.series.name, True)

        if movie.studio is not None:
            update_studio_link(filename_current, movie.studio.name, False)
            update_studio_link(filename_new, movie.studio.name, True)


def update_link(
    filename: str,
    path_link_base: str,
    name: str,
    selected: bool
) -> None:
    path_movies = os.path.abspath(config['movies'])
    path_file = f'{path_movies}/{filename}'

    path_base = f'{path_link_base}/{name}'
    path_link = f'{path_base}/{filename}'

    if selected:
        if not os.path.isdir(path_base):
            try:
                path = Path(path_base)
                path.mkdir(parents=True, exist_ok=True)
            except:
                raise HTTPException(
                    status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail={
                        'message': f'Directory {path_base} could not be created'
                    }
                )

        if not os.path.lexists(path_link):
            try:
                os.symlink(path_file, path_link)
            except:
                raise HTTPException(
                    status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail={
                        'message': f'Unable to create link {path_file} -> {path_link}'
                    }
                )
    else:
        if os.path.lexists(path_link):
            try:
                os.remove(path_link)
            except:
                raise HTTPException(
                    status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail={
                        'message': f'Unable to remove link {path_file} -> {path_link}'
                    }
                )

            try:
                os.rmdir(path_base)
            except:
                pass


def update_actor_link(filename: str, name: str, selected: bool) -> None:
    update_link(filename, config['actors'], name, selected)


def update_category_link(filename: str, name: str, selected: bool) -> None:
    update_link(filename, config['categories'], name, selected)


def update_series_link(filename: str, name: str, selected: bool) -> None:
    update_link(filename, config['series'], name, selected)


def update_studio_link(filename: str, name: str, selected: bool) -> None:
    update_link(filename, config['studios'], name, selected)
