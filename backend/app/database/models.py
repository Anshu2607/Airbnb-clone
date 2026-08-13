from datetime import datetime

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    Table,
)
from sqlalchemy.orm import relationship

from .database import Base


listing_amenities = Table(
    "listing_amenities",
    Base.metadata,
    Column(
        "listing_id",
        Integer,
        ForeignKey("listings.id"),
        primary_key=True,
    ),
    Column(
        "amenity_id",
        Integer,
        ForeignKey("amenities.id"),
        primary_key=True,
    ),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    role = Column(String(20), nullable=False, default="guest")
    avatar = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    listings = relationship(
        "Listing",
        back_populates="host",
        cascade="all, delete-orphan",
    )

    bookings = relationship(
        "Booking",
        back_populates="guest",
        foreign_keys="Booking.guest_id",
    )

    reviews = relationship(
        "Review",
        back_populates="user",
    )


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)

    host_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)

    location = Column(String(200), nullable=False)
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)

    price_per_night = Column(Float, nullable=False)

    property_type = Column(
        String(50),
        nullable=False,
    )

    max_guests = Column(Integer, nullable=False)

    rating = Column(Float, default=0.0)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    host = relationship(
        "User",
        back_populates="listings",
    )

    images = relationship(
        "ListingImage",
        back_populates="listing",
        cascade="all, delete-orphan",
    )

    amenities = relationship(
        "Amenity",
        secondary=listing_amenities,
        back_populates="listings",
    )

    bookings = relationship(
        "Booking",
        back_populates="listing",
        cascade="all, delete-orphan",
    )

    reviews = relationship(
        "Review",
        back_populates="listing",
        cascade="all, delete-orphan",
    )


class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True, index=True)

    listing_id = Column(
        Integer,
        ForeignKey("listings.id"),
        nullable=False,
    )

    image_url = Column(
        String(500),
        nullable=False,
    )

    listing = relationship(
        "Listing",
        back_populates="images",
    )


class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String(100),
        unique=True,
        nullable=False,
    )

    listings = relationship(
        "Listing",
        secondary=listing_amenities,
        back_populates="amenities",
    )


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    listing_id = Column(
        Integer,
        ForeignKey("listings.id"),
        nullable=False,
    )

    guest_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    check_in = Column(
        Date,
        nullable=False,
    )

    check_out = Column(
        Date,
        nullable=False,
    )

    guests = Column(
        Integer,
        nullable=False,
    )

    total_price = Column(
        Float,
        nullable=False,
    )

    status = Column(
        String(30),
        nullable=False,
        default="confirmed",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    listing = relationship(
        "Listing",
        back_populates="bookings",
    )

    guest = relationship(
        "User",
        back_populates="bookings",
        foreign_keys=[guest_id],
    )


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)

    listing_id = Column(
        Integer,
        ForeignKey("listings.id"),
        nullable=False,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    rating = Column(
        Float,
        nullable=False,
    )

    comment = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    listing = relationship(
        "Listing",
        back_populates="reviews",
    )

    user = relationship(
        "User",
        back_populates="reviews",
    )