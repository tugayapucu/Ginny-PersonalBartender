"""
Seed the cocktail catalogue tables from cocktails_all.jsonl.

Usage (from repo root):
    python backend/scripts/seed_cocktails.py
    python backend/scripts/seed_cocktails.py path/to/cocktails_all.jsonl

The script is idempotent: it clears and reloads the three catalogue
tables (drinks, ingredients, drink_ingredients) on every run.
User accounts and favourites are never touched.
"""

import json
import sys
from pathlib import Path

# Allow imports from backend/ regardless of the working directory.
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import text  # noqa: E402  (import after sys.path patch)
from database import engine  # noqa: E402


REPO_ROOT = BACKEND_DIR.parent
DEFAULT_JSONL = REPO_ROOT / "cocktails_all.jsonl"


def normalize(value: str) -> str:
    """Lowercase, strip, and collapse internal whitespace — matches search logic."""
    return " ".join(value.strip().split()).lower()


def load_records(jsonl_path: Path) -> list[dict]:
    with open(jsonl_path, encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def collect_ingredients(records: list[dict]) -> dict[str, tuple[int, str]]:
    """
    Return a mapping of name_key -> (id, canonical_display_name).
    IDs are assigned in first-seen order. The first occurrence of a
    name sets the canonical display name for that ingredient.
    """
    result: dict[str, tuple[int, str]] = {}
    next_id = 1
    for rec in records:
        for ing in rec.get("ingredients") or []:
            raw = (ing.get("ingredient") or "").strip()
            if not raw:
                continue
            key = normalize(raw)
            if key not in result:
                result[key] = (next_id, raw)
                next_id += 1
    return result


def seed(jsonl_path: Path) -> None:
    records = load_records(jsonl_path)
    ingredient_map = collect_ingredients(records)

    with engine.begin() as conn:
        # Clear catalogue tables in FK-safe order (preserve users / favorites).
        conn.execute(text("DELETE FROM drink_ingredients"))
        conn.execute(text("DELETE FROM drinks"))
        conn.execute(text("DELETE FROM ingredients"))

        # Insert ingredients.
        if ingredient_map:
            conn.execute(
                text(
                    "INSERT INTO ingredients (id, name, name_key) "
                    "VALUES (:id, :name, :name_key)"
                ),
                [
                    {"id": ing_id, "name": display_name, "name_key": key}
                    for key, (ing_id, display_name) in ingredient_map.items()
                ],
            )

        drinks_inserted = 0
        links_inserted = 0

        for rec in records:
            drink_id = int(rec["idDrink"])

            conn.execute(
                text(
                    "INSERT INTO drinks "
                    "(id, name, category, alcoholic, glass, instructions, thumb_url) "
                    "VALUES (:id, :name, :category, :alcoholic, :glass, :instructions, :thumb_url)"
                ),
                {
                    "id": drink_id,
                    "name": rec.get("strDrink") or "",
                    "category": rec.get("strCategory"),
                    "alcoholic": rec.get("strAlcoholic"),
                    "glass": rec.get("strGlass"),
                    "instructions": rec.get("strInstructions"),
                    "thumb_url": rec.get("strDrinkThumb"),
                },
            )
            drinks_inserted += 1

            for position, ing in enumerate(rec.get("ingredients") or []):
                raw = (ing.get("ingredient") or "").strip()
                if not raw:
                    continue
                key = normalize(raw)
                ing_id, _ = ingredient_map[key]
                raw_measure = (ing.get("measure") or "").strip()
                measure = raw_measure if raw_measure else None

                conn.execute(
                    text(
                        "INSERT INTO drink_ingredients "
                        "(drink_id, ingredient_id, measure, position) "
                        "VALUES (:drink_id, :ingredient_id, :measure, :position)"
                    ),
                    {
                        "drink_id": drink_id,
                        "ingredient_id": ing_id,
                        "measure": measure,
                        "position": position,
                    },
                )
                links_inserted += 1

    print(f"Drinks loaded    : {drinks_inserted}")
    print(f"Ingredients      : {len(ingredient_map)}")
    print(f"Ingredient links : {links_inserted}")


if __name__ == "__main__":
    jsonl_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_JSONL
    if not jsonl_path.exists():
        print(f"Error: JSONL file not found: {jsonl_path}", file=sys.stderr)
        sys.exit(1)
    seed(jsonl_path)
