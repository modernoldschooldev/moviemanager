from typing import List, Optional

from pydantic import BaseModel

################################################################################
# Extensible Base Types


class BaseMovieSchema(BaseModel):
    """Base model for schemas about movies."""

    id: int
    filename: str

    class Config:
        orm_mode = True


class BasePropertySchema(BaseModel):
    """Base model for schemas about movie properties."""

    id: int
    name: str

    class Config:
        orm_mode = True


################################################################################
# Database Models


class ActorSchema(BasePropertySchema):
    """Schema describing an actor database object."""

    pass


class CategorySchema(BasePropertySchema):
    """Schema describing a category database object."""

    pass


class MovieFileSchema(BaseMovieSchema):
    """Limited movie schema with only the filename and ID."""

    pass


class SeriesSchema(BasePropertySchema):
    """Schema describing a series database object."""

    pass


class StudioSchema(BasePropertySchema):
    """Schema describing a studio database object."""

    pass


class MovieSchema(BaseMovieSchema):
    """Schema describing a movie database object."""

    ############################################################################
    # this class must defined after the property schemas
    # because it uses on their definitions

    name: Optional[str] = None
    actors: Optional[List[ActorSchema]] = None
    categories: Optional[List[CategorySchema]] = None
    series: Optional[SeriesSchema] = None
    series_number: Optional[int] = None
    studio: Optional[StudioSchema] = None

    class Config:
        orm_mode = True


################################################################################
# JSON Schemas


class MoviePropertySchema(BaseModel):
    """JSON body schema for a movie property."""

    name: str


class MovieUpdateSchema(BaseModel):
    """JSON body schema for a movie data update."""

    name: Optional[str] = None
    series_id: Optional[int] = None
    series_number: Optional[int] = None
    studio_id: Optional[int] = None


################################################################################
# Exception Models


class MessageSchema(BaseModel):
    """JSON schema for a descriptive message."""

    message: str


class HTTPExceptionSchema(BaseModel):
    """JSON schema for an HTTPException with a message."""

    detail: MessageSchema
