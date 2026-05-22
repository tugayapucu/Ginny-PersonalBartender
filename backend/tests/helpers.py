"""Shared auth helper functions for backend tests."""

DEFAULT_PASSWORD = "Secure1!Pass"


def register_user(client, username, email, password=DEFAULT_PASSWORD):
    r = client.post("/auth/register", json={"username": username, "email": email, "password": password})
    assert r.status_code == 200, r.text
    return r


def get_token(client, email, password=DEFAULT_PASSWORD):
    r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}
