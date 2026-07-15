from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from auth.dependencies import get_current_user
from schemas import RecommendationItem
from services import recommendations_service
import models

router = APIRouter(tags=["recommendations"])


@router.get("/recommendations", response_model=List[RecommendationItem])
def get_recommendations(
    limit: int = Query(10, ge=1, le=50),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return recommendations_service.get_recommendations(db, current_user.id, limit)
