"""
/api/v1 routing tests.

Confirms that every router is correctly registered under the /api/v1 prefix.
Business-logic correctness (pagination, filters, auth rules, etc.) is tested
by the existing per-domain test files. These tests only verify that the versioned
paths return the expected status codes and response shapes.
"""
from helpers import register_user, get_token, auth_headers

V1 = "/api/v1"


# ---------------------------------------------------------------------------
# Health (remains unversioned — confirm it still works)
# ---------------------------------------------------------------------------

def test_health_is_unversioned(client):
    assert client.get("/health").status_code == 200


# ---------------------------------------------------------------------------
# GET /api/v1/cocktails — paginated list with filters
# ---------------------------------------------------------------------------

def test_v1_cocktails_returns_paginated_response(client):
    r = client.get(f"{V1}/cocktails")
    assert r.status_code == 200
    body = r.json()
    for field in ("items", "page", "page_size", "total"):
        assert field in body, f"missing field: {field}"


def test_v1_cocktails_filter_by_ingredient(client):
    r = client.get(f"{V1}/cocktails", params={"ingredient": "tequila"})
    assert r.status_code == 200
    names = {d["name"] for d in r.json()["items"]}
    assert "Test Margarita" in names
    assert "Test Vodka Soda" not in names


def test_v1_cocktail_detail(client):
    r = client.get(f"{V1}/cocktails/1001")
    assert r.status_code == 200
    body = r.json()
    assert body["id"] == 1001
    assert "ingredients" in body


def test_v1_cocktail_detail_not_found(client):
    assert client.get(f"{V1}/cocktails/9999").status_code == 404


# ---------------------------------------------------------------------------
# GET /api/v1/search
# ---------------------------------------------------------------------------

def test_v1_search_returns_paginated_response(client):
    r = client.get(f"{V1}/search", params={"query": "margarita"})
    assert r.status_code == 200
    body = r.json()
    assert "items" in body
    assert "Test Margarita" in {d["name"] for d in body["items"]}


# ---------------------------------------------------------------------------
# GET /api/v1/available
# ---------------------------------------------------------------------------

def test_v1_available_returns_list(client):
    r = client.get(f"{V1}/available", params={"has": "tequila"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)
    assert any(d["name"] == "Test Margarita" for d in r.json())


# ---------------------------------------------------------------------------
# GET /api/v1/random
# ---------------------------------------------------------------------------

def test_v1_random_returns_cocktail(client):
    r = client.get(f"{V1}/random")
    assert r.status_code == 200
    body = r.json()
    assert "id" in body and "name" in body


# ---------------------------------------------------------------------------
# POST /api/v1/auth/register  +  POST /api/v1/auth/login
# ---------------------------------------------------------------------------

def test_v1_register(client):
    r = client.post(
        f"{V1}/auth/register",
        json={"username": "v1reg", "email": "v1reg@example.com", "password": "Secure1!Pass"},
    )
    assert r.status_code == 200
    assert r.json()["message"] == "User registered successfully"


def test_v1_login_returns_token(client):
    register_user(client, "v1login", "v1login@example.com")
    r = client.post(
        f"{V1}/auth/login",
        json={"email": "v1login@example.com", "password": "Secure1!Pass"},
    )
    assert r.status_code == 200
    assert "access_token" in r.json()
    assert r.json()["token_type"] == "bearer"


# ---------------------------------------------------------------------------
# /api/v1/favorites/ — auth-gated CRUD
# ---------------------------------------------------------------------------

def test_v1_favorites_unauthenticated_returns_401(client):
    assert client.get(f"{V1}/favorites/").status_code == 401


def test_v1_favorites_add_list_remove(client):
    register_user(client, "v1fav", "v1fav@example.com")
    token = get_token(client, "v1fav@example.com")
    hdrs = auth_headers(token)

    # Add
    r = client.post(f"{V1}/favorites/", json={"cocktail_id": "1001"}, headers=hdrs)
    assert r.status_code == 200

    # List IDs
    r = client.get(f"{V1}/favorites/", headers=hdrs)
    assert r.status_code == 200
    assert "1001" in r.json()

    # List cocktail objects
    r = client.get(f"{V1}/favorites/cocktails", headers=hdrs)
    assert r.status_code == 200
    assert any(d["id"] == 1001 for d in r.json())

    # Remove
    r = client.delete(f"{V1}/favorites/1001", headers=hdrs)
    assert r.status_code == 200

    # Verify empty
    r = client.get(f"{V1}/favorites/", headers=hdrs)
    assert r.json() == []


# ---------------------------------------------------------------------------
# /api/v1/users/ — auth-gated profile endpoints
# ---------------------------------------------------------------------------

def test_v1_users_me_unauthenticated_returns_401(client):
    assert client.get(f"{V1}/users/me").status_code == 401


def test_v1_users_me_returns_profile(client):
    register_user(client, "v1meuser", "v1me@example.com")
    token = get_token(client, "v1me@example.com")

    r = client.get(f"{V1}/users/me", headers=auth_headers(token))
    assert r.status_code == 200
    body = r.json()
    assert body["username"] == "v1meuser"
    assert body["email"] == "v1me@example.com"


def test_v1_users_me_patch_username(client):
    register_user(client, "v1patch", "v1patch@example.com")
    token = get_token(client, "v1patch@example.com")
    hdrs = auth_headers(token)

    r = client.patch(f"{V1}/users/me", json={"username": "v1patched"}, headers=hdrs)
    assert r.status_code == 200
    assert r.json()["username"] == "v1patched"


def test_v1_users_preferences(client):
    register_user(client, "v1pref", "v1pref@example.com")
    token = get_token(client, "v1pref@example.com")

    r = client.patch(
        f"{V1}/users/me/preferences",
        json={"theme": "dark"},
        headers=auth_headers(token),
    )
    assert r.status_code == 200
    assert r.json()["theme"] == "dark"
