from typing import List, Optional, Tuple

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import models, schemas, util
from .exceptions import (DuplicateEntryException, IntegrityConstraintException,
                         InvalidIDException)


def add_actor(
    db: Session,
    name: str,
) -> models.Actor:
    actor = models.Actor(
        name=name
    )

    try:
        db.add(actor)
        db.commit()
        db.refresh(actor)
    except IntegrityError:
        db.rollback()

        raise DuplicateEntryException(f'Actor {name} already exists')

    return actor


def add_category(
    db: Session,
    name: str,
) -> models.Category:
    category = models.Category(
        name=name
    )

    try:
        db.add(category)
        db.commit()
        db.refresh(category)
    except IntegrityError:
        db.rollback()

        raise DuplicateEntryException(f'Category {name} already exists')

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
        db.refresh(movie)
    except IntegrityError:
        db.rollback()

        raise DuplicateEntryException(f'Movie {filename} already exists')

    return movie


def add_movie_actor(
    db: Session,
    movie_id: int,
    actor_id: int
) -> Tuple[models.Movie, models.Actor]:
    movie = get_movie(db, movie_id)

    if movie is None:
        raise InvalidIDException(f'Movie ID {movie_id} does not exist')

    actor = get_actor(db, actor_id)

    if actor is None:
        raise InvalidIDException(f'Actor ID {actor_id} does not exist')

    movie_actor: models.Actor
    for movie_actor in movie.actors:
        if actor_id == movie_actor.id:
            raise DuplicateEntryException(
                f'Actor ID {actor_id} is already on Movie ID {movie_id}'
            )

    movie.actors.append(actor)
    db.commit()

    util.rename_movie_file(movie)

    db.commit()
    db.refresh(movie)

    return (movie, actor)


def add_movie_category(
    db: Session,
    movie_id: int,
    category_id: int
) -> Tuple[models.Movie, models.Category]:
    movie = get_movie(db, movie_id)

    if movie is None:
        raise InvalidIDException(f'Movie ID {movie_id} does not exist')

    category = get_category(db, category_id)

    if category is None:
        raise InvalidIDException(f'Category ID {category_id} does not exist')

    movie_category: models.Category
    for movie_category in movie.categories:
        if category_id == movie_category.id:
            raise DuplicateEntryException(
                f'Category ID {category_id} is already on Movie ID {movie_id}'
            )

    movie.categories.append(category)
    db.commit()

    util.update_category_link(movie.filename, category.name, True)

    db.commit()
    db.refresh(movie)

    return (movie, category)


def add_series(
    db: Session,
    name: str,
) -> models.Series:
    series = models.Series(
        name=name,
        sort_name=util.generate_sort_name(name),
    )

    try:
        db.add(series)
        db.commit()
        db.refresh(series)
    except IntegrityError:
        db.rollback()

        raise DuplicateEntryException(f'Series {name} already exists')

    return series


def add_studio(
    db: Session,
    name: str,
) -> models.Studio:
    studio = models.Studio(
        name=name,
        sort_name=util.generate_sort_name(name),
    )

    try:
        db.add(studio)
        db.commit()
        db.refresh(studio)
    except IntegrityError:
        db.rollback()

        raise DuplicateEntryException(f'Studio {name} already exists')

    return studio


def delete_actor(
    db: Session,
    id: int,
) -> str:
    actor = get_actor(db, id)

    if actor is None:
        raise InvalidIDException(f'Actor ID {id} does not exist')

    try:
        db.delete(actor)
        db.commit()
    except IntegrityError:
        db.rollback()

        raise IntegrityConstraintException(
            f'Movie exists with actor {actor.name}'
        )

    return actor.name


def delete_category(
    db: Session,
    id: int,
) -> str:
    category = get_category(db, id)

    if category is None:
        raise InvalidIDException(f'Category ID {id} does not exist')

    try:
        db.delete(category)
        db.commit()
    except IntegrityError:
        db.rollback()

        raise IntegrityConstraintException(
            f'Movie exists with category {category.name}'
        )

    return category.name


