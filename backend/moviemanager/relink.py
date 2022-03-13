from . import config, crud, models, util
from .database import get_db_session, init_db


def relink_property_files():
    """Recreates property link files from database."""

    # setup logging
    config.setup_logging()
    logger = config.get_logger()

    # setup database connection
    init_db()
    db = next(get_db_session())

    movies = crud.get_all_movies(db)

    for movie in movies:
        logger.info("Processing %s", movie.filename)

        actor: models.Actor
        for actor in movie.actors:
            logger.info("Adding %s actor link", actor.name)
            util.update_actor_link(movie.filename, actor.name, True)

        category: models.Category
        for category in movie.categories:
            logger.info("Adding %s category link", category.name)
            util.update_category_link(movie.filename, category.name, True)

        if movie.series is not None:
            logger.info("Adding %s series link", movie.series.name)
            util.update_series_link(movie.filename, movie.series.name, True)

        if movie.studio is not None:
            logger.info("Adding %s studio link", movie.studio.name)
            util.update_studio_link(movie.filename, movie.studio.name, True)


if __name__ == "__main__":
    # invoke me with python -m moviemanager.relink
    relink_property_files()
