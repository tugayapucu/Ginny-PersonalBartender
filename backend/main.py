from fastapi import FastAPI
from routers import cocktails

app = FastAPI(title="Ginny Personal Bartender API")

app.include_router(cocktails.router)
