from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import Base, engine
from routers import auth, users, complaints, dashboard, feedback, notifications

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CCRTS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router,          prefix="/api")
app.include_router(users.router,         prefix="/api")
app.include_router(complaints.router,    prefix="/api")
app.include_router(dashboard.router,     prefix="/api")
app.include_router(feedback.router,      prefix="/api")
app.include_router(notifications.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "CCRTS API is running"}
