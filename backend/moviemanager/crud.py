from typing import List, Optional, Tuple

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import models, util
from .exceptions import *
from .schemas import MovieUpdateSchema


def add_actor(
    db: Session,
    name: str,
) -> models.Actor:
    """Adds an actor to the database.

    Args:
        db: The database session.
        name: Name for the actor.

    Returns:
        actor: The new Actor object.

    Raises:
        DuplicateEntryException: Actor already exists with that name.
    """

    actor = models.Actor(name=name)

    try:
        db.add(actor)
        db.commit()
    except IntegrityError:
        db.rollback()

        raise DuplicateEntryException(f"Actor {name} already exists")

    return actor


def add_category(
    db: Session,
    name: str,
) -> models.Category:
    """Adds a category to the database.

    Args:
        db: The database session.
        name: Name for the category.

    Returns:
        category: The new Category object.

    Raises:
        DuplicateEntryException: Category already exists with that name.
    """

    category = models.Category(name=name)

    try:
        db.add(category)
        db.commit()
    except IntegrityError:
        db.rollback()

        raise DuplicateEntryException(f"Category {name} already exists")

    return category


def add_movie(
    db: Session,
    filename: str,
    name: str,
    studio_id: Optional[int] = None,
    series_id: Optional[int] = None,
    series_number: Optional[int] = None,
    actors: Optional[List[models.Actor]] = None,
    categories: Optional[List[models.Category]] = None,
    processed: Optional[bool] = False,
) -> models.Movie:
    """Adds a movie to the database.

    Args:
        db: The database session.
        filename: The movie's filename.
        name: The movie's name.
        studio_id: ID of the studio for this movie.
        series_id: ID of the series for this movie.
        series_number: Number in the series.
        actors: List of Actor objects in this movie.
        categories: List of Category objects in this movie.
        processed: True if the movie has been processed; false otherwise.

    Returns:
        movie: The new Movie object.

    Raises:
        DuplicateEntryException: Movie conflicts with existing.
    """

    movie = models.Movie(
        filename=filename,
        name=name,
        sort_name=util.generate_sort_name(name),
        studio_id=studio_id,
        series_id=series_id,
        series_number=series_number,
        processed=processed,
    )

    if actors is not None:
        movie.actors = actors

    if categories is not None:
        movie.categories = categories

    try:
        db.add(movie)
        db.commit()
    except IntegrityError:
        db.rollback()

        raise DuplicateEntryException(f"Movie {filename} already exists")

    return movie


def add_movie_actor(
    db: Session, movie_id: int, actor_id: int
) -> Tuple[models.Movie, models.Actor]:
    """Adds an actor to a movie.

    Args:
        db: The database session.
        movie_id: ID of the Movie.
        actor_id: ID of the actor.

    Returns:
        movie: The updated Movie.
        actor: The Actor.

    Raises:
        InvalidIDException: Movie or Actor ID does not exist.
        DuplicateEntryException: Actor is already on this movie.
    """

    movie = get_movie(db, movie_id)

    if movie is None:
        raise InvalidIDException(f"Movie ID {movie_id} does not exist")

    actor = get_actor(db, actor_id)

    if actor is None:
        raise InvalidIDException(f"Actor ID {actor_id} does not exist")

    movie_actor: models.Actor
    for movie_actor in movie.actors:
        if actor_id == movie_actor.id:
            raise DuplicateEntryException(
                f"Actor {actor.name} (ID {actor.id}) "
                f"is already on Movie {movie.filename} (ID {movie.id})"
            )

    movie.actors.append(actor)
    db.commit()

    util.rename_movie_file(movie)
    db.commit()

    return (movie, actor)


