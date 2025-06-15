# routers/favorites.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from auth.dependencies import get_current_user  # This will extract user from token

router = APIRouter(prefix="/favorites", tags=["Favorites"])


@router.post("/")
def add_favorite(
    favorite: schemas.FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check if already favorited
    existing = db.query(models.Favorite).filter_by(
        user_id=current_user.id, cocktail_id=favorite.cocktail_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already in favorites")

    new_fav = models.Favorite(user_id=current_user.id, cocktail_id=favorite.cocktail_id)
    db.add(new_fav)
    db.commit()
    return {"message": "Added to favorites"}


@router.get("/")
def get_favorites(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    favorites = db.query(models.Favorite).filter_by(user_id=current_user.id).all()
    return [fav.cocktail_id for fav in favorites]


@router.delete("/{cocktail_id}")
def remove_favorite(
    cocktail_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    fav = db.query(models.Favorite).filter_by(
        user_id=current_user.id, cocktail_id=cocktail_id
    ).first()

    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")

    db.delete(fav)
    db.commit()
    return {"message": "Removed from favorites"}
