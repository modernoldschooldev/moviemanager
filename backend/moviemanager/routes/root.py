from fastapi import APIRouter
from fastapi.responses import RedirectResponse

router = APIRouter()


@router.get("/")
def root():
    # redirect / to docs
    return RedirectResponse("/docs")
