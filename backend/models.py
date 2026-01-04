from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class CocktailIngredient(BaseModel):
    ingredient: str
    measure: Optional[str] = None

class Cocktail(BaseModel):
    id: int
    name: str
    category: Optional[str] = None
    alcoholic: Optional[str] = None
    glass: Optional[str] = None
    instructions: Optional[str] = None
    thumb_url: Optional[str] = None
    ingredients: Optional[List[CocktailIngredient]] = None

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    cocktail_id = Column(String, nullable=False)

    user = relationship("User", back_populates="favorites")


# Update User model if not already done
User.favorites = relationship("Favorite", back_populates="user", cascade="all, delete")
