"""
Infrastructure smoke tests.

Verify that:
- the TestClient reaches the application
- get_db is correctly overridden (queries hit the test DB, not the real one)
- the seeded cocktail fixture data is queryable
"""


def test_api_is_reachable(client):
    r = client.get("/cocktails")
    assert r.status_code == 200


def test_seeded_cocktails_are_queryable(client):
    r = client.get("/cocktails")
    assert r.status_code == 200
    items = r.json()["items"]
    assert isinstance(items, list)
    names = {d["name"] for d in items}
    assert "Test Margarita" in names
    assert "Test Vodka Soda" in names


def test_test_db_is_isolated_from_production(client):
    """The test DB has exactly the 2 seeded drinks, not 636 from production."""
    r = client.get("/cocktails")
    assert r.status_code == 200
    assert r.json()["total"] == 2
