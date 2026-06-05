"""
Logging middleware smoke tests.

Verify that the request-logging middleware does not interfere with
normal request/response behaviour. Log output itself is not asserted
to keep tests resilient against format changes.
"""


def test_middleware_does_not_break_health_endpoint(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_middleware_does_not_break_cocktail_list(client):
    r = client.get("/cocktails")
    assert r.status_code == 200
    assert "items" in r.json()


def test_middleware_passes_through_404(client):
    r = client.get("/cocktails/9999")
    assert r.status_code == 404
