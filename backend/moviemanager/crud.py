from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import models, schemas, util


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
        return None

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
        return None

    return category


def add_movie(
    db: Session,
    filename: str,
    name: str,
    studio_id: Optional[int] = None,
    series_id: Optional[int] = None,
    series_number: Optional[int] = None,
    actor_ids: Optional[List[int]] = None,
    category_ids: Optional[List[int]] = None,
    processed: Optional[bool] = False,
) -> models.Movie:
    movie = models.Movie(
        filename=filename,
        name=name,
        studio_id=studio_id,
        series_id=series_id,
        series_number=series_number,
        processed=processed,
    )

    if actor_ids is not None:
        movie.actors = actor_ids

    if category_ids is not None:
        movie.categories = category_ids

    try:
        db.add(movie)
        db.commit()
        db.refresh(movie)
    except IntegrityError:
        db.rollback()
        return None

    util.migrate_file(movie)

    return movie


def add_movie_actor(
    db: Session,
    movie_id: int,
    actor_id: int
) -> models.Movie:
    movie = get_movie(db, movie_id)
    actor = get_actor(db, actor_id)

    if movie is None or actor is None:
        return None

    movie.actors.append(actor)
    util.rename_movie_file(movie)

    db.commit()
    db.refresh(movie)

    return movie


def add_movie_category(
    db: Session,
    movie_id: int,
    category_id: int
) -> models.Movie:
    movie = get_movie(db, movie_id)
    category = get_category(db, category_id)

    if movie is None or category is None:
        return None

    movie.categories.append(category)
    db.commit()
    db.refresh(movie)

    return movie


def add_series(
    db: Session,
    name: str,
) -> models.Series:
    series = models.Series(
        name=name
    )

    try:
        db.add(series)
        db.commit()
        db.refresh(series)
    except IntegrityError:
        db.rollback()
        return None

    return series


def add_studio(
    db: Session,
    name: str,
) -> models.Studio:
    studio = models.Studio(
        name=name
    )

    try:
        db.add(studio)
        db.commit()
        db.refresh(studio)
    except IntegrityError:
        db.rollback()
        return None

    return studio


def delete_movie_actor(
    db: Session,
    movie_id: int,
    actor_id: int
) -> models.Movie:
    movie = get_movie(db, movie_id)
    actor = get_actor(db, actor_id)

    if movie is None or actor is None:
        return None

    movie.actors.remove(actor)
    util.rename_movie_file(movie)

    db.commit()
    db.refresh(movie)

    return movie


def delete_movie_category(
    db: Session,
    movie_id: int,
    category_id: int
) -> models.Movie:
    movie = get_movie(db, movie_id)
    category = get_category(db, category_id)

    if movie is None or category is None:
        return None

    movie.categories.remove(category)
    db.commit()
    db.refresh(movie)

    return movie


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
            models.Studio.name,
            models.Series.name,
            models.Movie.name,
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


def get_category(db: Session, id: int) -> models.Category:
    return (
        db
        .query(models.Category)
        .filter(models.Category.id == id)
        .first()
    )


def get_movie(db: Session, id: int) -> models.Movie:
    return (
        db
        .query(models.Movie)
        .filter(models.Movie.id == id)
        .first()
    )


def update_movie(
    db: Session,
    id: int,
    data: schemas.MovieUpdateSchema
) -> models.Movie:
    movie = get_movie(db, id)

    if movie is None:
        return None

    if (
        data.name == movie.name
        and data.series_id == movie.series_id
        and data.series_number == movie.series_number
        and data.studio_id == movie.studio_id
    ):
        return movie

    movie.name = data.name
    movie.series_id = data.series_id
    movie.series_number = data.series_number
    movie.studio_id = data.studio_id

    if not movie.processed:
        movie.processed = True

    util.rename_movie_file(movie)

    db.commit()
    db.refresh(movie)

    return movie
