from os.path import splitext
from typing import List

from fastapi import Depends, FastAPI, status
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, schemas, util
from .config import get_config, setup_logging
from .database import SessionLocal, engine
from .models import Base

setup_logging()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r'http://(127\.0\.0\.1|localhost):300[0-9]',
    allow_methods=['*'],
    allow_headers=['*'],
)

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@app.get('/actors', response_model=List[schemas.Actor])
def get_actors(db: Session = Depends(get_db)):
    return crud.get_actors(db)


@app.post('/actors', response_model=schemas.Actor)
def add_actor(name: str, db: Session = Depends(get_db)):
    return crud.add_actor(db, name)


@app.get('/categories', response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)


@app.post('/categories', response_model=schemas.Category)
def add_category(name: str, db: Session = Depends(get_db)):
    return crud.add_category(db, name)


@app.delete('/clip_actors', response_model=schemas.Clip)
def remove_clip_actor(clip_id: int, actor_id: int, db: Session = Depends(get_db)):
    return crud.remove_clip_actor(db, clip_id, actor_id)


@app.put('/clip_actors', response_model=schemas.Clip)
def add_clip_actor(clip_id: int, actor_id: int, db: Session = Depends(get_db)):
    return crud.add_clip_actor(db, clip_id, actor_id)


@app.delete('/clip_categories', response_model=schemas.Clip)
def remove_clip_category(clip_id: int, category_id: int, db: Session = Depends(get_db)):
    return crud.remove_clip_category(db, clip_id, category_id)


@app.put('/clip_categories', response_model=schemas.Clip)
def add_clip_category(clip_id: int, category_id: int, db: Session = Depends(get_db)):
    return crud.add_clip_category(db, clip_id, category_id)


@app.get('/clips', response_model=List[schemas.ClipName])
def get_clip_names(db: Session = Depends(get_db)):
    return crud.get_clips(db)


@app.get('/clips/{clip_id}', response_model=schemas.Clip)
def get_clip(clip_id: int, db: Session = Depends(get_db)):
    return crud.get_clip(db, clip_id)


@app.post('/clips', response_model=List[schemas.Clip])
def import_clips(db: Session = Depends(get_db)):
    config = get_config()

    try:
        files = util.list_files(config['imports'])
    except Exception as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={'message': str(e)}
        )

    clips = []

    for file in files:
        name, _ = splitext(file)
        clip = crud.add_clip(db, file, name)

        if clip is not None:
            clips.append(clip)

    return clips


@app.put('/clips/{clip_id}', response_model=schemas.Clip)
def update_clip(
    clip_id: int,
    meta: schemas.ClipUpdate,
    db: Session = Depends(get_db)
):
    return crud.update_clip(
        db,
        clip_id,
        meta.name,
        meta.studio_id,
        meta.series_id,
        meta.series_num
    )


@app.delete('/clips/{clip_id}', response_model=schemas.ClipDelete)
def delete_clip(
    clip_id: int,
    db: Session = Depends(get_db)
):
    crud.delete_clip(db, clip_id)

    return {
        'message': f'Successfully deleted clip {clip_id}'
    }


@app.get('/series', response_model=List[schemas.Series])
def get_series(db: Session = Depends(get_db)):
    return crud.get_series_all(db)


@app.post('/series', response_model=schemas.Series)
def add_series(name: str, db: Session = Depends(get_db)):
    return crud.add_series(db, name)


@app.get('/studios', response_model=List[schemas.Studio])
def get_studios(db: Session = Depends(get_db)):
    return crud.get_studios(db)


@app.post('/studios', response_model=schemas.Studio)
def add_studios(name: str, db: Session = Depends(get_db)):
    return crud.add_studio(db, name)
