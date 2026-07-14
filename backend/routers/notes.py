from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth.dependencies import get_current_user
from schemas import NoteUpsert, NoteResponse, MessageResponse
from services import notes_service
import models

router = APIRouter(tags=["notes"])


@router.get("/cocktails/{drink_id}/my-note", response_model=NoteResponse)
def get_my_note(
    drink_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = notes_service.get_note(db, current_user.id, drink_id)
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.put("/cocktails/{drink_id}/my-note", response_model=NoteResponse)
def upsert_my_note(
    drink_id: int,
    payload: NoteUpsert,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    drink = db.query(models.Drink).filter(models.Drink.id == drink_id).first()
    if drink is None:
        raise HTTPException(status_code=404, detail="Cocktail not found")
    return notes_service.upsert_note(db, current_user.id, drink_id, payload.rating, payload.notes)


@router.delete("/cocktails/{drink_id}/my-note", response_model=MessageResponse)
def delete_my_note(
    drink_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = notes_service.delete_note(db, current_user.id, drink_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": "Note deleted"}
