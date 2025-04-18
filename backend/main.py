from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import cocktails
from auth.routes import router as auth_router  # ✅ Add this line

app = FastAPI(title="Ginny Personal Bartender API")

# ✅ Add this middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route registration
app.include_router(cocktails.router)
app.include_router(auth_router)
