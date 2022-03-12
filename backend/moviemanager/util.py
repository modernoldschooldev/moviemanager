import os
import os.path
import re
from enum import Enum
from pathlib import Path
from typing import List, Optional, Tuple

from sqlalchemy.orm import Session

from . import crud, models
from .config import get_db_path
from .exceptions import ListFilesException, PathException


class PathType(Enum):
    ACTOR = "actors"
    CATEGORY = "categories"
    MOVIE = "movies"
    IMPORT = "imports"
    SERIES = "series"
    STUDIO = "studios"


def generate_movie_filename(movie: models.Movie) -> str:
    """Generates a filename based on the movie information.

    Args:
        movie: The movie.

    Returns:
        filename: The generated filename.
    """

    # start with a blank filename
    filename = ""

    # save the file extension for later
    _, ext = os.path.splitext(movie.filename)

    # add the studio name in [] brackets
    if movie.studio is not None:
        filename += f"[{movie.studio.name}]"

    # add the series name and number in {} braces
    if movie.series is not None:
        if len(filename) > 0:
            filename += " "

        filename += f"{{{movie.series.name}"

        if movie.series_number is not None:
            filename += f" {movie.series_number}"

        filename += "}"

    # add the movie name
    if movie.name is not None:
        if len(filename) > 0:
            filename += " "

        filename += f"{movie.name}"

    # add the actors as a comma separated list inside () parentheses
    if len(movie.actors) > 0:
        actor_names = [actor.name for actor in movie.actors]
        actors = f'({", ".join(actor_names)})'

        # drop the actors if the filename length will exceed 255 characters
        if len(filename) + len(actors) < 250:
            if len(filename) > 0:
                filename += " "

            filename += actors

    # append the extension
    filename += ext

    # if all we end up with is the file extension, we must not have had any
    # movie properties. just use the existing filename in that case.
    if filename == ext:
        filename = movie.filename

    return filename


def generate_sort_name(name: Optional[str]) -> Optional[str]:
    """Generate a name ignoring articles, case, and special characters.

    Args:
        name: The name to convert.

    Returns:
        sort_name: The converted name.
    """

    if name is None:
        return None

    return re.sub(
        r"^(?:a|an|the) ",  # replace articles at the start of the line
        "",
        re.sub(
            r"[^a-z0-9 ]",  # replace non alphanumerics anywhere in the name
            "",
            name.lower(),  # convert to lowercase
        ),
    )


def get_movie_path(path_type: PathType, full: bool = True) -> str:
    """Gets the a relative or full path to the movie files.

    Args:
        path_type: The type of files requested.
        full: True for the full path; false for a relative path.

    Returns:
        path: The path to the movie files.
    """

    path = get_db_path() if full else "../.."

    return f"{path}/{path_type.value}"


def list_files(path: str) -> List[str]:
    """List all files in a directory in alphabetical order.

    Args:
        path: Path to list.

    Returns:
        files: List of files in the path.

    Raises:
        ListFilesException: If the path cannot be read for any reason.
    """

    try:
        files = sorted(os.listdir(path))
    except OSError:
        raise ListFilesException(f"Failed to read path {path}")

    return files


def migrate_file(filename: str, adding: bool = True) -> None:
    """Migrates a file between the imports and movies directory.

    Args:
        filename: The filename to migrate.
        adding: True when moving to movies folder; False for the imports.
    """

    imports = get_movie_path(PathType.IMPORT)
    movies = get_movie_path(PathType.MOVIE)

    base_current = imports if adding else movies
    base_new = movies if adding else imports

    path_current = f"{base_current}/{filename}"
    path_new = f"{base_new}/{filename}"

    if os.path.exists(path_new):
        raise PathException(f"Moving {filename} to {base_new} conflicts with existing")

    try:
        os.rename(path_current, path_new)
    except OSError:
        raise PathException(f"Failed to move {path_current} -> {path_new}")


def parse_filename(
    filename: str,
) -> Tuple[str, Optional[str], Optional[str], Optional[str], Optional[str]]:
    """Parses a filename for movie properties.

    Args:
        filename: The filename to parse.

    Returns:
        name: The name of the movie.
        studio: The name of the studio, or None if not found.
        series: The name of the series, or None if not found.
        series_number: The number of the series, or None if not found.
        actors: Comma delimited actor names, or None if not found.
    """

    name, _ = os.path.splitext(filename)

    # [Studio] {Series Series#} MovieName (Actor1, Actor2, ..., ActorN)
    regex = (
        # Start of line
        r"^"
        # Optional studio
        r"(?:\[([A-Za-z0-9 :.,\'-]+)\])?"
        # Optional space
        r" ?"
        # Optional series name/number
        r"(?:{([A-Za-z0-9 :.,\'-]+?)(?: ([0-9]+))?})?"
        # Optional space
        r" ?"
        # Optional movie Name
        r"([A-Za-z0-9 :.,\'-]+?)?"
        # Optional space
        r" ?"
        # Optional actor list
        r"(?:\(([A-Za-z0-9 .,\'-]+)\))?"
        # End of line
        r"$"
    )

    studio_name = None
    series_name = None
    series_number = None
    actor_names = None

    matches = re.search(regex, name)

    if matches is not None:
        (studio_name, series_name, series_number, name, actor_names) = matches.groups()

    return (name, studio_name, series_name, series_number, actor_names)


