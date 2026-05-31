from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import schemas
from schemas import MessageResponse
from services import auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=MessageResponse)
def register(data: schemas.RegisterRequest, db: Session = Depends(get_db)):
    return auth_service.register(db, data)


@router.post("/login")
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login(db, data)
