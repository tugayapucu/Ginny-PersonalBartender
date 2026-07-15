"""
Tests for GET /api/v1/recommendations.

Seed data from conftest (session-scoped):
  - Drink 1001 "Test Margarita"  category="Ordinary Drink" glass="Cocktail glass"
                                  ingredients: tequila (key="tequila"), lime juice (key="lime juice")
  - Drink 1002 "Test Vodka Soda" category="Ordinary Drink" glass="Highball glass"
                                  ingredient: vodka (key="vodka")

Scoring weights:
  pantry coverage  up to 1.0
  category match   +0.20
  glass match      +0.10
  rating boost     +0.15
"""
import pytest

ENDPOINT = "/api/v1/recommendations"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _register_and_login(client, suffix):
    email = f"rec_user_{suffix}@test.com"
    client.post("/auth/register", json={
        "username": f"rec_user_{suffix}",
        "email": email,
        "password": "TestPass1!",
    })
    res = client.post("/auth/login", json={"email": email, "password": "TestPass1!"})
    return res.json()["access_token"]


def _auth(token):
    return {"headers": {"Authorization": f"Bearer {token}"}}


def _add_pantry(client, token, *ingredient_names):
    for name in ingredient_names:
        client.post("/api/v1/pantry/", json={"ingredient_name": name}, **_auth(token))


def _add_favorite(client, token, cocktail_id):
    client.post("/favorites/", json={"cocktail_id": str(cocktail_id)}, **_auth(token))


def _add_note(client, token, cocktail_id, rating):
    client.put(f"/api/v1/cocktails/{cocktail_id}/my-note", json={"rating": rating}, **_auth(token))


# ---------------------------------------------------------------------------
# Auth guard
# ---------------------------------------------------------------------------

def test_recommendations_unauthenticated_returns_401(client):
    res = client.get(ENDPOINT)
    assert res.status_code == 401


# ---------------------------------------------------------------------------
# Empty user history — fallback behaviour
# ---------------------------------------------------------------------------

def test_recommendations_empty_state_returns_all_cocktails(client):
    """With no pantry/favorites/ratings all cocktails are returned with score 0."""
    token = _register_and_login(client, "empty")
    res = client.get(ENDPOINT, **_auth(token))
    assert res.status_code == 200
    data = res.json()
    # Both seeded cocktails should appear (score 0, no reasons)
    assert len(data) >= 2
    ids = [item["id"] for item in data]
    assert 1001 in ids
    assert 1002 in ids
    # Every item must have required fields
    for item in data:
        assert "score" in item
        assert "reasons" in item
        assert isinstance(item["reasons"], list)


# ---------------------------------------------------------------------------
# Pantry coverage affects ranking
# ---------------------------------------------------------------------------

def test_recommendations_pantry_affects_ranking(client):
    """Margarita (2 ingredients, both in pantry) should score higher than Vodka Soda (0 matches)."""
    token = _register_and_login(client, "pantry")
    _add_pantry(client, token, "Tequila", "Lime Juice")

    res = client.get(ENDPOINT, **_auth(token))
    assert res.status_code == 200
    items = res.json()
    ids = [item["id"] for item in items]
    assert ids.index(1001) < ids.index(1002), (
        "Margarita should rank above Vodka Soda when user has its ingredients"
    )


def test_recommendations_pantry_reasons_included(client):
    """Pantry-matched cocktail should carry a pantry reason string."""
    token = _register_and_login(client, "pantry_reason")
    _add_pantry(client, token, "Tequila", "Lime Juice")

    res = client.get(ENDPOINT, **_auth(token))
    margarita = next(item for item in res.json() if item["id"] == 1001)
    assert any("pantry" in r.lower() for r in margarita["reasons"])


# ---------------------------------------------------------------------------
# Favorited cocktails excluded
# ---------------------------------------------------------------------------

def test_recommendations_favorited_cocktails_excluded(client):
    """Favorited Margarita must not appear in recommendations."""
    token = _register_and_login(client, "fav_excl")
    _add_favorite(client, token, 1001)

    res = client.get(ENDPOINT, **_auth(token))
    assert res.status_code == 200
    ids = [item["id"] for item in res.json()]
    assert 1001 not in ids
    assert 1002 in ids


def test_recommendations_fav_category_boosts_similar(client):
    """
    Favoriting Margarita (category=Ordinary Drink) should add a category boost to
    Vodka Soda — Margarita is excluded, Vodka Soda remains and inherits the boost.
    """
    token = _register_and_login(client, "fav_boost")
    _add_favorite(client, token, 1001)

    res = client.get(ENDPOINT, **_auth(token))
    vodka_soda = next(item for item in res.json() if item["id"] == 1002)
    assert any("category" in r.lower() or "similar" in r.lower() for r in vodka_soda["reasons"])


# ---------------------------------------------------------------------------
# High ratings affect ranking
# ---------------------------------------------------------------------------

def test_recommendations_high_rating_category_boost(client):
    """Rating Margarita 5 stars puts 'Ordinary Drink' in high_rated_categories.
    Vodka Soda (same category) should receive the category boost in its reasons."""
    token = _register_and_login(client, "rating_boost")
    _add_note(client, token, 1001, rating=5)

    res = client.get(ENDPOINT, **_auth(token))
    vodka_soda = next(item for item in res.json() if item["id"] == 1002)
    assert any("enjoy" in r.lower() or "categor" in r.lower() for r in vodka_soda["reasons"])


# ---------------------------------------------------------------------------
# limit param
# ---------------------------------------------------------------------------

def test_recommendations_limit_param(client):
    token = _register_and_login(client, "limit")
    res = client.get(ENDPOINT, params={"limit": 1}, **_auth(token))
    assert res.status_code == 200
    assert len(res.json()) == 1


def test_recommendations_limit_exceeds_available(client):
    """Requesting more than available cocktails returns all that exist."""
    token = _register_and_login(client, "limit_max")
    res = client.get(ENDPOINT, params={"limit": 50}, **_auth(token))
    assert res.status_code == 200
    # Both seeded cocktails fit within limit=50
    assert len(res.json()) >= 2


def test_recommendations_invalid_limit_returns_422(client):
    token = _register_and_login(client, "bad_limit")
    res = client.get(ENDPOINT, params={"limit": 0}, **_auth(token))
    assert res.status_code == 422
