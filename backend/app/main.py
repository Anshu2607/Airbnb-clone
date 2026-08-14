from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database.database import Base, SessionLocal, engine
from .database.models import Listing

from .routes.listings import router as listings_router
from .routes.bookings import router as bookings_router
from .routes.reviews import router as reviews_router
from .routes.users import router as users_router


app = FastAPI(
    title="Airbnb Clone API",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",

        # Old Vercel deployment
        "https://airbnb-clone-nine-livid.vercel.app",

        # Current Vercel deployment
        "https://airbnb-clone-hyodf7mu-anshu2607s-projects.vercel.app",
    ],

    # Allow Vercel preview/deployment URLs as well
    allow_origin_regex=r"https://.*\.vercel\.app",

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE INITIALIZATION
# =========================================================

@app.on_event("startup")
def initialize_database():
    """
    Create database tables if they do not exist.

    Render does not receive the local SQLite database because
    *.db files are ignored by Git.

    Therefore the tables must be created automatically when
    the Render backend starts.
    """

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:

        # Only seed when the database is empty.
        #
        # This prevents the application from deleting existing
        # listings every time the server restarts.

        if db.query(Listing).count() == 0:

            from .seed import seed_database

            seed_database()

            print(
                "Database was empty. "
                "Demo data seeded successfully."
            )

        else:

            print(
                "Database already contains listings. "
                "Skipping seed."
            )

    except Exception as error:

        print("Database initialization failed:")
        print(error)

        raise

    finally:

        db.close()


# =========================================================
# ROUTERS
# =========================================================

app.include_router(listings_router)
app.include_router(bookings_router)
app.include_router(reviews_router)
app.include_router(users_router)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message": "Airbnb Clone API is running"
    }