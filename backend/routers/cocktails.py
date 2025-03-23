from fastapi import APIRouter
from typing import List
from models import Cocktail
from database import get_db_connection

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
