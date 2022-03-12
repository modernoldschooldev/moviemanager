from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import setup_logging
from .database import init_db
from .routes import (
    actors,
    categories,
    movie_actors,
    movie_categories,
    movies,
    root,
    series,
    studios,
)

# create FastAPI application
description = """# Movie Manager Backend

Backend API for the Modern Old School Developer's Movie Manager Application

[GitHub Link](https://github.com/modernoldschooldev/moviemanager)
"""

app = FastAPI(
    title="Movie Manager Backend",
    description=description,
    version="2.2.2",
    license_info={
        "name": "GPLv3",
        "url": "https://www.gnu.org/licenses/gpl-3.0.en.html",
    },
)

# add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(?:127\.0\.0\.1|localhost)(?::300[0-9])?",
    allow_methods=["*"],
    allow_headers=["*"],
)


################################################################################
# API Routers

app.include_router(root.router)
app.include_router(actors.router)
app.include_router(categories.router)
app.include_router(movie_actors.router)
app.include_router(movie_categories.router)
app.include_router(movies.router)
app.include_router(series.router)
app.include_router(studios.router)

################################################################################
# setup logging and database connection

setup_logging()
init_db()
