from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List
from models import Cocktail
import random
from database import get_db

router = APIRouter()


@router.get("/cocktails", response_model=List[Cocktail])
def get_cocktails(db: Session = Depends(get_db)):
    rows = db.execute(text("SELECT * FROM drinks LIMIT 50")).mappings().all()
    return [dict(row) for row in rows]


@router.get("/cocktails/{id}", response_model=Cocktail)
def get_cocktail_by_id(id: int, db: Session = Depends(get_db)):
    row = db.execute(
        text("SELECT * FROM drinks WHERE id = :id"),
        {"id": id},
    ).mappings().first()
    if row is None:
        return {"error": "Cocktail not found"}
    return dict(row)


@router.get("/search", response_model=List[Cocktail])
def search_cocktails(query: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    query_like = f"%{query}%"
    name_matches = db.execute(
        text(
            "SELECT id, strDrink, strCategory, strAlcoholic, strGlass, strDrinkThumb "
            "FROM drinks "
            "WHERE strDrink LIKE :query"
        ),
        {"query": query_like},
    ).mappings().all()

    ingredient_conditions = " OR ".join(
        [f"strIngredient{i} LIKE :ing{i}" for i in range(1, 16)]
    )
    ingredient_params = {f"ing{i}": query_like for i in range(1, 16)}
    ingredient_matches = db.execute(
        text(
            "SELECT id, strDrink, strCategory, strAlcoholic, strGlass, strDrinkThumb "
            f"FROM drinks WHERE {ingredient_conditions}"
        ),
        ingredient_params,
    ).mappings().all()

    seen_ids = set()
    all_results = []
    for row in name_matches + ingredient_matches:
        if row["id"] not in seen_ids:
            seen_ids.add(row["id"])
            all_results.append(dict(row))

    return all_results


@router.get("/available", response_model=List[Cocktail])
def get_available_cocktails(
    has: str = Query(..., description="Comma-separated list of ingredients"),
    db: Session = Depends(get_db),
):
    user_ingredients = [i.strip().lower() for i in has.split(",")]
    rows = db.execute(text("SELECT * FROM drinks")).mappings().all()

    results = []
    for row in rows:
        ingredients = [
            row[f"strIngredient{i}"].strip().lower()
            for i in range(1, 16)
            if row[f"strIngredient{i}"] and row[f"strIngredient{i}"].strip()
        ]

        if all(ing in user_ingredients for ing in ingredients):
            results.append(dict(row))

    return results


@router.get("/random", response_model=Cocktail)
def get_random_cocktail(db: Session = Depends(get_db)):
    count = db.execute(text("SELECT COUNT(*) FROM drinks")).scalar()
    random_offset = random.randint(0, count - 1)
    row = db.execute(
        text(
            "SELECT id, strDrink, strCategory, strAlcoholic, strGlass, strDrinkThumb "
            "FROM drinks "
            "LIMIT 1 OFFSET :offset"
        ),
        {"offset": random_offset},
    ).mappings().first()

    return dict(row)