def add_movie_category(
    db: Session, movie_id: int, category_id: int
) -> Tuple[models.Movie, models.Category]:
    """Adds a category to a movie.

    Args:
        db: The database session.
        movie_id: ID of the Movie.
        category_id: ID of the category.

    Returns:
        movie: The updated Movie.
        category: The Category.

    Raises:
        InvalidIDException: Movie or Category ID does not exist.
        DuplicateEntryException: Category is already on this movie.
    """

    movie = get_movie(db, movie_id)

    if movie is None:
        raise InvalidIDException(f"Movie ID {movie_id} does not exist")

    category = get_category(db, category_id)

    if category is None:
        raise InvalidIDException(f"Category ID {category_id} does not exist")

    movie_category: models.Category
    for movie_category in movie.categories:
        if category_id == movie_category.id:
            raise DuplicateEntryException(
                f"Category {category.name} (ID {category.id}) "
                f"is already on Movie {movie.filename} (ID {movie.id})"
            )

    movie.categories.append(category)
    db.commit()

    util.update_category_link(movie.filename, category.name, True)
    db.commit()

    return (movie, category)


def add_series(
    db: Session,
    name: str,
) -> models.Series:
    """Adds a series to the database.

    Args:
        db: The database session.
        name: Name for the series.

    Returns:
        series: The new Series object.

    Raises:
        DuplicateEntryException: Series already exists with that name.
    """

    series = models.Series(
        name=name,
        sort_name=util.generate_sort_name(name),
    )

    try:
        db.add(series)
        db.commit()
    except IntegrityError:
        db.rollback()

        raise DuplicateEntryException(f"Series {name} already exists")

    return series


def add_studio(
    db: Session,
    name: str,
) -> models.Studio:
    """Adds a studio to the database.

    Args:
        db: The database session.
        name: Name for the studio.

    Returns:
        studio: The new Studio object.

    Raises:
        DuplicateEntryException: Studio already exists with that name.
    """

    studio = models.Studio(
        name=name,
        sort_name=util.generate_sort_name(name),
    )

    try:
        db.add(studio)
        db.commit()
    except IntegrityError:
        db.rollback()

        raise DuplicateEntryException(f"Studio {name} already exists")

    return studio


def delete_actor(
    db: Session,
    id: int,
) -> str:
    """Deletes an actor from the database.

    Args:
        db: The database session.
        id: The actor ID.

    Returns:
        name: The name of the deleted actor.

    Raises:
        IntegrityConstraintException: Actor is attached to a Movie and cannot
            be deleted.
        InvalidIDException: Actor does not exist.
    """

    actor = get_actor(db, id)

    if actor is None:
        raise InvalidIDException(f"Actor ID {id} does not exist")

    try:
        db.delete(actor)
        db.commit()
    except IntegrityError:
        db.rollback()

        raise IntegrityConstraintException(
            f"Movie exists with actor {actor.name} (ID {actor.id})"
        )

    return actor.name


def delete_category(
    db: Session,
    id: int,
) -> str:
    """Deletes a category from the database.

    Args:
        db: The database session.
        id: The category ID.

    Returns:
        name: The name of the deleted category.

    Raises:
        IntegrityConstraintException: Category is attached to a Movie and cannot
            be deleted.
        InvalidIDException: Category does not exist.
    """

    category = get_category(db, id)

    if category is None:
        raise InvalidIDException(f"Category ID {id} does not exist")

    try:
        db.delete(category)
        db.commit()
    except IntegrityError:
        db.rollback()

        raise IntegrityConstraintException(
            f"Movie exists with category {category.name} (ID {category.id})"
        )

    return category.name


def delete_movie(
    db: Session,
    id: int,
) -> str:
    """Deletes a movie from the database.

    Args:
        db: The database session.
        id: The movie ID.

    Returns:
        name: The name of the deleted movie.

    Raises:
        InvalidIDException: Movie does not exist.
    """

    movie = get_movie(db, id)

    if movie is None:
        raise InvalidIDException(f"Movie ID {id} does not exist")

    util.remove_movie(movie)

    db.delete(movie)
    db.commit()

    return movie.filename


