from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from routers import cocktails
from routers import users
from auth.routes import router as auth_router
from routers import favorites
from database import Base, engine
import models  # Ensure SQLAlchemy models are registered.


app = FastAPI(title="Ginny Personal Bartender API")


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    ensure_user_columns()


def ensure_user_columns():
    with engine.begin() as conn:
        columns = {
            row["name"]
            for row in conn.execute(text("PRAGMA table_info(users)")).mappings().all()
        }
        if not columns:
            return
        if "theme" not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN theme TEXT"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route registration
app.include_router(cocktails.router)
app.include_router(auth_router)
app.include_router(favorites.router)
app.include_router(users.router)
