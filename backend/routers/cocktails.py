from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List
from models import Cocktail
from database import get_db
from services import cocktail_service

router = APIRouter()


@router.get("/cocktails", response_model=List[Cocktail])
def get_cocktails(db: Session = Depends(get_db)):
    return cocktail_service.list_cocktails(db)


@router.get("/cocktails/{id}", response_model=Cocktail)
def get_cocktail_by_id(id: int, db: Session = Depends(get_db)):
    result = cocktail_service.get_by_id(db, id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cocktail not found")
    return result


@router.get("/search", response_model=List[Cocktail])
def search_cocktails(query: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    return cocktail_service.search(db, query)


@router.get("/available", response_model=List[Cocktail])
def get_available_cocktails(
    has: str = Query(..., description="Comma-separated list of ingredients"),
    db: Session = Depends(get_db),
):
    ingredient_keys = [
        cocktail_service.normalize_query(i)
        for i in has.split(",")
        if i.strip()
    ]
    return cocktail_service.get_available(db, ingredient_keys)


@router.get("/random", response_model=Cocktail)
def get_random_cocktail(db: Session = Depends(get_db)):
    result = cocktail_service.get_random(db)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No cocktails available")
    return result
