import os
import os.path

from .config import get_config, get_logger
from .models import Category, Clip

config = get_config()
logger = get_logger()


class ListFilesException(Exception):
    pass


def add_category_directory(name: str) -> None:
    path = f'{config["categories"]}/{name}'

    if not os.path.exists(path):
        os.mkdir(path)


def category_add(clip: Clip, category: Category):
    file_path = f'{config["files"]}/{clip.filename}'
    category_path = f'{config["categories"]}/{category.name}/{clip.filename}'

    logger.info(f'adding category link {category_path} -> {file_path}')
    os.symlink(file_path, category_path)


def category_remove(clip: Clip, category: Category):
    category_path = f'{config["categories"]}/{category.name}/{clip.filename}'

    if os.path.lexists(category_path):
        logger.info(f'removing category link {category_path}')
        os.remove(category_path)


def generate_filename(clip: Clip):
    filename = ''
    _, ext = os.path.splitext(clip.filename)

    if clip.studio is not None:
        filename += f'[{clip.studio.name}]'

    if clip.series is not None:
        if len(filename) > 0:
            filename += ' '

        filename += f'{{{clip.series.name}'

        if clip.series_num is not None:
            filename += f' {clip.series_num}'

        filename += '}'

    if clip.name is not None:
        if len(filename) > 0:
            filename += ' '

        filename += f'{clip.name}'

    if len(clip.actors) > 0:
        actors = [actor.name for actor in clip.actors]
        actor_str = f'({", ".join(actors)})'

        # skip actors if it would cause the filename to be longer than 250 chars
        if len(filename) + len(actor_str) < 250:
            if len(filename) > 0:
                filename += ' '

            filename += actor_str

    filename += ext

    return filename


def list_files(path: str) -> list[str]:
    try:
        files = sorted(os.listdir(path))
    except (FileNotFoundError, PermissionError):
        raise ListFilesException(f'Unable to read path {path}')

    return files


def migrate_file(clip: Clip, adding: bool = True):
    base_current = config['imports'] if adding else config['files']
    base_new = config['files'] if adding else config['imports']

    path_current = f'{base_current}/{clip.filename}'
    path_new = f'{base_new}/{clip.filename}'

    logger.info(f'migrating {path_current} -> {path_new}')
    os.rename(path_current, path_new)


def remove_clip(clip: Clip):
    migrate_file(clip, False)

    for category in clip.categories:
        path = f'{config["categories"]}/{category.name}/{clip.filename}'

        if os.path.lexists(path):
            logger.info(f'removing category link {path}')
            os.remove(path)


def rename_clip(clip: Clip):
    # save the old filename and get the new one
    filename_current = clip.filename
    filename_new = generate_filename(clip)

    # set the clip filename to the new filename
    clip.filename = filename_new

    # create paths for the current and new filenames
    base = config['files']
    path_current = f'{base}/{filename_current}'
    path_new = f'{base}/{filename_new}'

    # move file from the current path to the new path
    logger.info(f'renaming {path_current} -> {path_new}')
    os.rename(path_current, path_new)

    # handle the category links
    for category in clip.categories:
        # grab the path to the current category directory
        base_category = f'{config["categories"]}/{category.name}'

        # create paths for the current and new filenames
        path_current = f'{base_category}/{filename_current}'
        path_new = f'{base_category}/{filename_new}'

        # category links always go to the final files directory, never imports
        real_path = f'{config["files"]}/{filename_new}'

        # if the category link exists for the old filename, remove it
        if os.path.lexists(path_current):
            logger.info(f'removing old category link {path_current}')
            os.remove(path_current)

        # add a category link for the new filename
        logger.info(f'adding new category link {path_new} -> {real_path}')
        os.symlink(real_path, path_new)
