from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from schemas import CocktailSummary, MessageResponse
from auth.dependencies import get_current_user
from services import favorite_service

router = APIRouter(prefix="/favorites", tags=["Favorites"])


@router.post("/", response_model=MessageResponse)
def add_favorite(
    favorite: schemas.FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    added = favorite_service.add(db, current_user.id, favorite.cocktail_id)
    if not added:
        raise HTTPException(status_code=400, detail="Already in favorites")
    return {"message": "Added to favorites"}


@router.get("/")
def get_favorites(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return favorite_service.list_ids(db, current_user.id)


@router.get("/cocktails", response_model=List[CocktailSummary])
def get_favorite_cocktails(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return favorite_service.list_cocktails(db, current_user.id)


@router.delete("/{cocktail_id}", response_model=MessageResponse)
def remove_favorite(
    cocktail_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    removed = favorite_service.remove(db, current_user.id, cocktail_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Favorite not found")
    return {"message": "Removed from favorites"}
