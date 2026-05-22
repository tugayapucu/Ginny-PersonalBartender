"""
User profile and account management endpoint tests.

Covers GET /users/me, PATCH /users/me, PATCH /users/me/preferences,
POST /users/me/password, POST /users/me/disable, DELETE /users/me.
"""

from helpers import register_user, get_token, auth_headers

USER = {"username": "profile_user", "email": "profile@example.com"}
USER_B = {"username": "other_user", "email": "other@example.com"}
PASSWORD = "Secure1!Pass"


# ---------------------------------------------------------------------------
# GET /users/me
# ---------------------------------------------------------------------------

def test_get_me_without_token_returns_401(client):
    r = client.get("/users/me")
    assert r.status_code == 401


def test_get_me_returns_profile_fields(client):
    register_user(client, **USER)
    token = get_token(client, USER["email"])
    r = client.get("/users/me", headers=auth_headers(token))
    assert r.status_code == 200
    body = r.json()
    assert body["username"] == USER["username"]
    assert body["email"] == USER["email"]
    assert "id" in body
    assert body["is_active"] is True


# ---------------------------------------------------------------------------
# PATCH /users/me
# ---------------------------------------------------------------------------

def test_patch_me_updates_username(client):
    register_user(client, **USER)
    token = get_token(client, USER["email"])
    r = client.patch("/users/me", json={"username": "renamed_user"}, headers=auth_headers(token))
    assert r.status_code == 200
    assert r.json()["username"] == "renamed_user"


def test_patch_me_duplicate_username_returns_400(client):
    register_user(client, **USER)
    register_user(client, **USER_B)
    token = get_token(client, USER["email"])
    r = client.patch("/users/me", json={"username": USER_B["username"]}, headers=auth_headers(token))
    assert r.status_code == 400


# ---------------------------------------------------------------------------
# PATCH /users/me/preferences
# ---------------------------------------------------------------------------

def test_patch_preferences_valid_theme(client):
    register_user(client, **USER)
    token = get_token(client, USER["email"])
    r = client.patch("/users/me/preferences", json={"theme": "dark"}, headers=auth_headers(token))
    assert r.status_code == 200
    assert r.json()["theme"] == "dark"


def test_patch_preferences_invalid_theme_returns_422(client):
    register_user(client, **USER)
    token = get_token(client, USER["email"])
    r = client.patch("/users/me/preferences", json={"theme": "purple"}, headers=auth_headers(token))
    assert r.status_code == 422


# ---------------------------------------------------------------------------
# POST /users/me/password
# ---------------------------------------------------------------------------

def test_change_password_success(client):
    register_user(client, **USER)
    token = get_token(client, USER["email"])
    r = client.post(
        "/users/me/password",
        json={"current_password": PASSWORD, "new_password": "NewSecure2@Pass"},
        headers=auth_headers(token),
    )
    assert r.status_code == 200
    # New password works for login
    new_token = get_token(client, USER["email"], password="NewSecure2@Pass")
    assert new_token


def test_change_password_wrong_current_returns_400(client):
    register_user(client, **USER)
    token = get_token(client, USER["email"])
    r = client.post(
        "/users/me/password",
        json={"current_password": "WrongPass1!", "new_password": "NewSecure2@Pass"},
        headers=auth_headers(token),
    )
    assert r.status_code == 400


def test_change_password_weak_new_returns_400(client):
    register_user(client, **USER)
    token = get_token(client, USER["email"])
    r = client.post(
        "/users/me/password",
        json={"current_password": PASSWORD, "new_password": "weak"},
        headers=auth_headers(token),
    )
    assert r.status_code == 400


# ---------------------------------------------------------------------------
# POST /users/me/disable
# ---------------------------------------------------------------------------

def test_disable_account_blocks_login(client):
    register_user(client, **USER)
    token = get_token(client, USER["email"])
    r = client.post("/users/me/disable", headers=auth_headers(token))
    assert r.status_code == 200

    r = client.post("/auth/login", json={"email": USER["email"], "password": PASSWORD})
    assert r.status_code == 403


# ---------------------------------------------------------------------------
# DELETE /users/me
# ---------------------------------------------------------------------------

def test_delete_account_blocks_login(client):
    register_user(client, **USER)
    token = get_token(client, USER["email"])
    r = client.delete("/users/me", headers=auth_headers(token))
    assert r.status_code == 200

    r = client.post("/auth/login", json={"email": USER["email"], "password": PASSWORD})
    assert r.status_code == 401
