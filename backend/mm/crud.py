from typing import List, Optional

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from . import models, util


def add_actor(db: Session, name: str) -> models.Actor:
    actor = models.Actor(name=name)

    db.add(actor)
    db.commit()
    db.refresh(actor)

    return actor


def add_category(db: Session, name: str) -> models.Category:
    category = models.Category(name=name)

    db.add(category)
    db.commit()
    db.refresh(category)

    util.add_category_directory(name)

    return category


def add_clip(
    db: Session,
    filename: str,
    name: str,
    studio_id: Optional[int] = None,
    series_id: Optional[int] = None,
    series_num: Optional[int] = None,
    actors: Optional[List[int]] = None,
    categories: Optional[List[int]] = None,
    processed: Optional[bool] = False,
) -> models.Clip:
    clip = models.Clip(
        filename=filename,
        name=name,
        studio_id=studio_id,
        series_id=series_id,
        series_num=series_num,
        processed=processed,
    )

    if actors is not None:
        clip.actors = actors

    if categories is not None:
        clip.categories = categories

    try:
        db.add(clip)
        db.commit()
        db.refresh(clip)
    except IntegrityError:
        db.rollback()

        return None

    # move file from import dir to sorted dir
    util.migrate_file(clip)

    return clip


def add_clip_actor(db: Session, clip_id: int, actor_id: int) -> models.Clip:
    clip = get_clip(db, clip_id)
    actor = get_actor(db, actor_id)

    clip.actors.append(actor)
    util.rename_clip(clip)

    db.commit()
    db.refresh(clip)

    return clip


def add_clip_category(db: Session, clip_id: int, category_id: int) -> models.Clip:
    clip = get_clip(db, clip_id)
    category = get_category(db, category_id)

    clip.categories.append(category)
    db.commit()
    db.refresh(clip)

    util.category_add(clip, category)

    return clip


def add_series(db: Session, name: str) -> models.Series:
    series = models.Series(name=name)

    db.add(series)
    db.commit()
    db.refresh(series)

    return series


def add_studio(db: Session, name: str) -> models.Studio:
    studio = models.Studio(name=name)

    db.add(studio)
    db.commit()
    db.refresh(studio)

    return studio


def delete_clip(db: Session, id: int) -> None:
    clip = get_clip(db, id)

    util.remove_clip(clip)

    db.delete(clip)
    db.commit()


def get_actor(db: Session, id: int) -> models.Actor:
    return db.query(models.Actor).filter(models.Actor.id == id).first()


def get_actors(db: Session) -> List[models.Actor]:
    return db.query(models.Actor).order_by(models.Actor.name).all()


def get_clip(db: Session, id: int) -> models.Clip:
    return db.query(models.Clip).filter(models.Clip.id == id).first()


def get_clips(db: Session) -> List[models.Clip]:
    return (
        db.
        query(models.Clip)
        .outerjoin(models.Studio)
        .outerjoin(models.Series)
        .order_by(
            models.Clip.processed,
            models.Studio.name,
            models.Series.name,
            models.Clip.name
        )
        .all()
    )


def get_category(db: Session, id: int) -> models.Category:
    return db.query(models.Category).filter(models.Category.id == id).first()


def get_categories(db: Session) -> List[models.Category]:
    return db.query(models.Category).order_by(models.Category.name).all()


def get_series(db: Session, id: int) -> models.Series:
    return db.query(models.Series).filter(models.Series.id == id).first()


def get_series_all(db: Session) -> List[models.Series]:
    return db.query(models.Series).order_by(models.Series.name).all()


def get_studio(db: Session, id: int) -> models.Studio:
    return db.query(models.Studio).filter(models.Studio.id == id).first()


def get_studios(db: Session) -> List[models.Studio]:
    return db.query(models.Studio).order_by(models.Studio.name).all()


def remove_clip_actor(db: Session, clip_id: int, actor_id: int) -> models.Clip:
    clip = get_clip(db, clip_id)
    actor = get_actor(db, actor_id)

    clip.actors.remove(actor)
    util.rename_clip(clip)

    db.commit()
    db.refresh(clip)

    return clip


def remove_clip_category(db: Session, clip_id: int, category_id: int) -> models.Clip:
    clip = get_clip(db, clip_id)
    category = get_category(db, category_id)

    clip.categories.remove(category)
    db.commit()
    db.refresh(clip)

    util.category_remove(clip, category)

    return clip


def update_clip(
    db: Session,
    clip_id: int,
    name: Optional[str] = None,
    studio_id: Optional[int] = None,
    series_id: Optional[int] = None,
    series_num: Optional[int] = None
) -> models.Clip:
    clip = get_clip(db, clip_id)

    # if nothing is different, don't spend time doing anything
    if (
        name == clip.name and
        studio_id == clip.studio_id and
        series_id == clip.series_id and
        series_num == clip.series_num
    ):
        return clip

    clip.name = name
    clip.studio_id = studio_id
    clip.series_id = series_id
    clip.series_num = series_num

    util.rename_clip(clip)

    if not clip.processed:
        clip.processed = True

    db.commit()
    db.refresh(clip)

    return clip
