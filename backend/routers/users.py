from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth.dependencies import get_current_user
from security import hash_password, verify_password, validate_password_strength
import models, schemas

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "theme": current_user.theme,
        "is_active": current_user.is_active,
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
        "theme": current_user.theme,
        "is_active": current_user.is_active,
    }


@router.patch("/me/preferences", response_model=schemas.UserResponse)
def update_preferences(
    payload: schemas.UserPreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    current_user.theme = payload.theme
    db.commit()
    db.refresh(current_user)
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "theme": current_user.theme,
        "is_active": current_user.is_active,
    }


@router.post("/me/password")
def change_password(
    payload: schemas.PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    try:
        validate_password_strength(payload.new_password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated"}


@router.delete("/me")
def delete_account(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted"}


@router.post("/me/disable")
def disable_account(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    current_user.is_active = False
    db.commit()
    return {"message": "Account disabled"}
