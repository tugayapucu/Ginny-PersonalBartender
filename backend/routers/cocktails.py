from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List
from models import Cocktail
import random
from database import get_db

router = APIRouter()

def normalize_query(value: str) -> str:
    return " ".join(value.strip().split()).lower()


@router.get("/cocktails", response_model=List[Cocktail])
def get_cocktails(db: Session = Depends(get_db)):
    rows = db.execute(
        text(
            "SELECT id, name, category, alcoholic, glass, thumb_url "
            "FROM drinks "
            "LIMIT 50"
        )
    ).mappings().all()
    return [dict(row) for row in rows]


@router.get("/cocktails/{id}", response_model=Cocktail)
def get_cocktail_by_id(id: int, db: Session = Depends(get_db)):
    row = db.execute(
        text(
            "SELECT id, name, category, alcoholic, glass, instructions, thumb_url "
            "FROM drinks "
            "WHERE id = :id"
        ),
        {"id": id},
    ).mappings().first()
    if row is None:
        return {"error": "Cocktail not found"}

    ingredients = db.execute(
        text(
            "SELECT i.name AS ingredient, di.measure AS measure "
            "FROM drink_ingredients di "
            "JOIN ingredients i ON i.id = di.ingredient_id "
            "WHERE di.drink_id = :id "
            "ORDER BY di.position"
        ),
        {"id": id},
    ).mappings().all()

    cocktail = dict(row)
    cocktail["ingredients"] = [dict(item) for item in ingredients]
    return cocktail


@router.get("/search", response_model=List[Cocktail])
def search_cocktails(query: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    query_like = f"%{normalize_query(query)}%"
    name_matches = db.execute(
        text(
            "SELECT id, name, category, alcoholic, glass, thumb_url "
            "FROM drinks "
            "WHERE LOWER(name) LIKE :query"
        ),
        {"query": query_like},
    ).mappings().all()

    ingredient_matches = db.execute(
        text(
            "SELECT DISTINCT d.id, d.name, d.category, d.alcoholic, d.glass, d.thumb_url "
            "FROM drinks d "
            "JOIN drink_ingredients di ON di.drink_id = d.id "
            "JOIN ingredients i ON i.id = di.ingredient_id "
            "WHERE i.name_key LIKE :query"
        ),
        {"query": query_like},
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
    ingredient_keys = [
        normalize_query(i)
        for i in has.split(",")
        if i.strip()
    ]
    if not ingredient_keys:
        return []

    placeholders = ", ".join([f":ing{i}" for i in range(len(ingredient_keys))])
    params = {f"ing{i}": ing for i, ing in enumerate(ingredient_keys)}

    rows = db.execute(
        text(
            "SELECT d.id, d.name, d.category, d.alcoholic, d.glass, d.thumb_url "
            "FROM drinks d "
            "JOIN drink_ingredients di ON di.drink_id = d.id "
            "JOIN ingredients i ON i.id = di.ingredient_id "
            "GROUP BY d.id "
            "HAVING SUM(CASE WHEN i.name_key IN (" + placeholders + ") THEN 1 ELSE 0 END) = COUNT(*)"
        ),
        params,
    ).mappings().all()

    return [dict(row) for row in rows]


@router.get("/random", response_model=Cocktail)
def get_random_cocktail(db: Session = Depends(get_db)):
    count = db.execute(text("SELECT COUNT(*) FROM drinks")).scalar()
    if not count:
        return {"error": "No cocktails available"}
    random_offset = random.randint(0, count - 1)
    row = db.execute(
        text(
            "SELECT id, name, category, alcoholic, glass, thumb_url "
            "FROM drinks "
            "LIMIT 1 OFFSET :offset"
        ),
        {"offset": random_offset},
    ).mappings().first()

    return dict(row)
