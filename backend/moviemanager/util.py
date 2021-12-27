import os
import os.path
import re
from pathlib import Path
from typing import List, Optional, Tuple

from sqlalchemy.orm import Session

from . import crud, models
from .config import get_config
from .exceptions import ListFilesException, PathException

config = get_config()


def generate_movie_filename(movie: models.Movie) -> str:
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
        raise ListFilesException(f'Unable to read path {path}')

    return files


def migrate_file(filename: str, adding: bool = True):
    base_current = config['imports'] if adding else config['movies']
    base_new = config['movies'] if adding else config['imports']

    path_current = f'{base_current}/{filename}'
    path_new = f'{base_new}/{filename}'

    if os.path.exists(path_new):
        raise PathException(
            f'Unable to migrate {filename} as {path_new} already exists'
        )

    try:
        os.rename(path_current, path_new)
    except:
        raise PathException(
            f'Unable to move {path_current} -> {path_new}'
        )


def parse_filename(filename: str) -> Tuple[
    str, Optional[str], Optional[str], Optional[str], Optional[str]
]:
    name, _ = os.path.splitext(filename)

    # [Studio] {Series Series#} MovieName (Actor1, Actor2, ..., ActorN)
    regex = (
        # Start of line
        r'^'

        # Optional studio
        r'(?:\[([A-Za-z0-9 :.,\'-]+)\])?'

        # Optional space
        r' ?'

        # Optional series name/number
        r'(?:{([A-Za-z0-9 :.,\'-]+?)(?: ([0-9]+))?})?'

        # Optional space
        r' ?'

        # Optional movie Name
        r'([A-Za-z0-9 :.,\'-]+?)?'

        # Optional space
        r' ?'

        # Optional actor list
        r'(?:\(([A-Za-z0-9 .,\'-]+)\))?'

        # End of line
        r'$'
    )

    studio_name = None
    series_name = None
    series_number = None
    actor_names = None

    matches = re.search(regex, name)

    if matches is not None:
        (
            studio_name,
            series_name,
            series_number,
            name,
            actor_names
        ) = matches.groups()

    return (name, studio_name, series_name, series_number, actor_names)


def parse_file_info(db: Session, filename: str) -> Tuple[
    str,
    Optional[int],
    Optional[int],
    Optional[int],
    List[models.Actor],
]:
    studio_id = None
    series_id = None
    series_number = None
    actors = None

    (
        name,
        studio_name,
        series_name,
        series_number,
        actor_names
    ) = parse_filename(filename)

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
    migrate_file(movie.filename, False)

    for actor in movie.actors:
        update_actor_link(movie.filename, actor.name, False)

    for category in movie.categories:
        update_category_link(movie.filename, category.name, False)

    if movie.series is not None:
        update_series_link(movie.filename, movie.series.name, False)

    if movie.studio is not None:
        update_studio_link(movie.filename, movie.studio.name, False)


def rename_movie_file(
    movie: models.Movie,
    actor_current: Optional[str] = None,
    category_current: Optional[str] = None,
    series_current: Optional[str] = None,
    studio_current: Optional[str] = None,
) -> None:
    filename_current = movie.filename
    filename_new = generate_movie_filename(movie)

    path_base = config['movies']
    path_current = f'{path_base}/{filename_current}'
    path_new = f'{path_base}/{filename_new}'

    path_changed = path_current != path_new

    if path_changed:
        if os.path.exists(path_new):
            raise PathException(
                f'Unable to rename {movie.filename} '
                f'as {filename_new} already exists'
            )

        os.rename(path_current, path_new)
        movie.filename = filename_new

        actor: models.Actor
        for actor in movie.actors:
            update_actor_link(
                filename_current,
                actor.name if actor_current is None else actor_current,
                False
            )
            update_actor_link(filename_new, actor.name, True)

        if movie.series is not None:
            update_series_link(
                filename_current,
                movie.series.name if series_current is None else series_current,
                False
            )
            update_series_link(filename_new, movie.series.name, True)

        if movie.studio is not None:
            update_studio_link(
                filename_current,
                movie.studio.name if studio_current is None else studio_current,
                False
            )
            update_studio_link(filename_new, movie.studio.name, True)

    if path_changed or category_current is not None:
        category: models.Category
        for category in movie.categories:
            update_category_link(
                filename_current,
                category.name if category_current is None else category_current,
                False
            )
            update_category_link(filename_new, category.name, True)


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
                raise PathException(
                    f'Link directory {path_base} could not be created'
                )

        if not os.path.lexists(path_link):
            try:
                os.symlink(path_file, path_link)
            except:
                raise PathException(
                    f'Unable to create link {path_file} -> {path_link}'
                )
    else:
        if os.path.lexists(path_link):
            try:
                os.remove(path_link)
            except:
                raise PathException(
                    f'Unable to delete link {path_file} -> {path_link}'
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
