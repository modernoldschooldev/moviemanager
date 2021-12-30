from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Table
from sqlalchemy.orm import relationship

from .database import Base

################################################################################
# association tables

clip_actors = Table(
    'clip_actors',
    Base.metadata,
    Column('clip_id', ForeignKey('clips.id'), primary_key=True),
    Column('actor_id', ForeignKey('actors.id'), primary_key=True,)
)

clip_categories = Table(
    'clip_categories',
    Base.metadata,
    Column('clip_id', ForeignKey('clips.id'), primary_key=True),
    Column('category_id', ForeignKey('categories.id'), primary_key=True,)
)

################################################################################
# table models


class Actor(Base):
    __tablename__ = 'actors'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, unique=True)

    clips = relationship(
        'Clip',
        secondary=clip_actors,
        back_populates='actors',
    )


class Category(Base):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False, unique=True)

    clips = relationship(
        'Clip',
        secondary=clip_categories,
        back_populates='categories',
    )


class Clip(Base):
    __tablename__ = 'clips'

    id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=False, unique=True)
    name = Column(String(255), nullable=True)
    series_id = Column(Integer, ForeignKey('series.id'), nullable=True,)
    series_num = Column(Integer, nullable=True,)
    studio_id = Column(Integer, ForeignKey('studios.id'), nullable=True,)
    processed = Column(Boolean, default=False, nullable=False,)

    actors = relationship(
        'Actor',
        secondary=clip_actors,
        back_populates='clips',
        order_by='Actor.name',
    )
    categories = relationship(
        'Category',
        secondary=clip_categories,
        back_populates='clips',
        order_by='Category.name',
    )
    series = relationship(
        'Series',
        back_populates='clips',
        uselist=False,
        order_by='Series.name',
    )
    studio = relationship(
        'Studio',
        back_populates='clips',
        uselist=False,
        order_by='Studio.name',
    )


class Series(Base):
    __tablename__ = 'series'

    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False, unique=True)

    clips = relationship('Clip', back_populates='series')


class Studio(Base):
    __tablename__ = 'studios'

    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False, unique=True)

    clips = relationship('Clip', back_populates='studio')
