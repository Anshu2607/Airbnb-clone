from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database.database import get_db
from ..database.models import Booking, Listing, Review, User


router = APIRouter(
    prefix="/api/reviews",
    tags=["Reviews"],
)


# =========================================================
# REQUEST SCHEMA
# =========================================================

class ReviewCreate(BaseModel):
    listing_id: int
    user_id: int
    rating: float = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=1, max_length=2000)


# =========================================================
# CREATE REVIEW
# =========================================================

@router.post("/")
def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
):
    # -----------------------------------------------------
    # Check listing
    # -----------------------------------------------------

    listing = (
        db.query(Listing)
        .filter(Listing.id == review_data.listing_id)
        .first()
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    # -----------------------------------------------------
    # Check user
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == review_data.user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    # -----------------------------------------------------
    # Check whether user stayed at this listing
    # -----------------------------------------------------

    booking = (
        db.query(Booking)
        .filter(
            Booking.listing_id == review_data.listing_id,
            Booking.guest_id == review_data.user_id,
            Booking.status == "confirmed",
            Booking.check_out <= date.today(),
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=400,
            detail="You can review a listing only after completing a stay",
        )

    # -----------------------------------------------------
    # Prevent duplicate review for the same listing
    # -----------------------------------------------------

    existing_review = (
        db.query(Review)
        .filter(
            Review.listing_id == review_data.listing_id,
            Review.user_id == review_data.user_id,
        )
        .first()
    )

    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="You have already reviewed this listing",
        )

    # -----------------------------------------------------
    # Create review
    # -----------------------------------------------------

    review = Review(
        listing_id=review_data.listing_id,
        user_id=review_data.user_id,
        rating=review_data.rating,
        comment=review_data.comment.strip(),
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    # -----------------------------------------------------
    # Recalculate listing rating
    # -----------------------------------------------------

    reviews = (
        db.query(Review)
        .filter(Review.listing_id == listing.id)
        .all()
    )

    if reviews:
        average_rating = sum(
            review.rating for review in reviews
        ) / len(reviews)

        listing.rating = round(average_rating, 2)

    else:
        listing.rating = 0.0

    db.commit()
    db.refresh(listing)

    # -----------------------------------------------------
    # Response
    # -----------------------------------------------------

    return {
        "message": "Review submitted successfully",
        "review": {
            "id": review.id,
            "listing_id": review.listing_id,
            "user_id": review.user_id,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at,
        },
        "listing_rating": listing.rating,
    }


# =========================================================
# GET REVIEWS FOR A LISTING
# =========================================================

@router.get("/listing/{listing_id}")
def get_listing_reviews(
    listing_id: int,
    db: Session = Depends(get_db),
):
    listing = (
        db.query(Listing)
        .filter(Listing.id == listing_id)
        .first()
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    reviews = (
        db.query(Review)
        .filter(Review.listing_id == listing_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    return {
        "listing_id": listing_id,
        "rating": listing.rating,
        "total_reviews": len(reviews),
        "reviews": [
            {
                "id": review.id,
                "rating": review.rating,
                "comment": review.comment,
                "created_at": review.created_at,
                "user": {
                    "id": review.user.id,
                    "name": review.user.name,
                    "avatar": review.user.avatar,
                },
            }
            for review in reviews
        ],
    }
