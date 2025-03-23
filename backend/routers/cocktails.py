from fastapi import APIRouter
from typing import List
from models import Cocktail
import random
from database import get_db_connection
from fastapi import Query
from fastapi import Request

router = APIRouter()

@router.get("/cocktails", response_model=List[Cocktail])
def get_cocktails():
    conn = get_db_connection()
    cursor = conn.cursor()
    rows = cursor.execute("SELECT id, strDrink, strCategory, strAlcoholic, strGlass, strDrinkThumb FROM drinks LIMIT 50").fetchall()
    conn.close()
    return [dict(row) for row in rows]

@router.get("/cocktails/{id}", response_model=Cocktail)
def get_cocktail_by_id(id: int):
    conn = get_db_connection()
    row = conn.execute("SELECT id, strDrink, strCategory, strAlcoholic, strGlass, strDrinkThumb FROM drinks WHERE id = ?", (id,)).fetchone()
    conn.close()
    if row is None:
        return {"error": "Cocktail not found"}
    return dict(row)

@router.get("/search", response_model=List[Cocktail])
def search_cocktails(query: str = Query(..., min_length=1)):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check name match
    query_like = f"%{query}%"
    name_matches = cursor.execute("""
        SELECT id, strDrink, strCategory, strAlcoholic, strGlass, strDrinkThumb
        FROM drinks
        WHERE strDrink LIKE ?
    """, (query_like,)).fetchall()

    # Check ingredient matches
    ingredient_matches = cursor.execute(f"""
        SELECT id, strDrink, strCategory, strAlcoholic, strGlass, strDrinkThumb
        FROM drinks
        WHERE {" OR ".join([f"strIngredient{i} LIKE ?" for i in range(1, 16)])}
    """, tuple([query_like] * 15)).fetchall()

    conn.close()

    # Combine and deduplicate by cocktail ID
    seen_ids = set()
    all_results = []

    for row in name_matches + ingredient_matches:
        if row["id"] not in seen_ids:
            seen_ids.add(row["id"])
            all_results.append(dict(row))

    return all_results

@router.get("/available", response_model=List[Cocktail])
def get_available_cocktails(has: str = Query(..., description="Comma-separated list of ingredients")):
    user_ingredients = [i.strip().lower() for i in has.split(",")]

    conn = get_db_connection()
    cursor = conn.cursor()

    rows = cursor.execute("""
        SELECT id, strDrink, strCategory, strAlcoholic, strGlass, strDrinkThumb,
               strIngredient1, strIngredient2, strIngredient3, strIngredient4, strIngredient5,
               strIngredient6, strIngredient7, strIngredient8, strIngredient9, strIngredient10,
               strIngredient11, strIngredient12, strIngredient13, strIngredient14, strIngredient15
        FROM drinks
    """).fetchall()
    conn.close()

    results = []
    for row in rows:
        ingredients = [row[f"strIngredient{i}"] for i in range(1, 16) if row[f"strIngredient{i}"]]
        ingredients_lower = [ing.lower() for ing in ingredients]

        # Check if ALL ingredients exist in user's list
        if all(ing in user_ingredients for ing in ingredients_lower):
            # Trim to only required fields
            results.append({
                "id": row["id"],
                "strDrink": row["strDrink"],
                "strCategory": row["strCategory"],
                "strAlcoholic": row["strAlcoholic"],
                "strGlass": row["strGlass"],
                "strDrinkThumb": row["strDrinkThumb"]
            })

    return results

import random

@router.get("/random", response_model=Cocktail)
def get_random_cocktail():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get total number of drinks
    count = cursor.execute("SELECT COUNT(*) FROM drinks").fetchone()[0]

    # Pick a random offset
    random_offset = random.randint(0, count - 1)

    # Get 1 random drink
    row = cursor.execute("""
        SELECT id, strDrink, strCategory, strAlcoholic, strGlass, strDrinkThumb
        FROM drinks
        LIMIT 1 OFFSET ?
    """, (random_offset,)).fetchone()

    conn.close()

    return dict(row)