# recreate the sqlite database from the current file/folder structure

import re
import sys
from typing import Dict

from . import crud, models
from .config import get_config
from .database import SessionLocal, engine
from .util import list_files


def parse_file(file: str) -> Dict[str, str]:
    regex = (
        r'^'
        r'\[([A-Za-z0-9 .\'-]+)\]'
        r'( {([A-Za-z0-9 .,\'-]+)})?'
        r'( ([A-Za-z0-9 .,\'-]+))?'
        r'( \(([A-Za-z0-9 \',]+)\))?'
        r'\.([a-z0-9]{3,4})'
        r'$'
    )

    series_regex = (
        r'^([A-Za-z0-9 ,.\'-]+?)( ([0-9]+))?$'
    )

    match = re.search(regex, file)

    if match is None:
        print(f'No match on {file}', file=sys.stderr)
        sys.exit(1)

    studio, _, series_str, _, name, _, actors_str, ext = match.groups()

    actors = []
    series, series_num = None, None

    if series_str is not None:
        match = re.search(series_regex, series_str)

        if not match:
            print(f'no match on {series_str}', file=sys.stderr)
            sys.exit(1)

        series, _, series_num = match.groups()

    if actors_str is not None:
        actors = actors_str.split(', ')

    return {
        'filename': file,
        'name': name,
        'studio': studio,
        'series': series,
        'series_num': series_num,
        'actors': actors,
        'fileext': ext,
    }


def _main():
    models.Base.metadata.create_all(bind=engine)

    config = get_config()

    try:
        files = list_files(config['files'])
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)

    try:
        categories = list_files(config['categories'])
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)

    clip_categories = {}

    for category in categories:
        category_path = f'{config["categories"]}/{category}'

        try:
            category_files = list_files(category_path)
        except Exception as e:
            print(str(e), file=sys.stderr)
            sys.exit(1)

        for file in category_files:
            if not file in clip_categories:
                clip_categories[file] = []

            clip_categories[file].append(category)

    db = SessionLocal()

    clips = []
    actors = []
    studios = []
    series = []

    for file in files:
        meta = parse_file(file)

        clips.append(meta)
        studios.append(meta['studio'])

        if meta['series'] is not None:
            series.append(meta['series'])

        if meta['actors'] is not None:
            actors.extend(meta['actors'])

    actors = sorted(set(actors))
    series = sorted(set(series))
    studios = sorted(set(studios))

    category_by_name = {
        category.name: category for category in [
            crud.add_category(db, category) for category in categories
        ]
    }

    actor_by_name = {
        actor.name: actor for actor in [
            crud.add_actor(db, actor) for actor in actors
        ]
    }

    series_by_name = {
        series.name: series for series in [
            crud.add_series(db, series_) for series_ in series
        ]
    }

    studio_by_name = {
        studio.name: studio for studio in [
            crud.add_studio(db, studio) for studio in studios
        ]
    }

    for clip in clips:
        actors = None
        categories = None
        series_id = None
        studio_id = None

        if clip['studio'] is not None:
            studio_id = studio_by_name[clip['studio']].id

        if clip['series'] is not None:
            series_id = series_by_name[clip['series']].id

        if len(clip['actors']) > 0:
            actors = [actor_by_name[name] for name in clip['actors']]

        if clip['filename'] in clip_categories:
            categories = [
                category_by_name[name]
                for name in clip_categories[clip['filename']]
            ]

        crud.add_clip(
            db,
            clip['filename'],
            clip['name'],
            studio_id,
            series_id,
            clip['series_num'],
            actors,
            categories,
            True,
        )


if __name__ == '__main__':
    _main()
