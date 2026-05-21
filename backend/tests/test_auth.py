"""
Auth flow tests.

Covers registration (success + 3 failure modes) and login (success + 3 failure modes).
All tests use the in-memory test DB via the client fixture in conftest.py.
"""

import models

VALID_USER = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "Secure1!Pass",
}


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------

def test_register_success(client):
    r = client.post("/auth/register", json=VALID_USER)
    assert r.status_code == 200
    assert "message" in r.json()


def test_register_duplicate_email_returns_400(client):
    client.post("/auth/register", json=VALID_USER)
    duplicate = {**VALID_USER, "username": "otheruser"}
    r = client.post("/auth/register", json=duplicate)
    assert r.status_code == 400
    assert "email" in r.json()["detail"].lower()


def test_register_duplicate_username_returns_400(client):
    client.post("/auth/register", json=VALID_USER)
    duplicate = {**VALID_USER, "email": "other@example.com"}
    r = client.post("/auth/register", json=duplicate)
    assert r.status_code == 400


def test_register_weak_password_returns_400(client):
    weak = {**VALID_USER, "password": "password"}
    r = client.post("/auth/register", json=weak)
    assert r.status_code == 400


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

def test_login_success_returns_token(client):
    client.post("/auth/register", json=VALID_USER)
    r = client.post("/auth/login", json={"email": VALID_USER["email"], "password": VALID_USER["password"]})
    assert r.status_code == 200
    body = r.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_wrong_password_returns_401(client):
    client.post("/auth/register", json=VALID_USER)
    r = client.post("/auth/login", json={"email": VALID_USER["email"], "password": "WrongPass1!"})
    assert r.status_code == 401


def test_login_nonexistent_email_returns_401(client):
    r = client.post("/auth/login", json={"email": "nobody@example.com", "password": "AnyPass1!"})
    assert r.status_code == 401


def test_login_disabled_user_returns_403(client, db):
    client.post("/auth/register", json=VALID_USER)
    user = db.query(models.User).filter(models.User.email == VALID_USER["email"]).first()
    user.is_active = False
    db.commit()

    r = client.post("/auth/login", json={"email": VALID_USER["email"], "password": VALID_USER["password"]})
    assert r.status_code == 403
