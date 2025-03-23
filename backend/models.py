from pydantic import BaseModel
from typing import Optional

class Cocktail(BaseModel):
    id: int
    strDrink: str
    strCategory: Optional[str]
    strAlcoholic: Optional[str]
    strGlass: Optional[str]
    strDrinkThumb: Optional[str]
