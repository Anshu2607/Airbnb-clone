"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// =========================================================
// TYPES
// =========================================================

interface Image {
    id: number;
    image_url: string;
}

interface Amenity {
    id: number;
    name: string;
}

interface Host {
    id: number;
    name: string;
    avatar: string | null;
}

interface Listing {
    id: number;
    title: string;
    description: string;
    location: string;
    city: string;
    country: string;
    price_per_night: number;
    property_type: string;
    max_guests: number;
    rating: number;
    host: Host;
    images: Image[];
    amenities: Amenity[];
}

interface Guest {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
}

interface BookingListing {
    id: number;
    title: string;
}

interface Booking {
    id: number;
    check_in: string;
    check_out: string;
    guests: number;
    total_price: number;
    status: string;
    listing: BookingListing;
    guest: Guest;
}

interface BookingsResponse {
    bookings: Booking[];
    total: number;
}

// =========================================================
// HOST PAGE
// =========================================================

export default function HostPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);

    const [loading, setLoading] = useState(true);
    const [bookingsLoading, setBookingsLoading] = useState(true);

    const [error, setError] = useState("");
    const [bookingsError, setBookingsError] = useState("");

    const [deletingId, setDeletingId] = useState<number | null>(null);

    // =====================================================
    // FETCH HOST LISTINGS
    // =====================================================

    const fetchListings = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/listings/host/1`
            );

            if (!response.ok) {
                const data = await response
                    .json()
                    .catch(() => null);

                throw new Error(
                    data?.detail ||
                        "Failed to fetch listings"
                );
            }

            const data = await response.json();

            setListings(data.listings || []);
        } catch (error) {
            console.error(
                "Error fetching listings:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to fetch listings"
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // FETCH HOST BOOKINGS
    // =====================================================

    const fetchBookings = async () => {
        try {
            setBookingsLoading(true);
            setBookingsError("");

            const response = await fetch(
                `${API_URL}/api/bookings/host/1`
            );

            if (!response.ok) {
                const data = await response
                    .json()
                    .catch(() => null);

                throw new Error(
                    data?.detail ||
                        "Failed to fetch bookings"
                );
            }

            const data: BookingsResponse =
                await response.json();

            setBookings(data.bookings || []);
        } catch (error) {
            console.error(
                "Error fetching bookings:",
                error
            );

            setBookingsError(
                error instanceof Error
                    ? error.message
                    : "Failed to fetch bookings"
            );
        } finally {
            setBookingsLoading(false);
        }
    };

    // =====================================================
    // LOAD DATA
    // =====================================================

    useEffect(() => {
        fetchListings();
        fetchBookings();
    }, []);

    // =====================================================
    // DELETE LISTING
    // =====================================================

    const handleDelete = async (
        listingId: number
    ) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this listing?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(listingId);

            const response = await fetch(
                `${API_URL}/api/listings/${listingId}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const data = await response
                    .json()
                    .catch(() => null);

                throw new Error(
                    data?.detail ||
                        "Failed to delete listing"
                );
            }

            setListings((currentListings) =>
                currentListings.filter(
                    (listing) =>
                        listing.id !== listingId
                )
            );

            alert(
                "Listing deleted successfully."
            );
        } catch (error) {
            console.error(
                "Error deleting listing:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to delete listing"
            );
        } finally {
            setDeletingId(null);
        }
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (
        dateString: string
    ) => {
        const date = new Date(dateString);

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <main
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "40px 24px",
                }}
            >
                <h1>Host Dashboard</h1>

                <p>
                    Loading your listings...
                </p>
            </main>
        );
    }

    // =====================================================
    // ERROR
    // =====================================================

    if (error) {
        return (
            <main
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "40px 24px",
                }}
            >
                <h1>Host Dashboard</h1>

                <p>{error}</p>

                <button
                    onClick={fetchListings}
                    style={{
                        marginTop: "20px",
                        padding: "12px 20px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#ff385c",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                >
                    Try Again
                </button>
            </main>
        );
    }

    // =====================================================
    // DASHBOARD DATA
    // =====================================================

    const totalListings =
        listings.length;

    const averageRating =
        listings.length > 0
            ? listings.reduce(
                  (sum, listing) =>
                      sum +
                      (listing.rating || 0),
                  0
              ) / listings.length
            : 0;

    const totalBookings =
        bookings.length;

    const totalRevenue =
        bookings
            .filter(
                (booking) =>
                    booking.status !==
                    "cancelled"
            )
            .reduce(
                (sum, booking) =>
                    sum +
                    (booking.total_price || 0),
                0
            );

    // =====================================================
    // MAIN PAGE
    // =====================================================

    return (
        <main
            style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "40px 24px 80px",
            }}
        >
            {/* =================================================
                HEADER
            ================================================= */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "30px",
                    gap: "20px",
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: "36px",
                            marginBottom: "8px",
                        }}
                    >
                        Host Dashboard
                    </h1>

                    <p
                        style={{
                            color: "#666",
                            margin: 0,
                        }}
                    >
                        Manage your properties,
                        listings and bookings.
                    </p>
                </div>

                <Link
                    href="/"
                    style={{
                        display: "inline-block",
                        padding: "12px 20px",
                        borderRadius: "8px",
                        background: "#ff385c",
                        color: "white",
                        textDecoration: "none",
                        fontWeight: 600,
                    }}
                >
                    Explore stays
                </Link>
            </div>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px",
                    marginBottom: "50px",
                }}
            >
                {/* Total Listings */}

                <div
                    style={{
                        padding: "24px",
                        borderRadius: "16px",
                        border: "1px solid #e5e5e5",
                        background: "white",
                    }}
                >
                    <p
                        style={{
                            color: "#666",
                            marginBottom: "8px",
                        }}
                    >
                        Total Listings
                    </p>

                    <h2
                        style={{
                            fontSize: "32px",
                            margin: 0,
                        }}
                    >
                        {totalListings}
                    </h2>
                </div>

                {/* Active Listings */}

                <div
                    style={{
                        padding: "24px",
                        borderRadius: "16px",
                        border: "1px solid #e5e5e5",
                        background: "white",
                    }}
                >
                    <p
                        style={{
                            color: "#666",
                            marginBottom: "8px",
                        }}
                    >
                        Active Listings
                    </p>

                    <h2
                        style={{
                            fontSize: "32px",
                            margin: 0,
                        }}
                    >
                        {totalListings}
                    </h2>
                </div>

                {/* Average Rating */}

                <div
                    style={{
                        padding: "24px",
                        borderRadius: "16px",
                        border: "1px solid #e5e5e5",
                        background: "white",
                    }}
                >
                    <p
                        style={{
                            color: "#666",
                            marginBottom: "8px",
                        }}
                    >
                        Average Rating
                    </p>

                    <h2
                        style={{
                            fontSize: "32px",
                            margin: 0,
                        }}
                    >
                        {averageRating.toFixed(2)}
                    </h2>
                </div>

                {/* Total Bookings */}

                <div
                    style={{
                        padding: "24px",
                        borderRadius: "16px",
                        border: "1px solid #e5e5e5",
                        background: "white",
                    }}
                >
                    <p
                        style={{
                            color: "#666",
                            marginBottom: "8px",
                        }}
                    >
                        Total Bookings
                    </p>

                    <h2
                        style={{
                            fontSize: "32px",
                            margin: 0,
                        }}
                    >
                        {totalBookings}
                    </h2>
                </div>

                {/* Revenue */}

                <div
                    style={{
                        padding: "24px",
                        borderRadius: "16px",
                        border: "1px solid #e5e5e5",
                        background: "white",
                    }}
                >
                    <p
                        style={{
                            color: "#666",
                            marginBottom: "8px",
                        }}
                    >
                        Total Revenue
                    </p>

                    <h2
                        style={{
                            fontSize: "32px",
                            margin: 0,
                        }}
                    >
                        ₹
                        {totalRevenue.toLocaleString(
                            "en-IN"
                        )}
                    </h2>
                </div>
            </div>

            {/* =================================================
                LISTINGS HEADER
            ================================================= */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                    gap: "20px",
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <h2
                        style={{
                            fontSize: "28px",
                            marginBottom: "5px",
                        }}
                    >
                        My Listings
                    </h2>

                    <p
                        style={{
                            color: "#666",
                            margin: 0,
                        }}
                    >
                        Properties you currently
                        host.
                    </p>
                </div>

                <Link
                    href="/host/add"
                    style={{
                        display: "inline-block",
                        padding: "12px 20px",
                        borderRadius: "8px",
                        background: "#ff385c",
                        color: "white",
                        textDecoration: "none",
                        fontWeight: 600,
                    }}
                >
                    + Add Listing
                </Link>
            </div>

            {/* =================================================
                NO LISTINGS
            ================================================= */}

            {listings.length === 0 ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: "70px 20px",
                        border: "1px solid #e5e5e5",
                        borderRadius: "16px",
                    }}
                >
                    <h2>
                        No listings yet
                    </h2>

                    <p
                        style={{
                            color: "#666",
                            marginBottom: "20px",
                        }}
                    >
                        Start by adding your
                        first property.
                    </p>

                    <Link
                        href="/host/add"
                        style={{
                            display: "inline-block",
                            padding: "12px 20px",
                            borderRadius: "8px",
                            background: "#ff385c",
                            color: "white",
                            textDecoration: "none",
                            fontWeight: 600,
                        }}
                    >
                        Add Listing
                    </Link>
                </div>
            ) : (
                /* =================================================
                   LISTING GRID
                ================================================= */

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "28px",
                    }}
                >
                    {listings.map(
                        (listing) => (
                            <div
                                key={listing.id}
                                style={{
                                    border: "1px solid #e5e5e5",
                                    borderRadius: "16px",
                                    overflow: "hidden",
                                    background: "white",
                                    boxShadow:
                                        "0 4px 14px rgba(0,0,0,0.08)",
                                }}
                            >
                                {/* IMAGE */}

                                <Link
                                    href={`/listing/${listing.id}`}
                                    style={{
                                        display:
                                            "block",
                                        textDecoration:
                                            "none",
                                    }}
                                >
                                    {listing.images &&
                                    listing.images
                                        .length >
                                        0 ? (
                                        <img
                                            src={
                                                listing
                                                    .images[0]
                                                    .image_url
                                            }
                                            alt={
                                                listing.title
                                            }
                                            style={{
                                                width: "100%",
                                                height: "280px",
                                                objectFit:
                                                    "cover",
                                                display:
                                                    "block",
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: "100%",
                                                height: "280px",
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                    "center",
                                                background:
                                                    "#f1f1f1",
                                                color: "#777",
                                            }}
                                        >
                                            No image
                                        </div>
                                    )}
                                </Link>

                                {/* CONTENT */}

                                <div
                                    style={{
                                        padding:
                                            "18px",
                                    }}
                                >
                                    <h3
                                        style={{
                                            margin:
                                                "0 0 8px",
                                            fontSize:
                                                "20px",
                                        }}
                                    >
                                        {
                                            listing.title
                                        }
                                    </h3>

                                    <p
                                        style={{
                                            margin:
                                                "0 0 6px",
                                            color: "#666",
                                        }}
                                    >
                                        📍{" "}
                                        {
                                            listing.city
                                        }
                                        ,{" "}
                                        {
                                            listing.country
                                        }
                                    </p>

                                    <p
                                        style={{
                                            margin:
                                                "0 0 6px",
                                            color: "#666",
                                        }}
                                    >
                                        {
                                            listing.property_type
                                        }
                                    </p>

                                    <p
                                        style={{
                                            margin:
                                                "0 0 14px",
                                            fontWeight:
                                                600,
                                        }}
                                    >
                                        ₹
                                        {listing.price_per_night.toLocaleString(
                                            "en-IN"
                                        )}{" "}
                                        / night
                                    </p>

                                    {/* EDIT + DELETE */}

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            gap: "10px",
                                        }}
                                    >
                                        <Link
                                            href={`/host/edit/${listing.id}`}
                                            style={{
                                                flex: 1,
                                                textAlign:
                                                    "center",
                                                padding:
                                                    "10px 14px",
                                                borderRadius:
                                                    "8px",
                                                border:
                                                    "1px solid #222",
                                                color:
                                                    "#222",
                                                textDecoration:
                                                    "none",
                                                fontWeight:
                                                    600,
                                            }}
                                        >
                                            Edit
                                        </Link>

                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    listing.id
                                                )
                                            }
                                            disabled={
                                                deletingId ===
                                                listing.id
                                            }
                                            style={{
                                                flex: 1,
                                                padding:
                                                    "10px 14px",
                                                borderRadius:
                                                    "8px",
                                                border:
                                                    "1px solid #ff385c",
                                                background:
                                                    "#ff385c",
                                                color:
                                                    "white",
                                                fontWeight:
                                                    600,
                                                cursor:
                                                    deletingId ===
                                                    listing.id
                                                        ? "not-allowed"
                                                        : "pointer",
                                                opacity:
                                                    deletingId ===
                                                    listing.id
                                                        ? 0.6
                                                        : 1,
                                            }}
                                        >
                                            {deletingId ===
                                            listing.id
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}

            {/* =================================================
                HOST BOOKINGS
            ================================================= */}

            <section
                style={{
                    marginTop: "70px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: "center",
                        marginBottom: "24px",
                        gap: "20px",
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <h2
                            style={{
                                fontSize: "28px",
                                marginBottom: "5px",
                            }}
                        >
                            Guest Bookings
                        </h2>

                        <p
                            style={{
                                color: "#666",
                                margin: 0,
                            }}
                        >
                            Manage reservations
                            made for your properties.
                        </p>
                    </div>

                    <button
                        onClick={fetchBookings}
                        disabled={bookingsLoading}
                        style={{
                            padding: "10px 18px",
                            borderRadius: "8px",
                            border:
                                "1px solid #ddd",
                            background: "white",
                            cursor:
                                bookingsLoading
                                    ? "not-allowed"
                                    : "pointer",
                            fontWeight: 600,
                        }}
                    >
                        {bookingsLoading
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>
                </div>

                {/* BOOKING ERROR */}

                {bookingsError && (
                    <div
                        style={{
                            padding: "20px",
                            borderRadius: "12px",
                            border:
                                "1px solid #f5c2c7",
                            background:
                                "#fff5f5",
                            marginBottom: "20px",
                        }}
                    >
                        <p
                            style={{
                                margin: 0,
                                color: "#b42318",
                            }}
                        >
                            {bookingsError}
                        </p>

                        <button
                            onClick={fetchBookings}
                            style={{
                                marginTop: "12px",
                                padding:
                                    "10px 16px",
                                border: "none",
                                borderRadius:
                                    "8px",
                                background:
                                    "#ff385c",
                                color: "white",
                                cursor:
                                    "pointer",
                                fontWeight: 600,
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* BOOKING LOADING */}

                {bookingsLoading ? (
                    <div
                        style={{
                            padding: "50px 20px",
                            textAlign: "center",
                            border:
                                "1px solid #e5e5e5",
                            borderRadius: "16px",
                        }}
                    >
                        <p>
                            Loading bookings...
                        </p>
                    </div>
                ) : bookings.length === 0 ? (
                    /* NO BOOKINGS */

                    <div
                        style={{
                            padding: "60px 20px",
                            textAlign: "center",
                            border:
                                "1px solid #e5e5e5",
                            borderRadius: "16px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "48px",
                                marginBottom:
                                    "12px",
                            }}
                        >
                            📅
                        </div>

                        <h3
                            style={{
                                marginBottom:
                                    "8px",
                            }}
                        >
                            No bookings yet
                        </h3>

                        <p
                            style={{
                                color: "#666",
                                margin: 0,
                            }}
                        >
                            Guest reservations for
                            your properties will
                            appear here.
                        </p>
                    </div>
                ) : (
                    /* BOOKING LIST */

                    <div
                        style={{
                            display: "flex",
                            flexDirection:
                                "column",
                            gap: "16px",
                        }}
                    >
                        {bookings.map(
                            (booking) => {
                                const isCancelled =
                                    booking.status ===
                                    "cancelled";

                                return (
                                    <div
                                        key={
                                            booking.id
                                        }
                                        style={{
                                            border:
                                                "1px solid #e5e5e5",
                                            borderRadius:
                                                "16px",
                                            padding:
                                                "22px",
                                            background:
                                                "white",
                                            boxShadow:
                                                "0 3px 12px rgba(0,0,0,0.05)",
                                        }}
                                    >
                                        {/* BOOKING TOP */}

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems:
                                                    "flex-start",
                                                gap: "20px",
                                                flexWrap:
                                                    "wrap",
                                                marginBottom:
                                                    "20px",
                                            }}
                                        >
                                            <div>
                                                <p
                                                    style={{
                                                        color:
                                                            "#666",
                                                        fontSize:
                                                            "14px",
                                                        margin:
                                                            "0 0 6px",
                                                    }}
                                                >
                                                    Booking #
                                                    {
                                                        booking.id
                                                    }
                                                </p>

                                                <h3
                                                    style={{
                                                        margin:
                                                            "0 0 6px",
                                                        fontSize:
                                                            "21px",
                                                    }}
                                                >
                                                    {
                                                        booking
                                                            .listing
                                                            .title
                                                    }
                                                </h3>
                                            </div>

                                            <span
                                                style={{
                                                    display:
                                                        "inline-block",
                                                    padding:
                                                        "7px 13px",
                                                    borderRadius:
                                                        "999px",
                                                    background:
                                                        isCancelled
                                                            ? "#f1f1f1"
                                                            : "#e8f7ee",
                                                    color:
                                                        isCancelled
                                                            ? "#666"
                                                            : "#16794c",
                                                    fontSize:
                                                        "14px",
                                                    fontWeight:
                                                        600,
                                                }}
                                            >
                                                {booking.status
                                                    ? booking.status
                                                          .charAt(
                                                              0
                                                          )
                                                          .toUpperCase() +
                                                      booking.status.slice(
                                                          1
                                                      )
                                                    : "Confirmed"}
                                            </span>
                                        </div>

                                        {/* GUEST */}

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                gap: "14px",
                                                marginBottom:
                                                    "22px",
                                                padding:
                                                    "14px",
                                                background:
                                                    "#f8f8f8",
                                                borderRadius:
                                                    "12px",
                                            }}
                                        >
                                            {booking
                                                .guest
                                                .avatar ? (
                                                <img
                                                    src={
                                                        booking
                                                            .guest
                                                            .avatar
                                                    }
                                                    alt={
                                                        booking
                                                            .guest
                                                            .name
                                                    }
                                                    style={{
                                                        width:
                                                            "48px",
                                                        height:
                                                            "48px",
                                                        borderRadius:
                                                            "50%",
                                                        objectFit:
                                                            "cover",
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width:
                                                            "48px",
                                                        height:
                                                            "48px",
                                                        borderRadius:
                                                            "50%",
                                                        background:
                                                            "#ddd",
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "center",
                                                        fontWeight:
                                                            700,
                                                        fontSize:
                                                            "18px",
                                                    }}
                                                >
                                                    {booking.guest.name
                                                        .charAt(
                                                            0
                                                        )
                                                        .toUpperCase()}
                                                </div>
                                            )}

                                            <div>
                                                <strong>
                                                    {
                                                        booking
                                                            .guest
                                                            .name
                                                    }
                                                </strong>

                                                <p
                                                    style={{
                                                        margin:
                                                            "4px 0 0",
                                                        color:
                                                            "#666",
                                                        fontSize:
                                                            "14px",
                                                    }}
                                                >
                                                    {
                                                        booking
                                                            .guest
                                                            .email
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* DETAILS */}

                                        <div
                                            style={{
                                                display:
                                                    "grid",
                                                gridTemplateColumns:
                                                    "repeat(auto-fit, minmax(150px, 1fr))",
                                                gap: "18px",
                                            }}
                                        >
                                            <div>
                                                <span
                                                    style={{
                                                        display:
                                                            "block",
                                                        color:
                                                            "#666",
                                                        fontSize:
                                                            "13px",
                                                        marginBottom:
                                                            "5px",
                                                    }}
                                                >
                                                    Check-in
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        booking.check_in
                                                    )}
                                                </strong>
                                            </div>

                                            <div>
                                                <span
                                                    style={{
                                                        display:
                                                            "block",
                                                        color:
                                                            "#666",
                                                        fontSize:
                                                            "13px",
                                                        marginBottom:
                                                            "5px",
                                                    }}
                                                >
                                                    Check-out
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        booking.check_out
                                                    )}
                                                </strong>
                                            </div>

                                            <div>
                                                <span
                                                    style={{
                                                        display:
                                                            "block",
                                                        color:
                                                            "#666",
                                                        fontSize:
                                                            "13px",
                                                        marginBottom:
                                                            "5px",
                                                    }}
                                                >
                                                    Guests
                                                </span>

                                                <strong>
                                                    {
                                                        booking.guests
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span
                                                    style={{
                                                        display:
                                                            "block",
                                                        color:
                                                            "#666",
                                                        fontSize:
                                                            "13px",
                                                        marginBottom:
                                                            "5px",
                                                    }}
                                                >
                                                    Total Price
                                                </span>

                                                <strong>
                                                    ₹
                                                    {booking.total_price.toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}