def delete_movie(
    db: Session,
    id: int,
) -> str:
    movie = get_movie(db, id)

    if movie is None:
        raise InvalidIDException(f'Movie ID {id} does not exist')

    util.remove_movie(movie)

    db.delete(movie)
    db.commit()

    return movie.filename


def delete_movie_actor(
    db: Session,
    movie_id: int,
    actor_id: int
) -> Tuple[models.Movie, models.Actor]:
    movie = get_movie(db, movie_id)

    if movie is None:
        raise InvalidIDException(f'Movie ID {movie_id} does not exist')

    actor = get_actor(db, actor_id)

    if actor is None:
        raise InvalidIDException(f'Actor ID {actor_id} does not exist')

    movie.actors.remove(actor)

    # rename_movie_file will not have this actor to remove the link
    # so we need to do it here
    util.update_actor_link(movie.filename, actor.name, False)
    util.rename_movie_file(movie)

    db.commit()
    db.refresh(movie)

    return (movie, actor)


def delete_movie_category(
    db: Session,
    movie_id: int,
    category_id: int
) -> Tuple[models.Movie, models.Category]:
    movie = get_movie(db, movie_id)

    if movie is None:
        raise InvalidIDException(f'Movie ID {movie_id} does not exist')

    category = get_category(db, category_id)

    if category is None:
        raise InvalidIDException(f'Category ID {category_id} does not exist')

    movie.categories.remove(category)
    util.update_category_link(movie.filename, category.name, False)

    db.commit()
    db.refresh(movie)

    return (movie, category)


def delete_series(
    db: Session,
    id: int,
) -> str:
    series = get_series(db, id)

    if series is None:
        raise InvalidIDException(f'Series ID {id} does not exist')

    try:
        db.delete(series)
        db.commit()
    except IntegrityError:
        db.rollback()

        raise IntegrityConstraintException(
            f'Movie exists with series {series.name}'
        )

    return series.name


def delete_studio(
    db: Session,
    id: int,
) -> str:
    studio = get_studio(db, id)

    if studio is None:
        raise InvalidIDException(f'Studio ID {id} does not exist')

    try:
        db.delete(studio)
        db.commit()
    except IntegrityError:
        db.rollback()

        raise IntegrityConstraintException(
            f'Movie exists with studio {studio.name}'
        )

    return studio.name


def get_all_actors(db: Session) -> List[models.Actor]:
    return (
        db
        .query(models.Actor)
        .order_by(
            models.Actor.name,
        )
        .all()
    )


def get_all_categories(db: Session) -> List[models.Category]:
    return (
        db
        .query(models.Category)
        .order_by(
            models.Category.name,
        )
        .all()
    )


