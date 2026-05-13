import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST     = os.getenv("DB_HOST", "localhost")
DB_PORT     = int(os.getenv("DB_PORT", 3306))
DB_NAME     = os.getenv("DB_NAME", "ccrts_db")
DB_USER     = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")

JWT_SECRET                  = os.getenv("JWT_SECRET", "ccrts-secret")
JWT_ALGORITHM               = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

CORS_ORIGINS = ["http://localhost:5173", "http://localhost:3000"]
