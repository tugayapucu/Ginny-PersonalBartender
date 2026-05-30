from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List
import models


def add(db: Session, user_id: int, cocktail_id: str) -> bool:
    existing = db.query(models.Favorite).filter_by(
        user_id=user_id, cocktail_id=cocktail_id
    ).first()
    if existing:
        return False
    new_fav = models.Favorite(user_id=user_id, cocktail_id=cocktail_id)
    db.add(new_fav)
    db.commit()
    return True


def list_ids(db: Session, user_id: int) -> List[str]:
    favorites = db.query(models.Favorite).filter_by(user_id=user_id).all()
    return [fav.cocktail_id for fav in favorites]


def list_cocktails(db: Session, user_id: int) -> List[dict]:
    rows = db.execute(
        text(
            "SELECT d.id, d.name, d.category, d.alcoholic, d.glass, d.thumb_url "
            "FROM favorites f "
            "JOIN drinks d ON d.id = CAST(f.cocktail_id AS INTEGER) "
            "WHERE f.user_id = :user_id "
            "ORDER BY f.id DESC"
        ),
        {"user_id": user_id},
    ).mappings().all()
    return [dict(row) for row in rows]


def remove(db: Session, user_id: int, cocktail_id: str) -> bool:
    fav = db.query(models.Favorite).filter_by(
        user_id=user_id, cocktail_id=cocktail_id
    ).first()
    if not fav:
        return False
    db.delete(fav)
    db.commit()
    return True