def delete_movie_actor(
    db: Session, movie_id: int, actor_id: int
) -> Tuple[models.Movie, models.Actor]:
    """Deletes an actor from a movie.

    Args:
        db: The database session.
        movie_id: The movie ID.
        actor_id: The actor ID.

    Returns:
        movie: The updated Movie.
        actor: The Actor.

    Raises:
        InvalidIDException: Movie or actor ID does not exist, or Actor is not
            on the movie.
    """

    movie = get_movie(db, movie_id)

    if movie is None:
        raise InvalidIDException(f"Movie ID {movie_id} does not exist")

    actor = get_actor(db, actor_id)

    if actor is None:
        raise InvalidIDException(f"Actor ID {actor_id} does not exist")

    try:
        movie.actors.remove(actor)
    except ValueError:
        raise InvalidIDException(
            f"Actor {actor.name} (ID {actor.id}) "
            f"is not on movie {movie.filename} (ID {movie.id})"
        )

    # rename_movie_file will not have this actor to remove the link
    # so we need to do it here
    util.update_actor_link(movie.filename, actor.name, False)
    util.rename_movie_file(movie)

    db.commit()

    return (movie, actor)


def delete_movie_category(
    db: Session, movie_id: int, category_id: int
) -> Tuple[models.Movie, models.Category]:
    """Deletes a category from a movie.

    Args:
        db: The database session.
        movie_id: The movie ID.
        category_id: The category ID.

    Returns:
        movie: The updated Movie.
        category: The Category.

    Raises:
        InvalidIDException: Movie or category ID does not exist, or Category is
            not on the movie.
    """

    movie = get_movie(db, movie_id)

    if movie is None:
        raise InvalidIDException(f"Movie ID {movie_id} does not exist")

    category = get_category(db, category_id)

    if category is None:
        raise InvalidIDException(f"Category ID {category_id} does not exist")

    try:
        movie.categories.remove(category)
    except ValueError:
        raise InvalidIDException(
            f"Category {category.name} (ID {category.id}) "
            f"is not on movie {movie.filename} (ID {movie.id})"
        )

    util.update_category_link(movie.filename, category.name, False)

    db.commit()

    return (movie, category)


def delete_series(
    db: Session,
    id: int,
) -> str:
    """Deletes a series from the database.

    Args:
        db: The database session.
        id: The series ID.

    Returns:
        name: The name of the deleted series.

    Raises:
        IntegrityConstraintException: Series is attached to a Movie and cannot
            be deleted.
        InvalidIDException: Series does not exist.
    """

    series = get_series(db, id)

    if series is None:
        raise InvalidIDException(f"Series ID {id} does not exist")

    try:
        db.delete(series)
        db.commit()
    except IntegrityError:
        db.rollback()

        raise IntegrityConstraintException(
            f"Movie exists with series {series.name} (ID {series.id})"
        )

    return series.name


def delete_studio(
    db: Session,
    id: int,
) -> str:
    """Deletes a studio from the database.

    Args:
        db: The database session.
        id: The studio ID.

    Returns:
        name: The name of the deleted studio.

    Raises:
        IntegrityConstraintException: Studio is attached to a Movie and cannot
            be deleted.
        InvalidIDException: Studio does not exist.
    """

    studio = get_studio(db, id)

    if studio is None:
        raise InvalidIDException(f"Studio ID {id} does not exist")

    try:
        db.delete(studio)
        db.commit()
    except IntegrityError:
        db.rollback()

        raise IntegrityConstraintException(
            f"Movie exists with studio {studio.name} (ID {studio.id})"
        )

    return studio.name


def get_all_actors(db: Session) -> List[models.Actor]:
    """Return list of all actors in alphabetical order.

    Args:
        db: The database session.
    """

    return (
        db.query(models.Actor)
        .order_by(
            models.Actor.name,
        )
        .all()
    )


def get_all_categories(db: Session) -> List[models.Category]:
    """Return list of all categories in alphabetical order.

    Args:
        db: The database session.
    """

    return (
        db.query(models.Category)
        .order_by(
            models.Category.name,
        )
        .all()
    )


