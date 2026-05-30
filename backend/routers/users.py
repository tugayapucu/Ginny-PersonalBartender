from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth.dependencies import get_current_user
import models
import schemas
from services import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return user_service.get_me(current_user)


@router.patch("/me", response_model=schemas.UserResponse)
def update_me(
    payload: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return user_service.update_me(db, current_user, payload)


@router.patch("/me/preferences", response_model=schemas.UserResponse)
def update_preferences(
    payload: schemas.UserPreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return user_service.update_preferences(db, current_user, payload.theme)


@router.post("/me/password")
def change_password(
    payload: schemas.PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    user_service.change_password(db, current_user, payload)
    return {"message": "Password updated"}


@router.delete("/me")
def delete_account(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    user_service.delete(db, current_user)
    return {"message": "Account deleted"}


@router.post("/me/disable")
def disable_account(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    user_service.disable(db, current_user)
    return {"message": "Account disabled"}
