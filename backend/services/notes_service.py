import datetime
from typing import Optional
from sqlalchemy.orm import Session
from models import UserCocktailNote


def _row_to_dict(note: UserCocktailNote) -> dict:
    return {
        "id": note.id,
        "drink_id": note.drink_id,
        "rating": note.rating,
        "notes": note.notes,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
    }


def get_note(db: Session, user_id: int, drink_id: int) -> Optional[dict]:
    note = (
        db.query(UserCocktailNote)
        .filter(UserCocktailNote.user_id == user_id, UserCocktailNote.drink_id == drink_id)
        .first()
    )
    return _row_to_dict(note) if note else None


def upsert_note(
    db: Session,
    user_id: int,
    drink_id: int,
    rating: Optional[int],
    notes: Optional[str],
) -> dict:
    note = (
        db.query(UserCocktailNote)
        .filter(UserCocktailNote.user_id == user_id, UserCocktailNote.drink_id == drink_id)
        .first()
    )
    if note is None:
        note = UserCocktailNote(
            user_id=user_id,
            drink_id=drink_id,
            rating=rating,
            notes=notes,
        )
        db.add(note)
    else:
        note.rating = rating
        note.notes = notes
        note.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(note)
    return _row_to_dict(note)


def delete_note(db: Session, user_id: int, drink_id: int) -> bool:
    note = (
        db.query(UserCocktailNote)
        .filter(UserCocktailNote.user_id == user_id, UserCocktailNote.drink_id == drink_id)
        .first()
    )
    if note is None:
        return False
    db.delete(note)
    db.commit()
    return True
