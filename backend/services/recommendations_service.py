"""
Rule-based personalized cocktail recommendations.

Scoring weights:
  pantry coverage  – up to 1.0  (matched_ingredients / total_ingredients)
  category match   – +0.20 when cocktail category matches any favorited cocktail's category
  glass match      – +0.10 when glass matches any favorited cocktail's glass type
  rating boost     – +0.15 when category matches any cocktail the user rated 4 or 5 stars

Favorited cocktails are excluded entirely from results so the user isn't
shown drinks they have already saved.

Results are sorted by score descending, then by drink id ascending so output
is fully deterministic regardless of DB insertion order.
"""
from sqlalchemy.orm import Session, joinedload
from models import Drink, DrinkIngredient, Favorite, UserPantryItem, UserCocktailNote


def _score(
    drink: Drink,
    pantry_keys: set,
    fav_categories: set,
    fav_glasses: set,
    high_rated_categories: set,
) -> tuple[float, list[str]]:
    score = 0.0
    reasons: list[str] = []

    ingredient_keys = {
        di.ingredient.name_key
        for di in drink.drink_ingredients
        if di.ingredient
    }
    total = len(ingredient_keys)

    if total > 0 and pantry_keys:
        matched = len(ingredient_keys & pantry_keys)
        if matched > 0:
            score += matched / total
            reasons.append(f"Uses {matched} of {total} ingredients from your pantry")

    if drink.category and drink.category in fav_categories:
        score += 0.20
        reasons.append("Similar category to your favorites")

    if drink.glass and drink.glass in fav_glasses:
        score += 0.10
        reasons.append("Matches your preferred glass type")

    if drink.category and drink.category in high_rated_categories:
        score += 0.15
        reasons.append("Matches categories you enjoy")

    return score, reasons


def get_recommendations(db: Session, user_id: int, limit: int = 10) -> list[dict]:
    # Pantry ingredient keys
    pantry_rows = db.query(UserPantryItem).filter(UserPantryItem.user_id == user_id).all()
    pantry_keys = {row.ingredient_key for row in pantry_rows}

    # Favorited cocktail IDs (stored as strings in the DB)
    fav_rows = db.query(Favorite).filter(Favorite.user_id == user_id).all()
    fav_ids = {int(row.cocktail_id) for row in fav_rows}

    # Categories and glasses from favorited cocktails
    fav_categories: set = set()
    fav_glasses: set = set()
    if fav_ids:
        fav_drinks = db.query(Drink).filter(Drink.id.in_(fav_ids)).all()
        for d in fav_drinks:
            if d.category:
                fav_categories.add(d.category)
            if d.glass:
                fav_glasses.add(d.glass)

    # Categories from cocktails rated 4 or 5 stars
    high_rated_categories: set = set()
    high_notes = (
        db.query(UserCocktailNote)
        .filter(UserCocktailNote.user_id == user_id, UserCocktailNote.rating >= 4)
        .all()
    )
    if high_notes:
        rated_ids = {note.drink_id for note in high_notes}
        rated_drinks = db.query(Drink).filter(Drink.id.in_(rated_ids)).all()
        for d in rated_drinks:
            if d.category:
                high_rated_categories.add(d.category)

    # Candidate cocktails: everything the user has NOT favorited
    query = (
        db.query(Drink)
        .options(joinedload(Drink.drink_ingredients).joinedload(DrinkIngredient.ingredient))
    )
    if fav_ids:
        query = query.filter(~Drink.id.in_(fav_ids))
    candidates = query.all()

    # Score and collect
    scored: list[dict] = []
    for drink in candidates:
        score, reasons = _score(drink, pantry_keys, fav_categories, fav_glasses, high_rated_categories)
        scored.append({
            "id": drink.id,
            "name": drink.name,
            "category": drink.category,
            "alcoholic": drink.alcoholic,
            "glass": drink.glass,
            "thumb_url": drink.thumb_url,
            "score": score,
            "reasons": reasons,
        })

    scored.sort(key=lambda x: (-x["score"], x["id"]))
    return scored[:limit]
