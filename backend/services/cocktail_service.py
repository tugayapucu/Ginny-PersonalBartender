from sqlalchemy import func, case, distinct
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import random
from models import Drink, DrinkIngredient, Ingredient


def _to_summary(drink: Drink) -> dict:
    return {
        "id": drink.id,
        "name": drink.name,
        "category": drink.category,
        "alcoholic": drink.alcoholic,
        "glass": drink.glass,
        "thumb_url": drink.thumb_url,
    }


def normalize_query(value: str) -> str:
    return " ".join(value.strip().split()).lower()


def list_cocktails(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    category: Optional[str] = None,
    alcoholic: Optional[str] = None,
    glass: Optional[str] = None,
    ingredient: Optional[str] = None,
) -> dict:
    q = db.query(Drink)

    if category:
        q = q.filter(func.lower(Drink.category) == category.strip().lower())
    if alcoholic:
        q = q.filter(func.lower(Drink.alcoholic) == alcoholic.strip().lower())
    if glass:
        q = q.filter(func.lower(Drink.glass) == glass.strip().lower())
    if ingredient:
        norm = normalize_query(ingredient)
        q = (
            q.join(DrinkIngredient, Drink.id == DrinkIngredient.drink_id)
             .join(Ingredient, DrinkIngredient.ingredient_id == Ingredient.id)
             .filter(Ingredient.name_key == norm)
        )

    # count(distinct Drink.id) handles potential duplicate rows from ingredient join
    total = q.with_entities(func.count(distinct(Drink.id))).scalar()
    offset = (page - 1) * page_size
    drinks = q.distinct().order_by(Drink.id).offset(offset).limit(page_size).all()

    return {
        "items": [_to_summary(d) for d in drinks],
        "page": page,
        "page_size": page_size,
        "total": total,
    }


def get_by_id(db: Session, id: int) -> Optional[dict]:
    drink = (
        db.query(Drink)
        .options(
            joinedload(Drink.drink_ingredients).joinedload(DrinkIngredient.ingredient)
        )
        .filter(Drink.id == id)
        .first()
    )
    if drink is None:
        return None
    result = _to_summary(drink)
    result["instructions"] = drink.instructions
    result["ingredients"] = [
        {"ingredient": di.ingredient.name, "measure": di.measure}
        for di in sorted(drink.drink_ingredients, key=lambda di: di.position)
    ]
    return result


def search(db: Session, query: str, page: int = 1, page_size: int = 20) -> dict:
    query_like = f"%{normalize_query(query)}%"

    name_match_ids = [
        row.id for row in db.query(Drink.id)
        .filter(func.lower(Drink.name).like(query_like))
        .all()
    ]

    ingredient_match_ids = [
        row.id for row in db.query(Drink.id)
        .join(DrinkIngredient, Drink.id == DrinkIngredient.drink_id)
        .join(Ingredient, DrinkIngredient.ingredient_id == Ingredient.id)
        .filter(Ingredient.name_key.like(query_like))
        .distinct()
        .all()
    ]

    # Deduplicate while preserving name-match priority order
    seen: set = set()
    ordered_ids: List[int] = []
    for id_val in name_match_ids + ingredient_match_ids:
        if id_val not in seen:
            seen.add(id_val)
            ordered_ids.append(id_val)

    total = len(ordered_ids)
    offset = (page - 1) * page_size
    page_ids = ordered_ids[offset:offset + page_size]

    if not page_ids:
        return {"items": [], "page": page, "page_size": page_size, "total": total}

    drinks_by_id = {
        d.id: d for d in db.query(Drink).filter(Drink.id.in_(page_ids)).all()
    }
    items = [_to_summary(drinks_by_id[id_val]) for id_val in page_ids if id_val in drinks_by_id]
    return {"items": items, "page": page, "page_size": page_size, "total": total}


def get_available(db: Session, ingredient_keys: List[str]) -> List[dict]:
    if not ingredient_keys:
        return []

    # COUNT(DISTINCT CASE WHEN name_key IN (...) THEN name_key END) = n
    # finds drinks that contain all n requested ingredients.
    case_expr = case(
        (Ingredient.name_key.in_(ingredient_keys), Ingredient.name_key),
        else_=None,
    )
    matched_count = func.count(distinct(case_expr))

    drinks = (
        db.query(Drink)
        .join(DrinkIngredient, Drink.id == DrinkIngredient.drink_id)
        .join(Ingredient, DrinkIngredient.ingredient_id == Ingredient.id)
        .group_by(Drink.id)
        .having(matched_count == len(ingredient_keys))
        .all()
    )
    return [_to_summary(d) for d in drinks]


def get_random(db: Session) -> Optional[dict]:
    count = db.query(Drink).count()
    if not count:
        return None
    random_offset = random.randint(0, count - 1)
    drink = db.query(Drink).offset(random_offset).limit(1).first()
    return _to_summary(drink) if drink else None