def get_all_movies(db: Session) -> List[models.Movie]:
    """Return list of all movies in the database.

    List will be sorted in the following manner:
        - Unprocessed will be on top.
        - The Studio, Series, Series Number, and Movie names will be sorted
            in that order alphabetically.

    Args:
        db: The database session.
    """

    return (
        db.query(models.Movie)
        .outerjoin(models.Studio)
        .outerjoin(models.Series)
        .order_by(
            models.Movie.processed,
            models.Studio.sort_name,
            models.Series.sort_name,
            models.Movie.series_number,
            models.Movie.sort_name,
        )
        .all()
    )


def get_all_series(db: Session) -> List[models.Series]:
    """Return list of all series in alphabetical order.

    Args:
        db: The database session.
    """

    return (
        db.query(models.Series)
        .order_by(
            models.Series.name,
        )
        .all()
    )


def get_all_studios(db: Session) -> List[models.Studio]:
    """Return list of all studios in alphabetical order.

    Args:
        db: The database session.
    """

    return (
        db.query(models.Studio)
        .order_by(
            models.Studio.name,
        )
        .all()
    )


def get_actor(db: Session, id: int) -> models.Actor:
    """Return actor with the given ID, or None if not found.

    Args:
        db: The database session.
        id: The actor ID.
    """

    return db.query(models.Actor).filter(models.Actor.id == id).first()


def get_actor_by_name(db: Session, name: str) -> models.Actor:
    """Return actor with the given name, or None if not found.

    Args:
        db: The database session.
        name: The actor name.
    """

    return db.query(models.Actor).filter(models.Actor.name == name).first()


def get_category(db: Session, id: int) -> models.Category:
    """Return category with the given ID, or None if not found.

    Args:
        db: The database session.
        id: The category ID.
    """

    return db.query(models.Category).filter(models.Category.id == id).first()


def get_category_by_name(db: Session, name: str) -> models.Category:
    """Return category with the given name, or None if not found.

    Args:
        db: The database session.
        name: The category name.
    """

    return db.query(models.Category).filter(models.Category.name == name).first()


def get_movie(db: Session, id: int) -> models.Movie:
    """Return movie with the given ID, or None if not found.

    Args:
        db: The database session.
        id: The movie ID.
    """

    return db.query(models.Movie).filter(models.Movie.id == id).first()


def get_series(db: Session, id: int) -> models.Series:
    """Return series with the given ID, or None if not found.

    Args:
        db: The database session.
        id: The series ID.
    """

    return db.query(models.Series).filter(models.Series.id == id).first()


def get_series_by_name(db: Session, name: str) -> models.Series:
    """Return series with the given name, or None if not found.

    Args:
        db: The database session.
        name: The series name.
    """

    return db.query(models.Series).filter(models.Series.name == name).first()


def get_studio(db: Session, id: int) -> models.Studio:
    """Return studio with the given ID, or None if not found.

    Args:
        db: The database session.
        id: The studio ID.
    """

    return db.query(models.Studio).filter(models.Studio.id == id).first()


def get_studio_by_name(db: Session, name: str) -> models.Studio:
    """Return studio with the given name, or None if not found.

    Args:
        db: The database session.
        name: The studio name.
    """

    return db.query(models.Studio).filter(models.Studio.name == name).first()


def update_actor(
    db: Session,
    id: int,
    name: str,
) -> models.Actor:
    """Updates an actor name in the database.

    Args:
        db: The database session.
        id: The actor ID.
        name: The updated actor name.

    Returns:
        actor: The updated actor.

    Raises:
        InvalidIDException: Actor does not exist.
        DuplicateEntryException: Actor already exists with that name.
    """

    actor = get_actor(db, id)

    if actor is None:
        raise InvalidIDException(f"Actor ID {id} does not exist")

    name_old = actor.name
    actor.name = name

    try:
        db.commit()
    except IntegrityError:
        db.rollback()

        raise DuplicateEntryException(
            f"Renaming actor {name_old} -> {name} conflicts with existing"
        )

    return actor


