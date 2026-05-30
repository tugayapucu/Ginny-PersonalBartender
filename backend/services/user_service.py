from fastapi import HTTPException
from sqlalchemy.orm import Session
import models
import schemas
from security import hash_password, verify_password, validate_password_strength


def _to_dict(user: models.User) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "theme": user.theme,
        "is_active": user.is_active,
    }


def get_me(user: models.User) -> dict:
    return _to_dict(user)


def update_me(db: Session, user: models.User, payload: schemas.UserUpdate) -> dict:
    new_username = payload.username.strip() if payload.username is not None else None
    new_email = payload.email.strip() if payload.email is not None else None

    if new_username is None and new_email is None:
        raise HTTPException(status_code=400, detail="No updates provided")
    if new_username is not None and not new_username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")
    if new_email is not None and not new_email:
        raise HTTPException(status_code=400, detail="Email cannot be empty")

    if new_username is not None:
        taken = (
            db.query(models.User)
            .filter(models.User.username == new_username, models.User.id != user.id)
            .first()
        )
        if taken:
            raise HTTPException(status_code=400, detail="Username already taken")

    if new_email is not None:
        taken = (
            db.query(models.User)
            .filter(models.User.email == new_email, models.User.id != user.id)
            .first()
        )
        if taken:
            raise HTTPException(status_code=400, detail="Email already registered")

    if new_username is not None:
        user.username = new_username
    if new_email is not None:
        user.email = new_email

    db.commit()
    db.refresh(user)
    return _to_dict(user)


def update_preferences(db: Session, user: models.User, theme: str) -> dict:
    user.theme = theme
    db.commit()
    db.refresh(user)
    return _to_dict(user)


def change_password(db: Session, user: models.User, payload: schemas.PasswordChangeRequest) -> None:
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    try:
        validate_password_strength(payload.new_password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    user.hashed_password = hash_password(payload.new_password)
    db.commit()


def disable(db: Session, user: models.User) -> None:
    user.is_active = False
    db.commit()


def delete(db: Session, user: models.User) -> None:
    db.delete(user)
    db.commit()
