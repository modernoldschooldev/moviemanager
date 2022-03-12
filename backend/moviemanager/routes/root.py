from fastapi import APIRouter
from fastapi.responses import RedirectResponse

router = APIRouter()


@router.get("/", include_in_schema=False)
def root():
    # redirect / to docs
    return RedirectResponse("/docs")
