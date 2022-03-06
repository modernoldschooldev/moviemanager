from fastapi import APIRouter

from ..schemas import MessageSchema

router = APIRouter()


@router.get(
    "/",
    response_model=MessageSchema,
)
def hello():
    return {"message": "Hello from FastAPI"}
