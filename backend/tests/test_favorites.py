"""
Favorites endpoint tests.

Covers unauthenticated rejection, CRUD operations, duplicate handling,
and cross-user isolation. All tests use seeded drinks 1001/1002.
"""

from helpers import register_user, get_token, auth_headers

COCKTAIL_ID = "1001"

USER_A = {"username": "fav_user_a", "email": "fav_a@example.com"}
USER_B = {"username": "fav_user_b", "email": "fav_b@example.com"}


# ---------------------------------------------------------------------------
# Unauthenticated access
# ---------------------------------------------------------------------------

def test_get_favorites_unauthenticated(client):
    r = client.get("/favorites/")
    assert r.status_code == 401


def test_post_favorites_unauthenticated(client):
    r = client.post("/favorites/", json={"cocktail_id": COCKTAIL_ID})
    assert r.status_code == 401


# ---------------------------------------------------------------------------
# Authenticated CRUD
# ---------------------------------------------------------------------------

def test_add_favorite(client):
    register_user(client, **USER_A)
    token = get_token(client, USER_A["email"])
    r = client.post("/favorites/", json={"cocktail_id": COCKTAIL_ID}, headers=auth_headers(token))
    assert r.status_code == 200


def test_add_duplicate_favorite_returns_400(client):
    register_user(client, **USER_A)
    token = get_token(client, USER_A["email"])
    headers = auth_headers(token)
    client.post("/favorites/", json={"cocktail_id": COCKTAIL_ID}, headers=headers)
    r = client.post("/favorites/", json={"cocktail_id": COCKTAIL_ID}, headers=headers)
    assert r.status_code == 400


def test_list_favorite_ids(client):
    register_user(client, **USER_A)
    token = get_token(client, USER_A["email"])
    headers = auth_headers(token)
    client.post("/favorites/", json={"cocktail_id": COCKTAIL_ID}, headers=headers)
    r = client.get("/favorites/", headers=headers)
    assert r.status_code == 200
    assert COCKTAIL_ID in r.json()


def test_list_favorite_cocktails(client):
    register_user(client, **USER_A)
    token = get_token(client, USER_A["email"])
    headers = auth_headers(token)
    client.post("/favorites/", json={"cocktail_id": COCKTAIL_ID}, headers=headers)
    r = client.get("/favorites/cocktails", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["id"] == 1001
    assert "name" in data[0]


def test_remove_favorite(client):
    register_user(client, **USER_A)
    token = get_token(client, USER_A["email"])
    headers = auth_headers(token)
    client.post("/favorites/", json={"cocktail_id": COCKTAIL_ID}, headers=headers)
    r = client.delete(f"/favorites/{COCKTAIL_ID}", headers=headers)
    assert r.status_code == 200
    ids = client.get("/favorites/", headers=headers).json()
    assert COCKTAIL_ID not in ids


def test_remove_nonexistent_favorite_returns_404(client):
    register_user(client, **USER_A)
    token = get_token(client, USER_A["email"])
    r = client.delete(f"/favorites/{COCKTAIL_ID}", headers=auth_headers(token))
    assert r.status_code == 404


# ---------------------------------------------------------------------------
# Cross-user isolation
# ---------------------------------------------------------------------------

def test_user_cannot_see_other_users_favorites(client):
    register_user(client, **USER_A)
    register_user(client, **USER_B)
    token_a = get_token(client, USER_A["email"])
    token_b = get_token(client, USER_B["email"])

    client.post("/favorites/", json={"cocktail_id": COCKTAIL_ID}, headers=auth_headers(token_a))

    r = client.get("/favorites/", headers=auth_headers(token_b))
    assert r.status_code == 200
    assert COCKTAIL_ID not in r.json()
