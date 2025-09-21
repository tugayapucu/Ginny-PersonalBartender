# db/models/cocktail.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class Cocktail(Base):
    __tablename__ = "cocktails"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(100))
    alcoholic = Column(String(50))
    glass = Column(String(100))
    image_url = Column(String(500))
    instructions = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    ingredients = relationship("CocktailIngredient", back_populates="cocktail", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="cocktail", cascade="all, delete-orphan")

class CocktailIngredient(Base):
    __tablename__ = "cocktail_ingredients"
    
    id = Column(Integer, primary_key=True, index=True)
    cocktail_id = Column(Integer, ForeignKey("cocktails.id"), nullable=False)
    ingredient_name = Column(String(255), nullable=False)
    measure = Column(String(100))
    order = Column(Integer, default=1)
    
    cocktail = relationship("Cocktail", back_populates="ingredients")

class Favorite(Base):
    __tablename__ = "favorites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cocktail_id = Column(Integer, ForeignKey("cocktails.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="favorites")
    cocktail = relationship("Cocktail", back_populates="favorites")