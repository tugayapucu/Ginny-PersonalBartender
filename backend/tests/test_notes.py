"""
Tests for GET/PUT/DELETE /cocktails/{id}/my-note endpoints.

All tests use the shared in-memory SQLite DB from conftest.py.
Cocktail IDs 1001 and 1002 are seeded by the session fixture.
"""
import pytest


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _register_and_login(client, suffix="a"):
    email = f"note_user_{suffix}@test.com"
    client.post("/auth/register", json={
        "username": f"note_user_{suffix}",
        "email": email,
        "password": "TestPass1!",
    })
    res = client.post("/auth/login", json={"email": email, "password": "TestPass1!"})
    return res.json()["access_token"]


def _auth(token):
    return {"headers": {"Authorization": f"Bearer {token}"}}


# ---------------------------------------------------------------------------
# Auth guard tests
# ---------------------------------------------------------------------------

def test_get_note_unauthenticated(client):
    res = client.get("/cocktails/1001/my-note")
    assert res.status_code == 401


def test_put_note_unauthenticated(client):
    res = client.put("/cocktails/1001/my-note", json={"rating": 3})
    assert res.status_code == 401


# ---------------------------------------------------------------------------
# 404 before note exists
# ---------------------------------------------------------------------------

def test_get_note_not_found(client):
    token = _register_and_login(client, "notfound")
    res = client.get("/cocktails/1001/my-note", **_auth(token))
    assert res.status_code == 404


# ---------------------------------------------------------------------------
# Create (PUT) and read back (GET)
# ---------------------------------------------------------------------------

def test_put_creates_note(client):
    token = _register_and_login(client, "create")
    res = client.put("/cocktails/1001/my-note", json={"rating": 4, "notes": "Great drink"}, **_auth(token))
    assert res.status_code == 200
    data = res.json()
    assert data["rating"] == 4
    assert data["notes"] == "Great drink"
    assert data["drink_id"] == 1001
    assert "created_at" in data
    assert "updated_at" in data


def test_get_returns_created_note(client):
    token = _register_and_login(client, "getback")
    client.put("/cocktails/1001/my-note", json={"rating": 5, "notes": "Perfect"}, **_auth(token))
    res = client.get("/cocktails/1001/my-note", **_auth(token))
    assert res.status_code == 200
    data = res.json()
    assert data["rating"] == 5
    assert data["notes"] == "Perfect"


# ---------------------------------------------------------------------------
# Upsert (PUT twice → second call updates)
# ---------------------------------------------------------------------------

def test_put_updates_existing_note(client):
    token = _register_and_login(client, "upsert")
    client.put("/cocktails/1001/my-note", json={"rating": 2, "notes": "Meh"}, **_auth(token))
    res = client.put("/cocktails/1001/my-note", json={"rating": 5, "notes": "Changed mind"}, **_auth(token))
    assert res.status_code == 200
    data = res.json()
    assert data["rating"] == 5
    assert data["notes"] == "Changed mind"


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

def test_put_invalid_rating_too_low_returns_422(client):
    token = _register_and_login(client, "low")
    res = client.put("/cocktails/1001/my-note", json={"rating": 0}, **_auth(token))
    assert res.status_code == 422


def test_put_invalid_rating_too_high_returns_422(client):
    token = _register_and_login(client, "high")
    res = client.put("/cocktails/1001/my-note", json={"rating": 6}, **_auth(token))
    assert res.status_code == 422


# ---------------------------------------------------------------------------
# Delete
# ---------------------------------------------------------------------------

def test_delete_note(client):
    token = _register_and_login(client, "del")
    client.put("/cocktails/1001/my-note", json={"rating": 3}, **_auth(token))
    res = client.delete("/cocktails/1001/my-note", **_auth(token))
    assert res.status_code == 200
    # Now GET should 404
    res2 = client.get("/cocktails/1001/my-note", **_auth(token))
    assert res2.status_code == 404


def test_delete_nonexistent_note_returns_404(client):
    token = _register_and_login(client, "delmiss")
    res = client.delete("/cocktails/1001/my-note", **_auth(token))
    assert res.status_code == 404


# ---------------------------------------------------------------------------
# User isolation
# ---------------------------------------------------------------------------

def test_user_isolation(client):
    token_a = _register_and_login(client, "iso_a")
    token_b = _register_and_login(client, "iso_b")
    client.put("/cocktails/1001/my-note", json={"rating": 5, "notes": "User A's note"}, **_auth(token_a))
    # User B has no note yet
    res = client.get("/cocktails/1001/my-note", **_auth(token_b))
    assert res.status_code == 404


# ---------------------------------------------------------------------------
# Optional fields
# ---------------------------------------------------------------------------

def test_note_notes_only_no_rating(client):
    token = _register_and_login(client, "norating")
    res = client.put("/cocktails/1001/my-note", json={"notes": "Nice colour"}, **_auth(token))
    assert res.status_code == 200
    assert res.json()["rating"] is None
    assert res.json()["notes"] == "Nice colour"


def test_note_rating_only_no_notes(client):
    token = _register_and_login(client, "nonotes")
    res = client.put("/cocktails/1001/my-note", json={"rating": 3}, **_auth(token))
    assert res.status_code == 200
    assert res.json()["rating"] == 3
    assert res.json()["notes"] is None
