"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const API_URL = "http://127.0.0.1:8000";

interface Booking {
    id: number;
    check_in: string;
    check_out: string;
    guests: number;
    total_price: number;
    status: string;
    listing: {
        id: number;
        title: string;
        location: string;
        city: string;
        country: string;
        price_per_night: number;
    };
    guest: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
}

export default function BookingPage() {
    const params = useParams();

    const bookingId = params.id;

    const [booking, setBooking] =
        useState<Booking | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [cancelling, setCancelling] =
        useState(false);

    const [cancelMessage, setCancelMessage] =
        useState("");

    useEffect(() => {
        const loadBooking = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/bookings/${bookingId}`
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail ||
                            "Failed to load booking"
                    );
                }

                setBooking(data);
            } catch (err) {
                console.error(
                    "Error loading booking:",
                    err
                );

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load booking."
                );
            } finally {
                setLoading(false);
            }
        };

        if (bookingId) {
            loadBooking();
        }
    }, [bookingId]);

    const calculateNights = () => {
        if (!booking) {
            return 0;
        }

        const checkIn = new Date(
            booking.check_in
        );

        const checkOut = new Date(
            booking.check_out
        );

        const difference =
            checkOut.getTime() -
            checkIn.getTime();

        return Math.ceil(
            difference /
                (1000 * 60 * 60 * 24)
        );
    };

    const handleCancel = async () => {
        if (!booking) {
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this booking?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setCancelling(true);
            setCancelMessage("");

            const response =
                await fetch(
                    `${API_URL}/api/bookings/${booking.id}`,
                    {
                        method: "DELETE",
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                        "Failed to cancel booking"
                );
            }

            setBooking({
                ...booking,
                status: "cancelled",
            });

            setCancelMessage(
                "Booking cancelled successfully."
            );
        } catch (err) {
            console.error(
                "Cancellation error:",
                err
            );

            setCancelMessage(
                err instanceof Error
                    ? err.message
                    : "Unable to cancel booking."
            );
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <main className="booking-page">
                <div className="booking-container loading">
                    <div className="spinner" />

                    <h2>
                        Loading your booking...
                    </h2>

                    <p>
                        Please wait.
                    </p>
                </div>

                <style jsx>{`
                    .booking-page {
                        min-height: 100vh;
                        background: #f7f7f7;
                        padding: 60px 20px;
                    }

                    .booking-container {
                        max-width: 900px;
                        margin: 0 auto;
                    }

                    .loading {
                        text-align: center;
                        padding-top: 100px;
                    }

                    .spinner {
                        width: 42px;
                        height: 42px;
                        border: 4px solid #ddd;
                        border-top-color: #ff385c;
                        border-radius: 50%;
                        margin: 0 auto 20px;
                        animation: spin 0.8s linear infinite;
                    }

                    @keyframes spin {
                        to {
                            transform: rotate(360deg);
                        }
                    }
                `}</style>
            </main>
        );
    }

    if (error || !booking) {
        return (
            <main className="booking-page">
                <div className="booking-container error-card">
                    <h1>
                        Booking not found
                    </h1>

                    <p>
                        {error ||
                            "We couldn't find this booking."}
                    </p>

                    <Link
                        href="/trips"
                        className="primary-button"
                    >
                        Go to My Trips
                    </Link>
                </div>

                <style jsx>{`
                    .booking-page {
                        min-height: 100vh;
                        background: #f7f7f7;
                        padding: 60px 20px;
                    }

                    .booking-container {
                        max-width: 900px;
                        margin: 0 auto;
                    }

                    .error-card {
                        background: white;
                        border-radius: 16px;
                        padding: 50px;
                        text-align: center;
                        box-shadow: 0 2px 10px
                            rgba(0, 0, 0, 0.08);
                    }

                    .error-card p {
                        color: #666;
                        margin-bottom: 25px;
                    }

                    .primary-button {
                        display: inline-block;
                        padding: 13px 24px;
                        background: #ff385c;
                        color: white;
                        text-decoration: none;
                        border-radius: 9px;
                        font-weight: 600;
                    }
                `}</style>
            </main>
        );
    }

    const nights = calculateNights();

    const isCancelled =
        booking.status === "cancelled";

    return (
        <main className="booking-page">
            <div className="booking-container">

                {/* Success Header */}
                <section
                    className={
                        isCancelled
                            ? "confirmation cancelled"
                            : "confirmation"
                    }
                >
                    <div className="confirmation-icon">
                        {isCancelled
                            ? "✕"
                            : "✓"}
                    </div>

                    <h1>
                        {isCancelled
                            ? "Booking cancelled"
                            : "Booking confirmed!"}
                    </h1>

                    <p>
                        {isCancelled
                            ? "Your reservation has been cancelled."
                            : "Your trip is all set. We look forward to hosting you."}
                    </p>
                </section>

                {/* Booking Number */}
                <div className="booking-number">
                    <span>
                        Booking ID
                    </span>

                    <strong>
                        #{booking.id}
                    </strong>
                </div>

                {/* Main Card */}
                <section className="booking-card">

                    {/* Listing */}
                    <div className="listing-summary">
                        <div className="listing-placeholder">
                            🏡
                        </div>

                        <div>
                            <p className="property-type">
                                Stay
                            </p>

                            <h2>
                                {booking.listing.title}
                            </h2>

                            <p className="location">
                                📍{" "}
                                {booking.listing.location},{" "}
                                {booking.listing.city},{" "}
                                {booking.listing.country}
                            </p>
                        </div>
                    </div>

                    <hr />

                    {/* Stay Details */}
                    <div className="section">

                        <h3>
                            Your stay
                        </h3>

                        <div className="details-grid">

                            <div className="detail">
                                <span>
                                    CHECK-IN
                                </span>

                                <strong>
                                    {booking.check_in}
                                </strong>
                            </div>

                            <div className="detail">
                                <span>
                                    CHECK-OUT
                                </span>

                                <strong>
                                    {booking.check_out}
                                </strong>
                            </div>

                            <div className="detail">
                                <span>
                                    GUESTS
                                </span>

                                <strong>
                                    {booking.guests}{" "}
                                    {booking.guests ===
                                    1
                                        ? "guest"
                                        : "guests"}
                                </strong>
                            </div>

                            <div className="detail">
                                <span>
                                    NIGHTS
                                </span>

                                <strong>
                                    {nights}
                                </strong>
                            </div>

                        </div>
                    </div>

                    <hr />

                    {/* Price */}
                    <div className="section">

                        <h3>
                            Price details
                        </h3>

                        <div className="price-row">
                            <span>
                                ₹
                                {booking.listing.price_per_night.toLocaleString(
                                    "en-IN"
                                )}{" "}
                                × {nights} nights
                            </span>

                            <span>
                                ₹
                                {booking.total_price.toLocaleString(
                                    "en-IN"
                                )}
                            </span>
                        </div>

                        <div className="price-row">
                            <span>
                                Service fee
                            </span>

                            <span>
                                Included
                            </span>
                        </div>

                        <hr />

                        <div className="total-row">
                            <strong>
                                Total
                            </strong>

                            <strong>
                                ₹
                                {booking.total_price.toLocaleString(
                                    "en-IN"
                                )}
                            </strong>
                        </div>
                    </div>

                    <hr />

                    {/* Guest */}
                    <div className="section">

                        <h3>
                            Guest
                        </h3>

                        <div className="guest-info">

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
                                />
                            ) : (
                                <div className="guest-avatar">
                                    👤
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
                    </div>

                </section>

                {/* Status */}
                <div className="status-section">

                    <div>
                        <span>
                            Status
                        </span>

                        <strong
                            className={
                                isCancelled
                                    ? "status cancelled-status"
                                    : "status"
                            }
                        >
                            {booking.status}
                        </strong>
                    </div>

                    {!isCancelled && (
                        <button
                            className="cancel-button"
                            onClick={
                                handleCancel
                            }
                            disabled={
                                cancelling
                            }
                        >
                            {cancelling
                                ? "Cancelling..."
                                : "Cancel booking"}
                        </button>
                    )}
                </div>

                {cancelMessage && (
                    <div
                        className={
                            cancelMessage.includes(
                                "successfully"
                            )
                                ? "message success"
                                : "message error"
                        }
                    >
                        {cancelMessage}
                    </div>
                )}

                {/* Actions */}
                <div className="actions">

                    <Link
                        href="/trips"
                        className="primary-button"
                    >
                        View My Trips
                    </Link>

                    <Link
                        href="/"
                        className="secondary-button"
                    >
                        Explore more stays
                    </Link>

                </div>
            </div>

            <style jsx>{`

                * {
                    box-sizing: border-box;
                }

                .booking-page {
                    min-height: 100vh;
                    background: #f7f7f7;
                    padding: 50px 20px 80px;
                }

                .booking-container {
                    max-width: 900px;
                    margin: 0 auto;
                }

                /* Confirmation */

                .confirmation {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .confirmation-icon {
                    width: 64px;
                    height: 64px;
                    margin: 0 auto 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: #e8f7ee;
                    color: #16833b;
                    font-size: 30px;
                    font-weight: 700;
                }

                .confirmation.cancelled
                    .confirmation-icon {
                    background: #fff0f0;
                    color: #d93025;
                }

                .confirmation h1 {
                    margin: 0 0 10px;
                    font-size: 34px;
                }

                .confirmation p {
                    margin: 0;
                    color: #666;
                    font-size: 16px;
                }

                /* Booking ID */

                .booking-number {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                    border-radius: 12px;
                    padding: 18px 22px;
                    margin-bottom: 18px;
                    border: 1px solid #e5e5e5;
                }

                .booking-number span {
                    color: #666;
                    font-size: 14px;
                }

                .booking-number strong {
                    font-size: 17px;
                }

                /* Main card */

                .booking-card {
                    background: white;
                    border: 1px solid #e5e5e5;
                    border-radius: 18px;
                    padding: 30px;
                    box-shadow:
                        0 3px 12px
                        rgba(0, 0, 0, 0.05);
                }

                .listing-summary {
                    display: flex;
                    gap: 20px;
                    align-items: center;
                }

                .listing-placeholder {
                    width: 110px;
                    height: 90px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f1f1f1;
                    border-radius: 12px;
                    font-size: 38px;
                }

                .property-type {
                    margin: 0 0 5px;
                    font-size: 13px;
                    color: #666;
                    text-transform: uppercase;
                }

                .listing-summary h2 {
                    margin: 0 0 8px;
                    font-size: 22px;
                }

                .location {
                    margin: 0;
                    color: #666;
                    font-size: 14px;
                }

                hr {
                    border: none;
                    border-top: 1px solid #e5e5e5;
                    margin: 28px 0;
                }

                /* Sections */

                .section h3 {
                    margin: 0 0 20px;
                    font-size: 19px;
                }

                .details-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(2, 1fr);
                    gap: 24px;
                }

                .detail {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .detail span {
                    color: #777;
                    font-size: 11px;
                    font-weight: 700;
                }

                .detail strong {
                    font-size: 15px;
                }

                /* Price */

                .price-row,
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 20px;
                    margin-bottom: 15px;
                }

                .price-row {
                    color: #555;
                    font-size: 14px;
                }

                .total-row {
                    font-size: 18px;
                    margin-bottom: 0;
                }

                /* Guest */

                .guest-info {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .guest-info img,
                .guest-avatar {
                    width: 52px;
                    height: 52px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .guest-avatar {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #eeeeee;
                    font-size: 22px;
                }

                .guest-info p {
                    margin: 5px 0 0;
                    color: #666;
                    font-size: 14px;
                }

                /* Status */

                .status-section {
                    margin-top: 18px;
                    padding: 20px 22px;
                    background: white;
                    border: 1px solid #e5e5e5;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                }

                .status-section > div:first-child {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .status-section > div:first-child > span {
                    color: #777;
                    font-size: 13px;
                }

                .status {
                    color: #16833b;
                    font-weight: 700;
                    text-transform: capitalize;
                }

                .cancelled-status {
                    color: #d93025;
                }

                .cancel-button {
                    padding: 10px 16px;
                    border: 1px solid #d93025;
                    border-radius: 8px;
                    background: white;
                    color: #d93025;
                    cursor: pointer;
                    font-weight: 600;
                }

                .cancel-button:hover:not(:disabled) {
                    background: #fff0f0;
                }

                .cancel-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* Messages */

                .message {
                    margin-top: 15px;
                    padding: 13px 16px;
                    border-radius: 10px;
                    text-align: center;
                    font-size: 14px;
                }

                .success {
                    background: #e8f7ee;
                    color: #16833b;
                }

                .error {
                    background: #fff0f0;
                    color: #d93025;
                }

                /* Actions */

                .actions {
                    display: flex;
                    gap: 14px;
                    margin-top: 25px;
                }

                .primary-button,
                .secondary-button {
                    flex: 1;
                    padding: 14px 20px;
                    border-radius: 10px;
                    text-align: center;
                    text-decoration: none;
                    font-weight: 600;
                }

                .primary-button {
                    background: #ff385c;
                    color: white;
                }

                .primary-button:hover {
                    background: #e61e4d;
                }

                .secondary-button {
                    background: white;
                    color: #222;
                    border: 1px solid #ccc;
                }

                .secondary-button:hover {
                    background: #f7f7f7;
                }

                /* Responsive */

                @media (max-width: 600px) {

                    .booking-page {
                        padding: 30px 15px 60px;
                    }

                    .confirmation h1 {
                        font-size: 27px;
                    }

                    .booking-card {
                        padding: 20px;
                    }

                    .listing-summary {
                        align-items: flex-start;
                    }

                    .listing-placeholder {
                        width: 80px;
                        height: 70px;
                    }

                    .details-grid {
                        grid-template-columns: 1fr;
                    }

                    .status-section {
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .actions {
                        flex-direction: column;
                    }
                }

            `}</style>
        </main>
    );
}