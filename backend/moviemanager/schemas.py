from typing import List, Optional

from pydantic import BaseModel

################################################################################
# Extensible Base Types


class BaseMovieSchema(BaseModel):
    id: int
    filename: str

    class Config:
        orm_mode = True


class BasePropertySchema(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

################################################################################
# Database Models


class ActorSchema(BasePropertySchema):
    pass


class CategorySchema(BasePropertySchema):
    pass


class MovieFileSchema(BaseMovieSchema):
    pass


class SeriesSchema(BasePropertySchema):
    pass


class StudioSchema(BasePropertySchema):
    pass


class MovieSchema(BaseMovieSchema):
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
    name: str


class MovieUpdateSchema(BaseModel):
    name: Optional[str] = None
    series_id: Optional[int] = None
    series_number: Optional[int] = None
    studio_id: Optional[int] = None

################################################################################
# Exception Models


class MessageSchema(BaseModel):
    message: str


class HTTPExceptionSchema(BaseModel):
    detail: MessageSchema
