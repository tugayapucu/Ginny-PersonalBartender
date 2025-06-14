from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from models import Cocktail
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
import random

router = APIRouter()

@router.get("/cocktails", response_model=List[Cocktail])
def get_cocktails(db: Session = Depends(get_db)):
    rows = db.execute(text("SELECT * FROM drinks LIMIT 50")).fetchall()
    return [dict(row._mapping) for row in rows]

@router.get("/cocktails/{id}", response_model=Cocktail)
def get_cocktail_by_id(id: int, db: Session = Depends(get_db)):
    row = db.execute(
        text("SELECT * FROM drinks WHERE id = :id"),
        {"id": id},
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Cocktail not found")
    return dict(row._mapping)

@router.get("/search", response_model=List[Cocktail])
def search_cocktails(query: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    query_like = f"%{query}%"
    name_matches = db.execute(text(
        """
        SELECT id, strDrink, strCategory, strAlcoholic, strGlass, strDrinkThumb
        FROM drinks
        WHERE strDrink LIKE :qlike
        """
    ), {"qlike": query_like}).fetchall()

    ingredient_conditions = " OR ".join([f"strIngredient{i} LIKE :qlike" for i in range(1, 16)])
    ingredient_matches = db.execute(text(
        f"""
        SELECT id, strDrink, strCategory, strAlcoholic, strGlass, strDrinkThumb
        FROM drinks
        WHERE {ingredient_conditions}
        """
    ), {"qlike": query_like}).fetchall()

    # Combine and deduplicate by cocktail ID
    seen_ids = set()
    all_results = []

    for row in name_matches + ingredient_matches:
        if row["id"] not in seen_ids:
            seen_ids.add(row["id"])
            all_results.append(dict(row._mapping))

    return all_results

@router.get("/available", response_model=List[Cocktail])
def get_available_cocktails(
    has: str = Query(..., description="Comma-separated list of ingredients"),
    db: Session = Depends(get_db),
):
    user_ingredients = [i.strip().lower() for i in has.split(",")]

    rows = db.execute(text("SELECT * FROM drinks")).fetchall()

    results = []
    for row in rows:
        ingredients = [
            row[f"strIngredient{i}"].strip().lower()
            for i in range(1, 16)
            if row[f"strIngredient{i}"] and row[f"strIngredient{i}"].strip()
        ]

        if all(ing in user_ingredients for ing in ingredients):
            results.append(dict(row._mapping))

    return results

import random

@router.get("/random", response_model=Cocktail)
def get_random_cocktail(db: Session = Depends(get_db)):
    # Get total number of drinks
    count = db.execute(text("SELECT COUNT(*) FROM drinks")).scalar()

    # Pick a random offset
    random_offset = random.randint(0, count - 1)

    # Get 1 random drink
    row = db.execute(
        text(
            """
            SELECT id, strDrink, strCategory, strAlcoholic, strGlass, strDrinkThumb
            FROM drinks
            LIMIT 1 OFFSET :offset
            """
        ),
        {"offset": random_offset},
    ).fetchone()

    return dict(row._mapping)
