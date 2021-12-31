from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Table
from sqlalchemy.orm import relationship

from .database import Base

################################################################################
# association tables

movie_actors = Table(
    'movie_actors',
    Base.metadata,
    Column('movie_id', ForeignKey('movies.id'), primary_key=True,),
    Column('actor_id', ForeignKey('actors.id'), primary_key=True,),
)

movie_categories = Table(
    'movie_categories',
    Base.metadata,
    Column('movie_id', ForeignKey('movies.id'), primary_key=True),
    Column('category_id', ForeignKey('categories.id'), primary_key=True,)
)

################################################################################
# table models


class Actor(Base):
    # Thanks to The Aelfinn for passive_deletes='all'
    # https://stackoverflow.com/a/42982117/1730980

    __tablename__ = 'actors'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, unique=True)

    movies = relationship(
        'Movie',
        secondary=movie_actors,
        back_populates='actors',
        order_by='Movie.sort_name',
        passive_deletes='all',
    )


class Category(Base):
    # Thanks to The Aelfinn for passive_deletes='all'
    # https://stackoverflow.com/a/42982117/1730980

    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, unique=True)

    movies = relationship(
        'Movie',
        secondary=movie_categories,
        back_populates='categories',
        order_by='Movie.sort_name',
        passive_deletes='all',
    )


class Movie(Base):
    __tablename__ = 'movies'

    id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=False, unique=True)
    name = Column(String(255), nullable=True)
    sort_name = Column(String(255), nullable=True)
    series_id = Column(Integer, ForeignKey('series.id'), nullable=True,)
    series_number = Column(Integer, nullable=True,)
    studio_id = Column(Integer, ForeignKey('studios.id'), nullable=True,)
    processed = Column(Boolean, default=False, nullable=False,)

    actors = relationship(
        'Actor',
        secondary=movie_actors,
        back_populates='movies',
        order_by='Actor.name',
    )

    categories = relationship(
        'Category',
        secondary=movie_categories,
        back_populates='movies',
        order_by='Category.name',
    )

    series = relationship(
        'Series',
        back_populates='movies',
        uselist=False,
    )

    studio = relationship(
        'Studio',
        back_populates='movies',
        uselist=False,
    )


class Series(Base):
    # Thanks to The Aelfinn for passive_deletes='all'
    # https://stackoverflow.com/a/42982117/1730980

    __tablename__ = 'series'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, unique=True)
    sort_name = Column(String(255), nullable=False, unique=True)

    movies = relationship(
        'Movie',
        back_populates='series',
        order_by='Movie.sort_name',
        passive_deletes='all',
    )


class Studio(Base):
    # Thanks to The Aelfinn for passive_deletes='all'
    # https://stackoverflow.com/a/42982117/1730980

    __tablename__ = 'studios'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, unique=True)
    sort_name = Column(String(255), nullable=False, unique=True)

    movies = relationship(
        'Movie',
        back_populates='studio',
        order_by='Movie.sort_name',
        passive_deletes='all',
    )