def update_category(
    db: Session,
    id: int,
    name: str,
) -> models.Category:
    """Updates a category name in the database.

    Args:
        db: The database session.
        id: The category ID.
        name: The updated category name.

    Returns:
        category: The updated category.

    Raises:
        InvalidIDException: Category does not exist.
        DuplicateEntryException: Category already exists with that name.
    """

    category = get_category(db, id)

    if category is None:
        raise InvalidIDException(f"Category ID {id} does not exist")

    name_old = category.name
    category.name = name

    try:
        db.commit()
    except IntegrityError:
        db.rollback()

        raise DuplicateEntryException(
            f"Renaming ategory {name_old} -> {name} conflicts with existing"
        )

    return category


def update_movie(db: Session, id: int, data: MovieUpdateSchema) -> models.Movie:
    """Updates movie information in the database.

    Args:
        db: The database session.
        id: The movie ID.
        data: The updated movie information.

    Returns:
        movie: The updated movie.

    Raises:
        InvalidIDException: Movie does not exist.
        DuplicateEntryException: Movie already exists with that name.
        PathException: Problem updating movie file or links.
    """

    movie = get_movie(db, id)

    if movie is None:
        raise InvalidIDException(f"Movie ID {id} does not exist")

    movie.processed = True

    if (
        data.name == movie.name
        and data.series_id == movie.series_id
        and data.series_number == movie.series_number
        and data.studio_id == movie.studio_id
    ):
        # update processed flag
        db.commit()

        return movie

    if movie.name != data.name:
        movie.sort_name = util.generate_sort_name(data.name)

    # preserve current series + studio names for link updates later
    series_current = (
        get_series(db, movie.series_id).name if movie.series_id is not None else None
    )
    studio_current = (
        get_studio(db, movie.studio_id).name if movie.studio_id is not None else None
    )

    if movie.series_id != data.series_id and data.series_id is None:
        # remove series link here as rename_movie_file won't have it
        util.update_series_link(movie.filename, series_current, False)

    if movie.studio_id != data.studio_id and data.studio_id is None:
        # remove studio link here as rename_movie_file won't have it
        util.update_studio_link(movie.filename, studio_current, False)

    movie.name = data.name
    movie.series_id = data.series_id
    movie.series_number = data.series_number
    movie.studio_id = data.studio_id

    util.rename_movie_file(
        movie,
        series_current=series_current,
        studio_current=studio_current,
    )

    db.commit()

    return movie


def update_series(
    db: Session,
    id: int,
    name: str,
) -> models.Series:
    """Updates a series name in the database.

    Args:
        db: The database session.
        id: The series ID.
        name: The updated series name.

    Returns:
        series: The updated series.

    Raises:
        InvalidIDException: Series does not exist.
        DuplicateEntryException: Series already exists with that name.
    """

    series = get_series(db, id)

    if series is None:
        raise InvalidIDException(f"Series ID {id} does not exist")

    old_name = series.name
    series.name = name
    series.sort_name = util.generate_sort_name(name)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()

        raise DuplicateEntryException(
            f"Renaming series {old_name} -> {name} conflicts with existing"
        )

    return series


def update_studio(
    db: Session,
    id: int,
    name: str,
) -> models.Actor:
    """Updates a studio name in the database.

    Args:
        db: The database session.
        id: The studio ID.
        name: The updated studio name.

    Returns:
        studio: The updated studio.

    Raises:
        InvalidIDException: Studio does not exist.
        DuplicateEntryException: Studio already exists with that name.
    """

    studio = get_studio(db, id)

    if studio is None:
        raise InvalidIDException(f"Studio ID {id} does not exist")

    old_name = studio.name
    studio.name = name
    studio.sort_name = util.generate_sort_name(name)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()

        raise DuplicateEntryException(
            f"Renaming studio {old_name} -> {name} conflicts with existing"
        )

    return studio
