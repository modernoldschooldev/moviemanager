from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import models, util


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
