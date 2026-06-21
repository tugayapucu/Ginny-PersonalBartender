import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base


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

    drink_id = Column(Integer, ForeignKey("drinks.id"), primary_key=True, nullable=False)
    position = Column(Integer, primary_key=True, nullable=False, default=0)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    measure = Column(String, nullable=True)

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
    pantry_items = relationship("UserPantryItem", back_populates="user", cascade="all, delete")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    cocktail_id = Column(String, nullable=False)

    user = relationship("User", back_populates="favorites")


class UserPantryItem(Base):
    __tablename__ = "user_pantry_items"
    __table_args__ = (
        UniqueConstraint("user_id", "ingredient_key", name="uq_pantry_user_ingredient"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=True)
    ingredient_name = Column(String, nullable=False)
    ingredient_key = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="pantry_items")
    ingredient = relationship("Ingredient")
