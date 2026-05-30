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


def list_cocktails(db: Session) -> List[dict]:
    drinks = db.query(Drink).limit(50).all()
    return [_to_summary(d) for d in drinks]


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


def search(db: Session, query: str) -> List[dict]:
    query_like = f"%{normalize_query(query)}%"

    name_matches = (
        db.query(Drink)
        .filter(func.lower(Drink.name).like(query_like))
        .all()
    )

    ingredient_matches = (
        db.query(Drink)
        .join(DrinkIngredient, Drink.id == DrinkIngredient.drink_id)
        .join(Ingredient, DrinkIngredient.ingredient_id == Ingredient.id)
        .filter(Ingredient.name_key.like(query_like))
        .distinct()
        .all()
    )

    seen_ids: set = set()
    results: List[dict] = []
    for drink in name_matches + ingredient_matches:
        if drink.id not in seen_ids:
            seen_ids.add(drink.id)
            results.append(_to_summary(drink))
    return results


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
