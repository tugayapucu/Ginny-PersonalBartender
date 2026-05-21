"""
Shared pytest fixtures for backend tests.

Database strategy
-----------------
All tests use an in-memory SQLite database that is completely separate
from backend/ginny_database.db.  StaticPool ensures every SQLAlchemy
session and every engine.connect() call within a process reuses the
same underlying connection, so tables created and rows inserted are
visible across all sessions for the lifetime of the test run.

Data lifecycle
--------------
- Cocktail catalogue (drinks, ingredients, drink_ingredients) is seeded
  once at session scope and never rolled back — it is read-only reference
  data identical in shape to production.
- User data (users, favorites) is deleted after every test so each test
  starts with a clean user slate.
"""

import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Make backend/ importable regardless of where pytest is invoked from.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from database import Base, get_db          # noqa: E402
from main import app                        # noqa: E402
from models import Drink, Ingredient, DrinkIngredient  # noqa: E402


# ---------------------------------------------------------------------------
# Test engine — single in-memory SQLite connection shared by all sessions
# ---------------------------------------------------------------------------
TEST_ENGINE = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=TEST_ENGINE
)


# ---------------------------------------------------------------------------
# Minimal cocktail fixture data
# Two drinks with three distinct ingredients cover all cocktail endpoints:
#   /cocktails, /cocktails/{id}, /search (name + ingredient), /available, /random
# ---------------------------------------------------------------------------
def _seed_cocktails(session) -> None:
    session.add_all([
        Ingredient(id=1, name="Tequila",    name_key="tequila"),
        Ingredient(id=2, name="Lime Juice", name_key="lime juice"),
        Ingredient(id=3, name="Vodka",      name_key="vodka"),
    ])
    session.add_all([
        Drink(
            id=1001,
            name="Test Margarita",
            category="Ordinary Drink",
            alcoholic="Alcoholic",
            glass="Cocktail glass",
            instructions="Shake and strain into a cocktail glass.",
            thumb_url=None,
        ),
        Drink(
            id=1002,
            name="Test Vodka Soda",
            category="Ordinary Drink",
            alcoholic="Alcoholic",
            glass="Highball glass",
            instructions="Pour over ice and top with soda.",
            thumb_url=None,
        ),
    ])
    session.flush()
    session.add_all([
        DrinkIngredient(drink_id=1001, ingredient_id=1, measure="2 oz",  position=0),
        DrinkIngredient(drink_id=1001, ingredient_id=2, measure="1 oz",  position=1),
        DrinkIngredient(drink_id=1002, ingredient_id=3, measure="1.5 oz", position=0),
    ])
    session.commit()


# ---------------------------------------------------------------------------
# Session-scoped setup: create schema + seed cocktails once per test run
# ---------------------------------------------------------------------------
@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=TEST_ENGINE)
    session = TestingSessionLocal()
    try:
        _seed_cocktails(session)
    finally:
        session.close()
    yield
    Base.metadata.drop_all(bind=TEST_ENGINE)


# ---------------------------------------------------------------------------
# Function-scoped db session: clean user data after every test
# ---------------------------------------------------------------------------
@pytest.fixture()
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()  # clear any failed transaction before cleanup
        session.execute(text("DELETE FROM favorites"))
        session.execute(text("DELETE FROM users"))
        session.commit()
        session.close()


# ---------------------------------------------------------------------------
# TestClient with get_db overridden to use the test session
# ---------------------------------------------------------------------------
@pytest.fixture()
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass  # lifecycle owned by the db fixture

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
