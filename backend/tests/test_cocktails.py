"""
Cocktail endpoint tests.

All tests use the deterministic 2-drink fixture seeded in conftest.py:
  - 1001  Test Margarita      ingredients: tequila, lime juice
  - 1002  Test Vodka Soda     ingredients: vodka
"""


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

def test_health_returns_ok(client):
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["database"] == "ok"


# ---------------------------------------------------------------------------
# GET /cocktails
# ---------------------------------------------------------------------------

def test_get_cocktails_returns_list(client):
    r = client.get("/cocktails")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data["items"], list)
    assert len(data["items"]) == 2


def test_get_cocktails_response_shape(client):
    r = client.get("/cocktails")
    drink = r.json()["items"][0]
    for field in ("id", "name", "category", "alcoholic", "glass"):
        assert field in drink, f"missing field: {field}"


def test_get_cocktails_contains_seeded_names(client):
    names = {d["name"] for d in client.get("/cocktails").json()["items"]}
    assert "Test Margarita" in names
    assert "Test Vodka Soda" in names


# ---------------------------------------------------------------------------
# GET /cocktails — pagination
# ---------------------------------------------------------------------------

def test_get_cocktails_pagination_returns_metadata(client):
    r = client.get("/cocktails")
    assert r.status_code == 200
    body = r.json()
    for field in ("items", "page", "page_size", "total"):
        assert field in body, f"missing pagination field: {field}"
    assert body["page"] == 1
    assert body["page_size"] == 20


def test_get_cocktails_total_matches_seeded_count(client):
    assert client.get("/cocktails").json()["total"] == 2


def test_get_cocktails_custom_page_size(client):
    r = client.get("/cocktails", params={"page_size": 1})
    assert r.status_code == 200
    body = r.json()
    assert len(body["items"]) == 1
    assert body["total"] == 2  # total reflects full count, not page size


def test_get_cocktails_invalid_page_returns_422(client):
    assert client.get("/cocktails", params={"page": 0}).status_code == 422


def test_get_cocktails_invalid_page_size_returns_422(client):
    assert client.get("/cocktails", params={"page_size": 0}).status_code == 422


# ---------------------------------------------------------------------------
# GET /cocktails/{id}
# ---------------------------------------------------------------------------

def test_get_cocktail_by_id_returns_detail(client):
    r = client.get("/cocktails/1001")
    assert r.status_code == 200
    body = r.json()
    assert body["id"] == 1001
    assert body["name"] == "Test Margarita"
    assert "instructions" in body


def test_get_cocktail_by_id_includes_ingredients(client):
    r = client.get("/cocktails/1001")
    assert r.status_code == 200
    ingredients = r.json()["ingredients"]
    assert isinstance(ingredients, list)
    assert len(ingredients) == 2
    names = {i["ingredient"] for i in ingredients}
    assert "Tequila" in names
    assert "Lime Juice" in names


def test_get_cocktail_missing_id_returns_404(client):
    r = client.get("/cocktails/9999")
    assert r.status_code == 404


# ---------------------------------------------------------------------------
# GET /search
# ---------------------------------------------------------------------------

def test_search_by_cocktail_name(client):
    r = client.get("/search", params={"query": "margarita"})
    assert r.status_code == 200
    names = {d["name"] for d in r.json()["items"]}
    assert "Test Margarita" in names


def test_search_by_ingredient_name(client):
    r = client.get("/search", params={"query": "vodka"})
    assert r.status_code == 200
    names = {d["name"] for d in r.json()["items"]}
    assert "Test Vodka Soda" in names


def test_search_returns_shape(client):
    r = client.get("/search", params={"query": "test"})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data["items"], list)
    for drink in data["items"]:
        assert "id" in drink
        assert "name" in drink


def test_search_pagination_returns_metadata(client):
    r = client.get("/search", params={"query": "test"})
    assert r.status_code == 200
    body = r.json()
    for field in ("items", "page", "page_size", "total"):
        assert field in body, f"missing pagination field: {field}"


def test_search_total_is_accurate(client):
    r = client.get("/search", params={"query": "test"})
    assert r.json()["total"] == 2  # both seeded cocktails match "test"


# ---------------------------------------------------------------------------
# GET /available
# ---------------------------------------------------------------------------

def test_available_single_ingredient_match(client):
    r = client.get("/available", params={"has": "tequila"})
    assert r.status_code == 200
    names = {d["name"] for d in r.json()}
    assert "Test Margarita" in names
    assert "Test Vodka Soda" not in names


def test_available_multiple_ingredients_match(client):
    r = client.get("/available", params={"has": "tequila,lime juice"})
    assert r.status_code == 200
    names = {d["name"] for d in r.json()}
    assert "Test Margarita" in names


def test_available_no_matches_returns_empty(client):
    r = client.get("/available", params={"has": "whiskey"})
    assert r.status_code == 200
    assert r.json() == []


# ---------------------------------------------------------------------------
# GET /random
# ---------------------------------------------------------------------------

def test_random_returns_200(client):
    r = client.get("/random")
    assert r.status_code == 200


def test_random_response_has_id_and_name(client):
    r = client.get("/random")
    body = r.json()
    assert "id" in body
    assert "name" in body
    assert body["name"] in ("Test Margarita", "Test Vodka Soda")