def parse_file_info(
    db: Session, filename: str
) -> Tuple[str, Optional[int], Optional[int], Optional[int], List[models.Actor]]:
    """Parses file information from a filename.

    Args:
        db: The database session.
        filename: The filename to parse.

    Returns:
        name: The movie name.
        studio_id: The ID of the studio, or None if not found.
        series_id: The ID of the series, or None if not found.
        series_number: The series number, or None if not found.
        actors: List of actors on the movie, or None if not found.
    """

    studio_id = None
    series_id = None
    series_number = None
    actors = None

    (name, studio_name, series_name, series_number, actor_names) = parse_filename(
        filename
    )

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
            actor
            for actor in (
                crud.get_actor_by_name(db, actor_name)
                for actor_name in actor_names.split(", ")
            )
            if actor is not None
        ]

    return (name, studio_id, series_id, series_number, actors)


def remove_movie(movie: models.Movie) -> None:
    """Removes a movie file from the movies folder and all propery links.

    Args:
        movie: The movie to be removed.
    """

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
    """Renames a movie, and updates its filename and all property links.

    Args:
        movie: The movie to be renamed.
        actor_current: The current actor name if updating that, too.
        category_current: The current category name if updating that, too.
        series_current: The current series name if updating that, too.
        studio_current: The current studio name if updating that, too.

    Raises:
        PathException: A renaming, removing, or symlink file operation failed.
    """

    filename_current = movie.filename
    filename_new = generate_movie_filename(movie)

    path_base = get_movie_path(PathType.MOVIE)
    path_current = f"{path_base}/{filename_current}"
    path_new = f"{path_base}/{filename_new}"

    if path_current != path_new:
        if os.path.exists(path_new):
            raise PathException(
                f"Renaming {movie.filename} -> {filename_new} "
                f"conflicts with existing"
            )

        os.rename(path_current, path_new)
        movie.filename = filename_new

        actor: models.Actor
        for actor in movie.actors:
            update_actor_link(
                filename_current,
                actor.name if actor_current is None else actor_current,
                False,
            )
            update_actor_link(filename_new, actor.name, True)

        category: models.Category
        for category in movie.categories:
            update_category_link(
                filename_current,
                category.name if category_current is None else category_current,
                False,
            )
            update_category_link(filename_new, category.name, True)

        if movie.series is not None:
            update_series_link(
                filename_current,
                movie.series.name if series_current is None else series_current,
                False,
            )
            update_series_link(filename_new, movie.series.name, True)

        if movie.studio is not None:
            update_studio_link(
                filename_current,
                movie.studio.name if studio_current is None else studio_current,
                False,
            )
            update_studio_link(filename_new, movie.studio.name, True)


def update_link(filename: str, path_link_base: str, name: str, selected: bool) -> None:
    """Updates a property link to a movie file.

    Args:
        filename: The filename of the movie.
        path_link_base: The base directory for the links.
        name: The directory within path_link_base.
        selected: True to add the link; False to remove it.

    Raises:
        PathError: If any file operation fails.
    """

    path_movies = get_movie_path(PathType.MOVIE, False)
    path_file = f"{path_movies}/{filename}"

    path_base = f"{path_link_base}/{name}"
    path_link = f"{path_base}/{filename}"

    if selected:
        # create the link directory if it doesn't already exist
        if not os.path.isdir(path_base):
            try:
                path = Path(path_base)
                path.mkdir(parents=True, exist_ok=True)
            except OSError:
                raise PathException(f"Link directory {path_base} could not be created")

        # add the symlink to the link directory
        if not os.path.lexists(path_link):
            try:
                os.symlink(path_file, path_link)
            except OSError:
                raise PathException(f"Failed to create link {path_file} -> {path_link}")
    else:
        # remove the symlink if it exists
        if os.path.lexists(path_link):
            try:
                os.remove(path_link)
            except OSError:
                raise PathException(f"Failed to delete link {path_file} -> {path_link}")

            try:
                os.rmdir(path_base)
            except OSError:
                pass


def update_actor_link(filename: str, name: str, selected: bool) -> None:
    """Updates an actor property link; update_link has more info."""

    update_link(filename, get_movie_path(PathType.ACTOR), name, selected)


def update_category_link(filename: str, name: str, selected: bool) -> None:
    """Updates a category property link; update_link has more info.."""

    update_link(filename, get_movie_path(PathType.CATEGORY), name, selected)


def update_series_link(filename: str, name: str, selected: bool) -> None:
    """Updates a series property link; update_link has more info.."""

    update_link(filename, get_movie_path(PathType.SERIES), name, selected)


def update_studio_link(filename: str, name: str, selected: bool) -> None:
    """Updates a studio property link; update_link has more info.."""

    update_link(filename, get_movie_path(PathType.STUDIO), name, selected)
