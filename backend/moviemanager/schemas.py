from typing import List, Optional

from pydantic import BaseModel


class MovieData(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


class Actor(MovieData):
    pass


class Category(MovieData):
    pass


class HTTPExceptionMessage(BaseModel):
    message: str


class HTTPExceptionSchema(BaseModel):
    detail: HTTPExceptionMessage


class MovieBase(BaseModel):
    id: int
    filename: str

    class Config:
        orm_mode = True


class MovieFile(MovieBase):
    pass


class Series(MovieData):
    pass


class Studio(MovieData):
    pass


class Movie(MovieBase):
    name: Optional[str] = None
    actors: Optional[List[Actor]] = None
    categories: Optional[List[Category]] = None
    series: Optional[Series] = None
    series_number: Optional[int] = None
    studio: Optional[Studio] = None

    class Config:
        orm_mode = True
