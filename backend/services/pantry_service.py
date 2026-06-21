from sqlalchemy.orm import Session
from models import UserPantryItem, Ingredient
from services.cocktail_service import normalize_query


def _to_dict(item: UserPantryItem) -> dict:
    return {
        "id": item.id,
        "ingredient_name": item.ingredient_name,
        "ingredient_key": item.ingredient_key,
        "ingredient_id": item.ingredient_id,
    }


def list_items(db: Session, user_id: int) -> list:
    items = (
        db.query(UserPantryItem)
        .filter_by(user_id=user_id)
        .order_by(UserPantryItem.id)
        .all()
    )
    return [_to_dict(i) for i in items]


def add_item(db: Session, user_id: int, ingredient_name: str):
    key = normalize_query(ingredient_name)
    if not key:
        return None

    existing = db.query(UserPantryItem).filter_by(user_id=user_id, ingredient_key=key).first()
    if existing:
        return None  # caller raises 400

    catalogue = db.query(Ingredient).filter_by(name_key=key).first()
    item = UserPantryItem(
        user_id=user_id,
        ingredient_id=catalogue.id if catalogue else None,
        ingredient_name=ingredient_name.strip(),
        ingredient_key=key,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return _to_dict(item)


def remove_item(db: Session, user_id: int, ingredient_key: str) -> bool:
    key = normalize_query(ingredient_key)
    item = db.query(UserPantryItem).filter_by(user_id=user_id, ingredient_key=key).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True
