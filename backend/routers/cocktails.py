import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from schemas import CocktailSummary, CocktailDetail, PaginatedCocktailResponse
from services import cocktail_service

router = APIRouter()


@router.get("/cocktails", response_model=PaginatedCocktailResponse)
def get_cocktails(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None, description="Filter by category (case-insensitive)"),
    alcoholic: Optional[str] = Query(None, description="Filter by alcoholic value, e.g. 'Alcoholic'"),
    glass: Optional[str] = Query(None, description="Filter by glass type (case-insensitive)"),
    ingredient: Optional[str] = Query(None, description="Filter by ingredient name_key (case-insensitive)"),
    db: Session = Depends(get_db),
):
    return cocktail_service.list_cocktails(
        db,
        page=page,
        page_size=page_size,
        category=category,
        alcoholic=alcoholic,
        glass=glass,
        ingredient=ingredient,
    )


@router.get("/cocktails/{id}", response_model=CocktailDetail)
def get_cocktail_by_id(id: int, db: Session = Depends(get_db)):
    result = cocktail_service.get_by_id(db, id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cocktail not found")
    return result


@router.get("/search", response_model=PaginatedCocktailResponse)
def search_cocktails(
    query: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return cocktail_service.search(db, query, page=page, page_size=page_size)


@router.get("/available", response_model=List[CocktailSummary])
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


@router.get("/cocktail-of-the-day", response_model=CocktailDetail)
def get_cocktail_of_the_day(
    for_date: Optional[datetime.date] = Query(
        None,
        description="Date in YYYY-MM-DD format. Defaults to today (UTC). "
                    "Accepts an override so clients can retrieve any day's pick.",
    ),
    db: Session = Depends(get_db),
):
    target = for_date or datetime.datetime.now(datetime.timezone.utc).date()
    result = cocktail_service.get_by_date(db, target)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No cocktails available")
    return result


@router.get("/random", response_model=CocktailSummary)
def get_random_cocktail(db: Session = Depends(get_db)):
    result = cocktail_service.get_random(db)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No cocktails available")
    return result
