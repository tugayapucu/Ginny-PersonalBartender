from fastapi import APIRouter
from typing import List
from models import Cocktail
from database import get_db_connection
from fastapi import Query

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