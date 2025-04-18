from pydantic import BaseModel
from typing import Optional
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from database import Base

class Cocktail(BaseModel):
    id: int
    strDrink: str
    strCategory: Optional[str] = None
    strAlcoholic: Optional[str] = None
    strGlass: Optional[str] = None
    strDrinkThumb: Optional[str] = None
    strInstructions: Optional[str] = None

    # Add ingredients and measures 1–15
    strIngredient1: Optional[str] = None
    strIngredient2: Optional[str] = None
    strIngredient3: Optional[str] = None
    strIngredient4: Optional[str] = None
    strIngredient5: Optional[str] = None
    strIngredient6: Optional[str] = None
    strIngredient7: Optional[str] = None
    strIngredient8: Optional[str] = None
    strIngredient9: Optional[str] = None
    strIngredient10: Optional[str] = None
    strIngredient11: Optional[str] = None
    strIngredient12: Optional[str] = None
    strIngredient13: Optional[str] = None
    strIngredient14: Optional[str] = None
    strIngredient15: Optional[str] = None

    strMeasure1: Optional[str] = None
    strMeasure2: Optional[str] = None
    strMeasure3: Optional[str] = None
    strMeasure4: Optional[str] = None
    strMeasure5: Optional[str] = None
    strMeasure6: Optional[str] = None
    strMeasure7: Optional[str] = None
    strMeasure8: Optional[str] = None
    strMeasure9: Optional[str] = None
    strMeasure10: Optional[str] = None
    strMeasure11: Optional[str] = None
    strMeasure12: Optional[str] = None
    strMeasure13: Optional[str] = None
    strMeasure14: Optional[str] = None
    strMeasure15: Optional[str] = None

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)