from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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