def get_all_movies(db: Session) -> List[models.Movie]:
    return (
        db
        .query(models.Movie)
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
    return (
        db
        .query(models.Series)
        .order_by(
            models.Series.name,
        )
        .all()
    )


def get_all_studios(db: Session) -> List[models.Studio]:
    return (
        db
        .query(models.Studio)
        .order_by(
            models.Studio.name,
        )
        .all()
    )


def get_actor(db: Session, id: int) -> models.Actor:
    return (
        db
        .query(models.Actor)
        .filter(models.Actor.id == id)
        .first()
    )


def get_actor_by_name(db: Session, name: str) -> models.Actor:
    return (
        db
        .query(models.Actor)
        .filter(models.Actor.name == name)
        .first()
    )


def get_category(db: Session, id: int) -> models.Category:
    return (
        db
        .query(models.Category)
        .filter(models.Category.id == id)
        .first()
    )


def get_category_by_name(db: Session, name: str) -> models.Category:
    return (
        db
        .query(models.Category)
        .filter(models.Category.name == name)
        .first()
    )


def get_movie(db: Session, id: int) -> models.Movie:
    return (
        db
        .query(models.Movie)
        .filter(models.Movie.id == id)
        .first()
    )


def get_series(db: Session, id: int) -> models.Series:
    return (
        db
        .query(models.Series)
        .filter(models.Series.id == id)
        .first()
    )


def get_series_by_name(db: Session, name: str) -> models.Series:
    return (
        db
        .query(models.Series)
        .filter(models.Series.name == name)
        .first()
    )


def get_studio(db: Session, id: int) -> models.Studio:
    return (
        db
        .query(models.Studio)
        .filter(models.Studio.id == id)
        .first()
    )


def get_studio_by_name(db: Session, name: str) -> models.Studio:
    return (
        db
        .query(models.Studio)
        .filter(models.Studio.name == name)
        .first()
    )


def update_actor(
    db: Session,
    id: int,
    name: str,
) -> models.Actor:
    actor = get_actor(db, id)

    if actor is None:
        raise InvalidIDException(f'Actor ID {id} does not exist')

    name_old = actor.name
    actor.name = name

    try:
        db.commit()
        db.refresh(actor)
    except IntegrityError:
        db.rollback()

        raise DuplicateEntryException(
            f'Updating actor {name_old} conflicts with existing actor {name}'
        )

    return actor


def update_category(
    db: Session,
    id: int,
    name: str,
) -> models.Category:
    category = get_category(db, id)

    if category is None:
        raise InvalidIDException(f'Category ID {id} does not exist')

    category.name = name

    try:
        db.commit()
        db.refresh(category)
    except IntegrityError:
        db.rollback()

        raise DuplicateEntryException(f'Category {name} already exists')

    return category


def update_movie(
    db: Session,
    id: int,
    data: schemas.MovieUpdateSchema
) -> models.Movie:
    movie = get_movie(db, id)

    if movie is None:
        raise InvalidIDException(f'Movie ID {id} does not exist')

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

    if movie.series_id != data.series_id:
        series_current = get_series(db, movie.series_id).name \
            if movie.series_id is not None else None
        series_new = get_series(db, data.series_id).name \
            if data.series_id is not None else None

        if data.series_id is None:
            # remove series
            util.update_series_link(movie.filename, series_current, False)
        elif movie.series_id is None:
            # add series
            util.update_series_link(movie.filename, series_new, True)
        else:
            # change series
            util.update_series_link(movie.filename, series_current, False)
            util.update_series_link(movie.filename, series_new, True)

    if movie.studio_id != data.studio_id:
        studio_current = get_studio(db, movie.studio_id).name \
            if movie.studio_id is not None else None
        studio_new = get_studio(db, data.studio_id).name \
            if data.studio_id is not None else None

        if data.studio_id is None:
            # remove studio
            util.update_studio_link(movie.filename, studio_current, False)
        elif movie.studio_id is None:
            # add studio
            util.update_studio_link(movie.filename, studio_new, True)
        else:
            # change studio
            util.update_studio_link(movie.filename, studio_current, False)
            util.update_studio_link(movie.filename, studio_new, True)

    movie.name = data.name
    movie.series_id = data.series_id
    movie.series_number = data.series_number
    movie.studio_id = data.studio_id

    util.rename_movie_file(movie)

    db.commit()
    db.refresh(movie)

    return movie


def update_series(
    db: Session,
    id: int,
    name: str,
) -> models.Series:
    series = get_series(db, id)

    if series is None:
        raise InvalidIDException(f'Series ID {id} does not exist')

    series.name = name
    series.sort_name = util.generate_sort_name(name)

    try:
        db.commit()
        db.refresh(series)
    except IntegrityError:
        db.rollback()

        raise DuplicateEntryException(f'Series {name} already exists')

    return series


def update_studio(
    db: Session,
    id: int,
    name: str,
) -> models.Actor:
    studio = get_studio(db, id)

    if studio is None:
        raise InvalidIDException(f'Studio ID {id} does not exist')

    studio.name = name
    studio.sort_name = util.generate_sort_name(name)

    try:
        db.commit()
        db.refresh(studio)
    except IntegrityError:
        db.rollback()

        raise DuplicateEntryException(f'Studio {name} already exists')

    return studio
