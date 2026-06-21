"""
User pantry tests.

Covers: protected access, add, duplicate, list, delete, cross-user isolation,
catalogue linking, and custom (non-catalogue) ingredients.
"""
from helpers import register_user, get_token, auth_headers


def test_get_pantry_unauthenticated(client):
    assert client.get("/pantry/").status_code == 401


def test_post_pantry_unauthenticated(client):
    assert client.post("/pantry/", json={"ingredient_name": "Tequila"}).status_code == 401


def test_add_pantry_item(client):
    register_user(client, "pant1", "pant1@example.com")
    token = get_token(client, "pant1@example.com")
    r = client.post("/pantry/", json={"ingredient_name": "Tequila"}, headers=auth_headers(token))
    assert r.status_code == 200
    body = r.json()
    assert body["ingredient_key"] == "tequila"
    assert body["ingredient_name"] == "Tequila"
    assert body["ingredient_id"] == 1  # linked to seeded catalogue ingredient


def test_add_pantry_item_normalizes_name(client):
    register_user(client, "pant_norm", "pantnorm@example.com")
    token = get_token(client, "pantnorm@example.com")
    r = client.post("/pantry/", json={"ingredient_name": "  LIME JUICE  "}, headers=auth_headers(token))
    assert r.status_code == 200
    body = r.json()
    assert body["ingredient_key"] == "lime juice"
    assert body["ingredient_id"] == 2  # linked to seeded "Lime Juice" ingredient


def test_add_duplicate_pantry_item_returns_400(client):
    register_user(client, "pant2", "pant2@example.com")
    token = get_token(client, "pant2@example.com")
    hdrs = auth_headers(token)
    client.post("/pantry/", json={"ingredient_name": "Vodka"}, headers=hdrs)
    r = client.post("/pantry/", json={"ingredient_name": "Vodka"}, headers=hdrs)
    assert r.status_code == 400


def test_add_duplicate_case_insensitive_returns_400(client):
    register_user(client, "pant_dup", "pantdup@example.com")
    token = get_token(client, "pantdup@example.com")
    hdrs = auth_headers(token)
    client.post("/pantry/", json={"ingredient_name": "Tequila"}, headers=hdrs)
    r = client.post("/pantry/", json={"ingredient_name": "TEQUILA"}, headers=hdrs)
    assert r.status_code == 400


def test_list_pantry_items(client):
    register_user(client, "pant3", "pant3@example.com")
    token = get_token(client, "pant3@example.com")
    hdrs = auth_headers(token)
    client.post("/pantry/", json={"ingredient_name": "Tequila"}, headers=hdrs)
    client.post("/pantry/", json={"ingredient_name": "Lime Juice"}, headers=hdrs)
    r = client.get("/pantry/", headers=hdrs)
    assert r.status_code == 200
    keys = {item["ingredient_key"] for item in r.json()}
    assert "tequila" in keys
    assert "lime juice" in keys


def test_list_empty_pantry(client):
    register_user(client, "pant_empty", "pantempty@example.com")
    token = get_token(client, "pantempty@example.com")
    r = client.get("/pantry/", headers=auth_headers(token))
    assert r.status_code == 200
    assert r.json() == []


def test_delete_pantry_item(client):
    register_user(client, "pant4", "pant4@example.com")
    token = get_token(client, "pant4@example.com")
    hdrs = auth_headers(token)
    client.post("/pantry/", json={"ingredient_name": "Vodka"}, headers=hdrs)
    r = client.delete("/pantry/vodka", headers=hdrs)
    assert r.status_code == 200
    items = client.get("/pantry/", headers=hdrs).json()
    assert not any(i["ingredient_key"] == "vodka" for i in items)


def test_delete_nonexistent_pantry_item_returns_404(client):
    register_user(client, "pant5", "pant5@example.com")
    token = get_token(client, "pant5@example.com")
    r = client.delete("/pantry/nonexistent-ingredient", headers=auth_headers(token))
    assert r.status_code == 404


def test_pantry_cross_user_isolation(client):
    register_user(client, "pant_a", "panta@example.com")
    register_user(client, "pant_b", "pantb@example.com")
    token_a = get_token(client, "panta@example.com")
    token_b = get_token(client, "pantb@example.com")
    client.post("/pantry/", json={"ingredient_name": "Tequila"}, headers=auth_headers(token_a))
    r = client.get("/pantry/", headers=auth_headers(token_b))
    assert r.status_code == 200
    assert r.json() == []


def test_add_custom_ingredient_not_in_catalogue(client):
    register_user(client, "pant_custom", "pantcustom@example.com")
    token = get_token(client, "pantcustom@example.com")
    r = client.post(
        "/pantry/",
        json={"ingredient_name": "Elderflower Cordial"},
        headers=auth_headers(token),
    )
    assert r.status_code == 200
    body = r.json()
    assert body["ingredient_key"] == "elderflower cordial"
    assert body["ingredient_id"] is None  # not in test catalogue
