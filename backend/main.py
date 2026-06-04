from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models

# Create all DB tables on startup (including new conversations table)
models.Base.metadata.create_all(bind=engine)

from routers import auth, users, violations, risk, conversations

app = FastAPI(title="TRAK API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://trak-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(violations.router)
app.include_router(risk.router)
app.include_router(conversations.router)


@app.get("/")
def root():
    return {"message": "TRAK API is running 🚗"}