from fastapi import APIRouter, Depends
from typing import List
from models import Cocktail
import random
from database import get_sqlite_db
from fastapi import Query
from fastapi import Request
import sqlite3

router = APIRouter()

@router.get("/cocktails", response_model=List[Cocktail])
def get_cocktails(conn: sqlite3.Connection = Depends(get_sqlite_db)):
    cursor = conn.cursor()

    rows = cursor.execute("SELECT * FROM drinks LIMIT 50").fetchall()

    return [dict(row) for row in rows]

@router.get("/cocktails/{id}", response_model=Cocktail)
def get_cocktail_by_id(id: int, conn: sqlite3.Connection = Depends(get_sqlite_db)):
    row = conn.execute("SELECT * FROM drinks WHERE id = ?", (id,)).fetchone()
    if row is None:
        return {"error": "Cocktail not found"}
    return dict(row)

@router.get("/search", response_model=List[Cocktail])
def search_cocktails(query: str = Query(..., min_length=1), conn: sqlite3.Connection = Depends(get_sqlite_db)):
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

    # Combine and deduplicate results
    all_results = {}
    for row in name_matches + ingredient_matches:
        all_results[row['id']] = dict(row)

    return list(all_results.values())

@router.get("/available-cocktails")
def get_available_cocktails(request: Request, conn: sqlite3.Connection = Depends(get_sqlite_db)):
    cursor = conn.cursor()

    rows = cursor.execute("SELECT * FROM drinks").fetchall()

    cocktails = [dict(row) for row in rows]
    
    # For demonstration, let's assume all cocktails are "available"
    return {"available_cocktails": cocktails}

@router.get("/random", response_model=List[Cocktail])
def get_random_cocktails(count: int = Query(default=5, ge=1, le=20), conn: sqlite3.Connection = Depends(get_sqlite_db)):
    cursor = conn.cursor()

    # Get total number of drinks
    count = cursor.execute("SELECT COUNT(*) FROM drinks").fetchone()[0]

    # Pick a random offset
    offset = random.randint(0, max(0, count - count))
    
    rows = cursor.execute("SELECT * FROM drinks LIMIT ? OFFSET ?", (count, offset)).fetchall()
    
    return [dict(row) for row in rows]