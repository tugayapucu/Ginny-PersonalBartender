from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


# ---------------------------------------------------------------------------
# Pydantic response models (used by routers/cocktails.py)
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# SQLAlchemy ORM models — cocktail catalogue (read-only reference data)
# ---------------------------------------------------------------------------

class Drink(Base):
    __tablename__ = "drinks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    alcoholic = Column(String, nullable=True)
    glass = Column(String, nullable=True)
    instructions = Column(String, nullable=True)
    thumb_url = Column(String, nullable=True)

    drink_ingredients = relationship(
        "DrinkIngredient", back_populates="drink", cascade="all, delete-orphan"
    )


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    name_key = Column(String, nullable=False, index=True)

    drink_ingredients = relationship("DrinkIngredient", back_populates="ingredient")


class DrinkIngredient(Base):
    __tablename__ = "drink_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    drink_id = Column(Integer, ForeignKey("drinks.id"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    measure = Column(String, nullable=True)
    position = Column(Integer, nullable=False, default=0)

    drink = relationship("Drink", back_populates="drink_ingredients")
    ingredient = relationship("Ingredient", back_populates="drink_ingredients")


# ---------------------------------------------------------------------------
# SQLAlchemy ORM models — user data (managed by Alembic migrations)
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    theme = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    favorites = relationship("Favorite", back_populates="user", cascade="all, delete")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    cocktail_id = Column(String, nullable=False)

    user = relationship("User", back_populates="favorites")
