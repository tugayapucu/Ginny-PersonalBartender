from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from routers import cocktails
from routers import users
from auth.routes import router as auth_router
from routers import favorites
from settings import CORS_ALLOWED_ORIGINS
from database import engine


app = FastAPI(title="Ginny Personal Bartender API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
def health_check():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
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
app.include_router(v1)

# Backward-compatibility routes — kept so existing frontend and tests continue
# to work without changes. Remove once frontend migrates to /api/v1.
app.include_router(cocktails.router)
app.include_router(auth_router)
app.include_router(favorites.router)
app.include_router(users.router)
