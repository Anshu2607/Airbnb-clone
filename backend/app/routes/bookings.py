from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.database.database import get_db
from app.database.models import Booking, Listing, User


router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings"],
)


# =========================================================
# REQUEST SCHEMA
# =========================================================

class BookingCreate(BaseModel):
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: int


# =========================================================
# CREATE BOOKING
# =========================================================

@router.post("/")
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
):
    # -----------------------------------------------------
    # Validate dates
    # -----------------------------------------------------

    if booking_data.check_in >= booking_data.check_out:
        raise HTTPException(
            status_code=400,
            detail="Check-out date must be after check-in date",
        )

    if booking_data.check_in < date.today():
        raise HTTPException(
            status_code=400,
            detail="Check-in date cannot be in the past",
        )

    # -----------------------------------------------------
    # Find listing
    # -----------------------------------------------------

    listing = (
        db.query(Listing)
        .filter(Listing.id == booking_data.listing_id)
        .first()
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    # -----------------------------------------------------
    # Find guest
    # -----------------------------------------------------

    guest = (
        db.query(User)
        .filter(User.id == booking_data.guest_id)
        .first()
    )

    if not guest:
        raise HTTPException(
            status_code=404,
            detail="Guest not found",
        )

    # -----------------------------------------------------
    # Validate guest count
    # -----------------------------------------------------

    if booking_data.guests < 1:
        raise HTTPException(
            status_code=400,
            detail="At least one guest is required",
        )

    if booking_data.guests > listing.max_guests:
        raise HTTPException(
            status_code=400,
            detail=f"This listing allows a maximum of {listing.max_guests} guests",
        )

    # -----------------------------------------------------
    # Check booking conflicts
    # -----------------------------------------------------

    overlapping_booking = (
        db.query(Booking)
        .filter(
            Booking.listing_id == booking_data.listing_id,
            Booking.status == "confirmed",
            Booking.check_in < booking_data.check_out,
            Booking.check_out > booking_data.check_in,
        )
        .first()
    )

    if overlapping_booking:
        raise HTTPException(
            status_code=400,
            detail="Listing is already booked for the selected dates",
        )

    # -----------------------------------------------------
    # Calculate number of nights
    # -----------------------------------------------------

    nights = (
        booking_data.check_out - booking_data.check_in
    ).days

    total_price = nights * listing.price_per_night

    # -----------------------------------------------------
    # Create booking
    # -----------------------------------------------------

    booking = Booking(
        listing_id=booking_data.listing_id,
        guest_id=booking_data.guest_id,
        check_in=booking_data.check_in,
        check_out=booking_data.check_out,
        guests=booking_data.guests,
        total_price=total_price,
        status="confirmed",
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return {
        "message": "Booking created successfully",
        "booking": {
            "id": booking.id,
            "listing_id": booking.listing_id,
            "guest_id": booking.guest_id,
            "check_in": booking.check_in,
            "check_out": booking.check_out,
            "guests": booking.guests,
            "total_price": booking.total_price,
            "status": booking.status,
        },
    }


# =========================================================
# GET BOOKINGS OF A GUEST
# =========================================================

@router.get("/guest/{guest_id}")
def get_guest_bookings(
    guest_id: int,
    db: Session = Depends(get_db),
):
    bookings = (
        db.query(Booking)
        .options(
            joinedload(Booking.listing).joinedload(Listing.images),
            joinedload(Booking.guest),
        )
        .filter(Booking.guest_id == guest_id)
        .order_by(Booking.created_at.desc())
        .all()
    )

    results = []

    for booking in bookings:
        listing = booking.listing

        results.append(
            {
                "id": booking.id,
                "check_in": booking.check_in,
                "check_out": booking.check_out,
                "guests": booking.guests,
                "total_price": booking.total_price,
                "status": booking.status,
                "listing": {
                    "id": listing.id,
                    "title": listing.title,
                    "location": listing.location,
                    "city": listing.city,
                    "country": listing.country,
                    "price_per_night": listing.price_per_night,
                    "image": (
                        listing.images[0].image_url
                        if listing.images
                        else None
                    ),
                },
            }
        )

    return {
        "bookings": results,
        "total": len(results),
    }


# =========================================================
# GET BOOKINGS FOR A HOST
# =========================================================

@router.get("/host/{host_id}")
def get_host_bookings(
    host_id: int,
    db: Session = Depends(get_db),
):
    bookings = (
        db.query(Booking)
        .join(Listing)
        .options(
            joinedload(Booking.listing),
            joinedload(Booking.guest),
        )
        .filter(Listing.host_id == host_id)
        .order_by(Booking.created_at.desc())
        .all()
    )

    results = []

    for booking in bookings:
        results.append(
            {
                "id": booking.id,
                "check_in": booking.check_in,
                "check_out": booking.check_out,
                "guests": booking.guests,
                "total_price": booking.total_price,
                "status": booking.status,
                "listing": {
                    "id": booking.listing.id,
                    "title": booking.listing.title,
                },
                "guest": {
                    "id": booking.guest.id,
                    "name": booking.guest.name,
                    "email": booking.guest.email,
                    "avatar": booking.guest.avatar,
                },
            }
        )

    return {
        "bookings": results,
        "total": len(results),
    }


# =========================================================
# GET SINGLE BOOKING
# =========================================================

@router.get("/{booking_id}")
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .options(
            joinedload(Booking.listing),
            joinedload(Booking.guest),
        )
        .filter(Booking.id == booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    return {
        "id": booking.id,
        "check_in": booking.check_in,
        "check_out": booking.check_out,
        "guests": booking.guests,
        "total_price": booking.total_price,
        "status": booking.status,
        "listing": {
            "id": booking.listing.id,
            "title": booking.listing.title,
            "location": booking.listing.location,
            "city": booking.listing.city,
            "country": booking.listing.country,
            "price_per_night": booking.listing.price_per_night,
        },
        "guest": {
            "id": booking.guest.id,
            "name": booking.guest.name,
            "email": booking.guest.email,
            "avatar": booking.guest.avatar,
        },
    }


# =========================================================
# CANCEL BOOKING
# =========================================================

@router.delete("/{booking_id}")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Booking is already cancelled",
        )

    booking.status = "cancelled"

    db.commit()
    db.refresh(booking)

    return {
        "message": "Booking cancelled successfully",
        "booking": {
            "id": booking.id,
            "status": booking.status,
        },
    }
# =========================================================
# GET BOOKINGS FOR A GUEST
# =========================================================

@router.get("/guest/{guest_id}")
def get_guest_bookings(
    guest_id: int,
    db: Session = Depends(get_db),
):
    bookings = (
        db.query(Booking)
        .filter(Booking.guest_id == guest_id)
        .order_by(Booking.created_at.desc())
        .all()
    )

    return {
        "guest_id": guest_id,
        "total_bookings": len(bookings),
        "bookings": [
            {
                "id": booking.id,
                "listing_id": booking.listing_id,
                "check_in": booking.check_in,
                "check_out": booking.check_out,
                "guests": booking.guests,
                "total_price": booking.total_price,
                "status": booking.status,
                "created_at": booking.created_at,
                "listing": {
                    "id": booking.listing.id,
                    "title": booking.listing.title,
                    "location": booking.listing.location,
                    "city": booking.listing.city,
                    "country": booking.listing.country,
                    "price_per_night": booking.listing.price_per_night,
                    "property_type": booking.listing.property_type,
                    "images": [
                        {
                            "id": image.id,
                            "image_url": image.image_url,
                        }
                        for image in booking.listing.images
                    ],
                },
            }
            for booking in bookings
        ],
    }