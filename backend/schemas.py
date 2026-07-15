from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Literal


# ---------------------------------------------------------------------------
# Cocktail response schemas
# ---------------------------------------------------------------------------

class CocktailIngredient(BaseModel):
    ingredient: str
    measure: Optional[str] = None


class CocktailSummary(BaseModel):
    """Used in list, search, available, random, and favorites responses."""
    id: int
    name: str
    category: Optional[str] = None
    alcoholic: Optional[str] = None
    glass: Optional[str] = None
    thumb_url: Optional[str] = None


class CocktailDetail(CocktailSummary):
    """Used in single-cocktail detail responses. Extends CocktailSummary."""
    instructions: Optional[str] = None
    ingredients: List[CocktailIngredient] = []


class PaginatedCocktailResponse(BaseModel):
    items: List[CocktailSummary]
    page: int
    page_size: int
    total: int


# ---------------------------------------------------------------------------
# Generic response schemas
# ---------------------------------------------------------------------------

class MessageResponse(BaseModel):
    message: str


# ---------------------------------------------------------------------------
# Auth request schemas
# ---------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ---------------------------------------------------------------------------
# Favorites request schemas
# ---------------------------------------------------------------------------

class FavoriteCreate(BaseModel):
    cocktail_id: str


# ---------------------------------------------------------------------------
# User response and request schemas
# ---------------------------------------------------------------------------

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    theme: Optional[str] = None
    is_active: Optional[bool] = None


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


class UserPreferencesUpdate(BaseModel):
    theme: Literal["light", "dark", "system"]


# ---------------------------------------------------------------------------
# Pantry schemas
# ---------------------------------------------------------------------------

class CocktailAvailabilityResult(CocktailSummary):
    """CocktailSummary extended with per-cocktail match metadata."""
    matched_ingredients: List[str] = []
    missing_ingredients: List[str] = []
    match_percentage: float = 0.0


class PaginatedAvailabilityResponse(BaseModel):
    items: List[CocktailAvailabilityResult]
    page: int
    page_size: int
    total: int


# ---------------------------------------------------------------------------
# Pantry schemas
# ---------------------------------------------------------------------------

class PantryItemCreate(BaseModel):
    ingredient_name: str


class PantryItemResponse(BaseModel):
    id: int
    ingredient_name: str
    ingredient_key: str
    ingredient_id: Optional[int] = None


# ---------------------------------------------------------------------------
# Tasting notes schemas
# ---------------------------------------------------------------------------

class NoteUpsert(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = None


class NoteResponse(BaseModel):
    id: int
    drink_id: int
    rating: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Recommendations schemas
# ---------------------------------------------------------------------------

class RecommendationItem(CocktailSummary):
    score: float
    reasons: List[str]
