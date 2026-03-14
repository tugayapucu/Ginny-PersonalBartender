import os


def _split_csv(value: str | None, default: list[str]) -> list[str]:
    if not value:
        return default
    return [item.strip() for item in value.split(",") if item.strip()]


SECRET_KEY = os.getenv("GINNY_SECRET_KEY", "development-only-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
CORS_ALLOWED_ORIGINS = _split_csv(
    os.getenv("CORS_ALLOWED_ORIGINS"),
    ["http://localhost:5173", "http://127.0.0.1:5173"],
)
