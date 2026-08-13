from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.database.database import get_db
from app.database.models import (
    Amenity,
    Booking,
    Listing,
    ListingImage,
    User,
)


router = APIRouter(
    prefix="/api/listings",
    tags=["Listings"],
)


# =========================================================
# REQUEST SCHEMAS
# =========================================================

class ListingCreate(BaseModel):
    host_id: int
    title: str
    description: str
    location: str
    city: str
    country: str
    price_per_night: float
    property_type: str
    max_guests: int
    image_urls: list[str] = []
    amenities: list[str] = []


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    price_per_night: Optional[float] = None
    property_type: Optional[str] = None
    max_guests: Optional[int] = None
    image_urls: Optional[list[str]] = None
    amenities: Optional[list[str]] = None


# =========================================================
# HELPER
# =========================================================

def listing_to_dict(listing: Listing):
    return {
        "id": listing.id,
        "title": listing.title,
        "description": listing.description,
        "location": listing.location,
        "city": listing.city,
        "country": listing.country,
        "price_per_night": listing.price_per_night,
        "property_type": listing.property_type,
        "max_guests": listing.max_guests,
        "rating": listing.rating,
        "host": {
            "id": listing.host.id,
            "name": listing.host.name,
            "avatar": listing.host.avatar,
        },
        "images": [
            {
                "id": image.id,
                "image_url": image.image_url,
            }
            for image in listing.images
        ],
        "amenities": [
            {
                "id": amenity.id,
                "name": amenity.name,
            }
            for amenity in listing.amenities
        ],
    }


# =========================================================
# CREATE LISTING
# =========================================================

@router.post("/")
def create_listing(
    listing_data: ListingCreate,
    db: Session = Depends(get_db),
):
    # -----------------------------------------------------
    # Validate host
    # -----------------------------------------------------

    host = (
        db.query(User)
        .filter(User.id == listing_data.host_id)
        .first()
    )

    if not host:
        raise HTTPException(
            status_code=404,
            detail="Host not found",
        )

    # -----------------------------------------------------
    # Validate host role
    # -----------------------------------------------------

    if host.role != "host":
        raise HTTPException(
            status_code=400,
            detail="User is not a host",
        )

    # -----------------------------------------------------
    # Validate title
    # -----------------------------------------------------

    if not listing_data.title.strip():
        raise HTTPException(
            status_code=400,
            detail="Title is required",
        )

    # -----------------------------------------------------
    # Validate description
    # -----------------------------------------------------

    if not listing_data.description.strip():
        raise HTTPException(
            status_code=400,
            detail="Description is required",
        )

    # -----------------------------------------------------
    # Validate price
    # -----------------------------------------------------

    if listing_data.price_per_night <= 0:
        raise HTTPException(
            status_code=400,
            detail="Price must be greater than 0",
        )

    # -----------------------------------------------------
    # Validate guests
    # -----------------------------------------------------

    if listing_data.max_guests < 1:
        raise HTTPException(
            status_code=400,
            detail="Maximum guests must be at least 1",
        )

    # -----------------------------------------------------
    # Validate property type
    # -----------------------------------------------------

    if not listing_data.property_type.strip():
        raise HTTPException(
            status_code=400,
            detail="Property type is required",
        )

    # -----------------------------------------------------
    # Create listing
    # -----------------------------------------------------

    listing = Listing(
        host_id=listing_data.host_id,
        title=listing_data.title.strip(),
        description=listing_data.description.strip(),
        location=listing_data.location.strip(),
        city=listing_data.city.strip(),
        country=listing_data.country.strip(),
        price_per_night=listing_data.price_per_night,
        property_type=listing_data.property_type.strip(),
        max_guests=listing_data.max_guests,
        rating=0.0,
    )

    db.add(listing)
    db.flush()

    # -----------------------------------------------------
    # Add images
    # -----------------------------------------------------

    for image_url in listing_data.image_urls:
        image_url = image_url.strip()

        if image_url:
            image = ListingImage(
                listing_id=listing.id,
                image_url=image_url,
            )

            db.add(image)

    # -----------------------------------------------------
    # Add amenities
    # -----------------------------------------------------

    for amenity_name in listing_data.amenities:
        amenity_name = amenity_name.strip()

        if not amenity_name:
            continue

        amenity = (
            db.query(Amenity)
            .filter(Amenity.name.ilike(amenity_name))
            .first()
        )

        if not amenity:
            amenity = Amenity(
                name=amenity_name
            )

            db.add(amenity)
            db.flush()

        listing.amenities.append(amenity)

    # -----------------------------------------------------
    # Save
    # -----------------------------------------------------

    db.commit()
    db.refresh(listing)

    # Reload relationships
    listing = (
        db.query(Listing)
        .options(
            joinedload(Listing.images),
            joinedload(Listing.amenities),
            joinedload(Listing.host),
        )
        .filter(Listing.id == listing.id)
        .first()
    )

    return {
        "message": "Listing created successfully",
        "listing": listing_to_dict(listing),
    }


