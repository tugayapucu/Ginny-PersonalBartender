from fastapi import HTTPException
from sqlalchemy.orm import Session
import models
import schemas
from security import hash_password, verify_password, create_access_token, validate_password_strength


def register(db: Session, data: schemas.RegisterRequest) -> dict:
    try:
        validate_password_strength(data.password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if db.query(models.User).filter(models.User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(models.User).filter(models.User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = models.User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User registered successfully"}


def login(db: Session, data: schemas.LoginRequest) -> dict:
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}
