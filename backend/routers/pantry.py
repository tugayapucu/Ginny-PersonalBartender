from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from auth.dependencies import get_current_user
from services import pantry_service

router = APIRouter(prefix="/pantry", tags=["Pantry"])


@router.get("/", response_model=List[schemas.PantryItemResponse])
def get_pantry(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return pantry_service.list_items(db, current_user.id)


@router.post("/", response_model=schemas.PantryItemResponse)
def add_to_pantry(
    item: schemas.PantryItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not item.ingredient_name.strip():
        raise HTTPException(status_code=422, detail="ingredient_name cannot be empty")
    result = pantry_service.add_item(db, current_user.id, item.ingredient_name)
    if result is None:
        raise HTTPException(status_code=400, detail="Ingredient already in pantry")
    return result


@router.delete("/{ingredient_key}", response_model=schemas.MessageResponse)
def remove_from_pantry(
    ingredient_key: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    removed = pantry_service.remove_item(db, current_user.id, ingredient_key)
    if not removed:
        raise HTTPException(status_code=404, detail="Pantry item not found")
    return {"message": "Removed from pantry"}