# =========================================================
# GET ALL LISTINGS
# =========================================================

@router.get("/")
def get_listings(
    location: Optional[str] = Query(None),
    property_type: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    guests: Optional[int] = Query(None),

    # NEW: DATE FILTERS
    check_in: Optional[date] = Query(None),
    check_out: Optional[date] = Query(None),

    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    # -----------------------------------------------------
    # Validate dates
    # -----------------------------------------------------

    if check_in and check_out:

        if check_in >= check_out:
            raise HTTPException(
                status_code=400,
                detail="Check-out date must be after check-in date",
            )

        if check_in < date.today():
            raise HTTPException(
                status_code=400,
                detail="Check-in date cannot be in the past",
            )

    elif check_in or check_out:

        raise HTTPException(
            status_code=400,
            detail="Both check-in and check-out dates are required",
        )

    # -----------------------------------------------------
    # Base query
    # -----------------------------------------------------

    query = db.query(Listing).options(
        joinedload(Listing.images),
        joinedload(Listing.amenities),
        joinedload(Listing.host),
    )

    # -----------------------------------------------------
    # Location filter
    # -----------------------------------------------------

    if location:
        search = f"%{location}%"

        query = query.filter(
            (Listing.city.ilike(search))
            | (Listing.country.ilike(search))
            | (Listing.location.ilike(search))
        )

    # -----------------------------------------------------
    # Property type filter
    # -----------------------------------------------------

    if property_type:
        query = query.filter(
            Listing.property_type.ilike(property_type)
        )

    # -----------------------------------------------------
    # Minimum price
    # -----------------------------------------------------

    if min_price is not None:
        query = query.filter(
            Listing.price_per_night >= min_price
        )

    # -----------------------------------------------------
    # Maximum price
    # -----------------------------------------------------

    if max_price is not None:
        query = query.filter(
            Listing.price_per_night <= max_price
        )

    # -----------------------------------------------------
    # Guest filter
    # -----------------------------------------------------

    if guests is not None:
        if guests < 1:
            raise HTTPException(
                status_code=400,
                detail="Guests must be at least 1",
            )

        query = query.filter(
            Listing.max_guests >= guests
        )

    # -----------------------------------------------------
    # DATE AVAILABILITY FILTER
    # -----------------------------------------------------

    if check_in and check_out:

        # A booking overlaps when:
        #
        # existing check-in < requested check-out
        # AND
        # existing check-out > requested check-in
        #
        # Cancelled bookings are ignored.

        overlapping_listing_ids = (
            db.query(Booking.listing_id)
            .filter(
                Booking.status == "confirmed",
                Booking.check_in < check_out,
                Booking.check_out > check_in,
            )
            .subquery()
        )

        query = query.filter(
            ~Listing.id.in_(
                overlapping_listing_ids
            )
        )

    # -----------------------------------------------------
    # Count
    # -----------------------------------------------------

    total = query.count()

    # -----------------------------------------------------
    # Pagination
    # -----------------------------------------------------

    listings = (
        query
        .order_by(Listing.id)
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    # -----------------------------------------------------
    # Response
    # -----------------------------------------------------

    return {
        "listings": [
            listing_to_dict(listing)
            for listing in listings
        ],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (
                (total + limit - 1) // limit
            ),
        },
    }


# =========================================================
# GET LISTINGS OF A SPECIFIC HOST
# =========================================================

@router.get("/host/{host_id}")
def get_host_listings(
    host_id: int,
    db: Session = Depends(get_db),
):
    listings = (
        db.query(Listing)
        .options(
            joinedload(Listing.images),
            joinedload(Listing.amenities),
            joinedload(Listing.host),
        )
        .filter(Listing.host_id == host_id)
        .order_by(Listing.id)
        .all()
    )

    return {
        "listings": [
            listing_to_dict(listing)
            for listing in listings
        ],
        "total": len(listings),
    }


# =========================================================
# GET SINGLE LISTING
# =========================================================

@router.get("/{listing_id}")
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
):
    listing = (
        db.query(Listing)
        .options(
            joinedload(Listing.images),
            joinedload(Listing.amenities),
            joinedload(Listing.host),
            joinedload(Listing.reviews),
        )
        .filter(Listing.id == listing_id)
        .first()
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    result = listing_to_dict(listing)

    result["reviews"] = [
        {
            "id": review.id,
            "rating": review.rating,
            "comment": review.comment,
            "user": {
                "id": review.user.id,
                "name": review.user.name,
                "avatar": review.user.avatar,
            },
        }
        for review in listing.reviews
    ]

    return result


# =========================================================
# UPDATE LISTING
# =========================================================

@router.put("/{listing_id}")
def update_listing(
    listing_id: int,
    listing_data: ListingUpdate,
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

    # -----------------------------------------------------
    # Update basic fields
    # -----------------------------------------------------

    if listing_data.title is not None:
        if not listing_data.title.strip():
            raise HTTPException(
                status_code=400,
                detail="Title cannot be empty",
            )

        listing.title = listing_data.title.strip()

    if listing_data.description is not None:
        if not listing_data.description.strip():
            raise HTTPException(
                status_code=400,
                detail="Description cannot be empty",
            )

        listing.description = listing_data.description.strip()

    if listing_data.location is not None:
        listing.location = listing_data.location.strip()

    if listing_data.city is not None:
        listing.city = listing_data.city.strip()

    if listing_data.country is not None:
        listing.country = listing_data.country.strip()

    if listing_data.price_per_night is not None:
        if listing_data.price_per_night <= 0:
            raise HTTPException(
                status_code=400,
                detail="Price must be greater than 0",
            )

        listing.price_per_night = (
            listing_data.price_per_night
        )

    if listing_data.property_type is not None:
        listing.property_type = (
            listing_data.property_type.strip()
        )

    if listing_data.max_guests is not None:
        if listing_data.max_guests < 1:
            raise HTTPException(
                status_code=400,
                detail="Maximum guests must be at least 1",
            )

        listing.max_guests = listing_data.max_guests

    # -----------------------------------------------------
    # Update images
    # -----------------------------------------------------

    if listing_data.image_urls is not None:
        listing.images.clear()

        for image_url in listing_data.image_urls:
            image_url = image_url.strip()

            if image_url:
                listing.images.append(
                    ListingImage(
                        image_url=image_url
                    )
                )

    # -----------------------------------------------------
    # Update amenities
    # -----------------------------------------------------

    if listing_data.amenities is not None:
        listing.amenities.clear()

        for amenity_name in listing_data.amenities:
            amenity_name = amenity_name.strip()

            if not amenity_name:
                continue

            amenity = (
                db.query(Amenity)
                .filter(
                    Amenity.name.ilike(
                        amenity_name
                    )
                )
                .first()
            )

            if not amenity:
                amenity = Amenity(
                    name=amenity_name
                )

                db.add(amenity)
                db.flush()

            listing.amenities.append(amenity)

    db.commit()
    db.refresh(listing)

    listing = (
        db.query(Listing)
        .options(
            joinedload(Listing.images),
            joinedload(Listing.amenities),
            joinedload(Listing.host),
        )
        .filter(Listing.id == listing.id)
        .first()
    )

    return {
        "message": "Listing updated successfully",
        "listing": listing_to_dict(listing),
    }


# =========================================================
# DELETE LISTING
# =========================================================

@router.delete("/{listing_id}")
def delete_listing(
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

    db.delete(listing)
    db.commit()

    return {
        "message": "Listing deleted successfully",
        "listing_id": listing_id,
    }