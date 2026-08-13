"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = "http://127.0.0.1:8000";
const HOST_ID = 3;

interface Guest {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
}

interface Listing {
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
    listing: Listing;
    guest: Guest;
}

export default function HostBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadBookings = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/bookings/host/${HOST_ID}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch host bookings");
            }

            const data = await response.json();

            setBookings(data.bookings || []);
        } catch (err) {
            console.error("Error fetching host bookings:", err);
            setError("Failed to load guest bookings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatPrice = (price: number) => {
        return `₹${price.toLocaleString("en-IN")}`;
    };

    const getStatusClass = (status: string) => {
        if (status === "confirmed") {
            return "host-booking-status confirmed";
        }

        if (status === "cancelled") {
            return "host-booking-status cancelled";
        }

        return "host-booking-status";
    };

    return (
        <main className="host-bookings-page">
            <div className="host-bookings-container">

                {/* Header */}
                <div className="host-bookings-header">
                    <div>
                        <Link
                            href="/host"
                            className="host-back-link"
                        >
                            ← Back to Dashboard
                        </Link>

                        <h1>Guest Bookings</h1>

                        <p>
                            Manage reservations made for your
                            properties.
                        </p>
                    </div>

                    <button
                        onClick={loadBookings}
                        className="host-refresh-button"
                    >
                        Refresh
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="host-bookings-message">
                        Loading bookings...
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="host-bookings-error">
                        <p>{error}</p>

                        <button
                            onClick={loadBookings}
                            className="host-retry-button"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty */}
                {!loading &&
                    !error &&
                    bookings.length === 0 && (
                        <div className="host-bookings-empty">
                            <div className="host-empty-icon">
                                🏡
                            </div>

                            <h2>No bookings yet</h2>

                            <p>
                                Guests have not made any
                                reservations for your properties
                                yet.
                            </p>
                        </div>
                    )}

                {/* Bookings */}
                {!loading &&
                    !error &&
                    bookings.length > 0 && (
                        <div className="host-bookings-list">

                            <div className="host-bookings-count">
                                {bookings.length}{" "}
                                {bookings.length === 1
                                    ? "booking"
                                    : "bookings"}
                            </div>

                            {bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="host-booking-card"
                                >
                                    {/* Top section */}
                                    <div className="host-booking-top">

                                        <div>
                                            <span className="booking-number">
                                                Booking #{booking.id}
                                            </span>

                                            <h2>
                                                {booking.listing.title}
                                            </h2>
                                        </div>

                                        <span
                                            className={getStatusClass(
                                                booking.status
                                            )}
                                        >
                                            {booking.status
                                                .charAt(0)
                                                .toUpperCase() +
                                                booking.status.slice(
                                                    1
                                                )}
                                        </span>
                                    </div>

                                    {/* Guest */}
                                    <div className="host-guest-section">

                                        {booking.guest.avatar ? (
                                            <img
                                                src={
                                                    booking.guest
                                                        .avatar
                                                }
                                                alt={
                                                    booking.guest
                                                        .name
                                                }
                                                className="host-guest-avatar"
                                            />
                                        ) : (
                                            <div className="host-guest-avatar-placeholder">
                                                {booking.guest.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                        )}

                                        <div>
                                            <strong>
                                                {
                                                    booking.guest
                                                        .name
                                                }
                                            </strong>

                                            <p>
                                                {
                                                    booking.guest
                                                        .email
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {/* Booking details */}
                                    <div className="host-booking-details">

                                        <div className="host-booking-detail">
                                            <span>
                                                Check-in
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    booking.check_in
                                                )}
                                            </strong>
                                        </div>

                                        <div className="host-booking-detail">
                                            <span>
                                                Check-out
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    booking.check_out
                                                )}
                                            </strong>
                                        </div>

                                        <div className="host-booking-detail">
                                            <span>
                                                Guests
                                            </span>

                                            <strong>
                                                {booking.guests}
                                            </strong>
                                        </div>

                                        <div className="host-booking-detail">
                                            <span>
                                                Total Price
                                            </span>

                                            <strong>
                                                {formatPrice(
                                                    booking.total_price
                                                )}
                                            </strong>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="host-booking-footer">

                                        <span>
                                            Property #
                                            {booking.listing.id}
                                        </span>

                                        <Link
                                            href={`/booking/${booking.listing.id}`}
                                            className="view-property-button"
                                        >
                                            View Property
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
            </div>
        </main>
    );
}