import time
import logging
from fastapi import FastAPI, HTTPException, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from routers import cocktails
from routers import users
from routers import favorites
from routers import pantry
from auth.routes import router as auth_router
from settings import CORS_ALLOWED_ORIGINS
from database import engine
from logging_config import setup_logging

setup_logging()

request_logger = logging.getLogger("ginny.request")
health_logger = logging.getLogger("ginny.health")

app = FastAPI(title="Ginny Personal Bartender API")

# CORSMiddleware is registered first (inner layer).
# The request-logging middleware below is registered after (outer layer),
# so it wraps every request and sees the final response status.
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log method, path, status code, and duration for every request.

    Never logs Authorization headers, request bodies, or tokens.
    Uses WARNING level for 4xx/5xx so errors surface above INFO noise.
    """
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start) * 1000)

    level = logging.WARNING if response.status_code >= 400 else logging.INFO
    request_logger.log(
        level,
        f"method={request.method} path={request.url.path} "
        f"status={response.status_code} duration_ms={duration_ms}",
    )
    return response


@app.get("/health", tags=["health"])
def health_check():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as exc:
        health_logger.error(f"Database health check failed: {exc}")
        raise HTTPException(
            status_code=503,
            detail={
                "status": "error",
                "service": "Ginny Personal Bartender API",
                "database": "unavailable",
            },
        )
    return {
        "status": "ok",
        "service": "Ginny Personal Bartender API",
        "database": "ok",
    }


# Versioned API routes — canonical paths for all new work
v1 = APIRouter(prefix="/api/v1")
v1.include_router(cocktails.router)
v1.include_router(auth_router)
v1.include_router(favorites.router)
v1.include_router(users.router)
v1.include_router(pantry.router)
app.include_router(v1)

# Backward-compatibility routes — kept so existing frontend and tests continue
# to work without changes. Remove once frontend migrates to /api/v1.
app.include_router(cocktails.router)
app.include_router(auth_router)
app.include_router(favorites.router)
app.include_router(users.router)
app.include_router(pantry.router)
