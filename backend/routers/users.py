from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth.dependencies import get_current_user
import models, schemas

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
    }


@router.patch("/me", response_model=schemas.UserResponse)
def update_me(
    payload: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_username = payload.username.strip() if payload.username is not None else None
    new_email = payload.email.strip() if payload.email is not None else None

    if new_username is None and new_email is None:
        raise HTTPException(status_code=400, detail="No updates provided")
    if new_username is not None and not new_username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")
    if new_email is not None and not new_email:
        raise HTTPException(status_code=400, detail="Email cannot be empty")

    if new_username is not None:
        existing_username = (
            db.query(models.User)
            .filter(models.User.username == new_username, models.User.id != current_user.id)
            .first()
        )
        if existing_username:
            raise HTTPException(status_code=400, detail="Username already taken")

    if new_email is not None:
        existing_email = (
            db.query(models.User)
            .filter(models.User.email == new_email, models.User.id != current_user.id)
            .first()
        )
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")

    if new_username is not None:
        current_user.username = new_username
    if new_email is not None:
        current_user.email = new_email

    db.commit()
    db.refresh(current_user)

    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
    }
