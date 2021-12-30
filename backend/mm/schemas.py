from pydantic import BaseModel

from typing import Optional, List


class Actor(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


class Category(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

################################################################################
# Clip is defined later because it depends on classes defined after this section


class ClipBase(BaseModel):
    id: int
    filename: str


class ClipName(ClipBase):
    class Config:
        orm_mode = True


class ClipDelete(BaseModel):
    message: str


class ClipUpdate(BaseModel):
    name: Optional[str]
    studio_id: Optional[int]
    series_id: Optional[int]
    series_num: Optional[int]


class Series(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


class Studio(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


################################################################################
# Clip must be defined here
# It depends on Actor, Category, Series, and Studio
class Clip(ClipBase):
    name: Optional[str] = None
    actors: Optional[List[Actor]] = None
    categories: Optional[List[Category]] = None
    series: Optional[Series] = None
    series_num: Optional[int] = None
    studio: Optional[Studio] = None

    class Config:
        orm_mode = True
