from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
