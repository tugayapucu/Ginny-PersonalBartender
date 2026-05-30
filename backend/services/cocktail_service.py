from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List
import random


def normalize_query(value: str) -> str:
    return " ".join(value.strip().split()).lower()


def list_cocktails(db: Session) -> List[dict]:
    rows = db.execute(
        text(
            "SELECT id, name, category, alcoholic, glass, thumb_url "
            "FROM drinks "
            "LIMIT 50"
        )
    ).mappings().all()
    return [dict(row) for row in rows]


def get_by_id(db: Session, id: int):
    row = db.execute(
        text(
            "SELECT id, name, category, alcoholic, glass, instructions, thumb_url "
            "FROM drinks "
            "WHERE id = :id"
        ),
        {"id": id},
    ).mappings().first()
    if row is None:
        return None

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


def search(db: Session, query: str) -> List[dict]:
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

    seen_ids: set = set()
    all_results: List[dict] = []
    for row in name_matches + ingredient_matches:
        if row["id"] not in seen_ids:
            seen_ids.add(row["id"])
            all_results.append(dict(row))

    return all_results


def get_available(db: Session, ingredient_keys: List[str]) -> List[dict]:
    if not ingredient_keys:
        return []

    placeholders = ", ".join([f":ing{i}" for i in range(len(ingredient_keys))])
    params = {f"ing{i}": ing for i, ing in enumerate(ingredient_keys)}
    params["ingredient_count"] = len(ingredient_keys)

    rows = db.execute(
        text(
            "SELECT d.id, d.name, d.category, d.alcoholic, d.glass, d.thumb_url "
            "FROM drinks d "
            "JOIN drink_ingredients di ON di.drink_id = d.id "
            "JOIN ingredients i ON i.id = di.ingredient_id "
            "GROUP BY d.id "
            "HAVING COUNT(DISTINCT CASE WHEN i.name_key IN ("
            + placeholders
            + ") THEN i.name_key END) = :ingredient_count"
        ),
        params,
    ).mappings().all()

    return [dict(row) for row in rows]


def get_random(db: Session):
    count = db.execute(text("SELECT COUNT(*) FROM drinks")).scalar()
    if not count:
        return None
    random_offset = random.randint(0, count - 1)
    row = db.execute(
        text(
            "SELECT id, name, category, alcoholic, glass, thumb_url "
            "FROM drinks "
            "LIMIT 1 OFFSET :offset"
        ),
        {"offset": random_offset},
    ).mappings().first()
    return dict(row) if row else None
