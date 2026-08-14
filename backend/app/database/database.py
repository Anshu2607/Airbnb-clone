from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# =========================================================
# DATABASE CONFIGURATION
# =========================================================

# Store the SQLite database inside the backend directory.
# Using an absolute path makes the database location
# predictable both locally and on Render.

BASE_DIR = Path(__file__).resolve().parents[2]

DATABASE_URL = f"sqlite:///{BASE_DIR / 'airbnb.db'}"


# =========================================================
# ENGINE
# =========================================================

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False,
    },
)


# =========================================================
# SESSION
# =========================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# =========================================================
# BASE
# =========================================================

Base = declarative_base()


# =========================================================
# DATABASE DEPENDENCY
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()