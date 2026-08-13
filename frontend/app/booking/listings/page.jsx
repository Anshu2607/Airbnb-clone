"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function BookingListingsPage() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchListings() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/api/listings/`
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch listings: ${response.status}`
                    );
                }

                const data = await response.json();

                setListings(data.listings || []);
            } catch (err) {
                console.error("Error fetching listings:", err);
                setError("Unable to load listings.");
            } finally {
                setLoading(false);
            }
        }

        fetchListings();
    }, []);

    if (loading) {
        return (
            <>
                <style jsx>{`
                    .loading {
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 20px;
                    }
                `}</style>

                <main className="loading">
                    Loading listings...
                </main>
            </>
        );
    }

    if (error) {
        return (
            <>
                <style jsx>{`
                    .error-page {
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                        font-family: Arial, sans-serif;
                    }

                    .error-message {
                        color: #e11d48;
                        font-size: 20px;
                        margin-bottom: 20px;
                    }

                    .retry-button {
                        border: none;
                        background: #ff385c;
                        color: white;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                    }

                    .retry-button:hover {
                        background: #e31c5f;
                    }
                `}</style>

                <main className="error-page">
                    <div>
                        <p className="error-message">{error}</p>

                        <button
                            className="retry-button"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <style jsx>{`
                * {
                    box-sizing: border-box;
                }

                .page {
                    min-height: 100vh;
                    background: #ffffff;
                    font-family: Arial, Helvetica, sans-serif;
                    color: #222222;
                }

                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 35px 40px 60px;
                }

                .back-link {
                    display: inline-block;
                    color: #555555;
                    text-decoration: none;
                    font-size: 16px;
                    margin-bottom: 22px;
                }

                .back-link:hover {
                    color: #ff385c;
                }

                .header {
                    margin-bottom: 30px;
                }

                .title {
                    font-size: 36px;
                    font-weight: 700;
                    margin: 0 0 8px;
                }

                .subtitle {
                    color: #717171;
                    font-size: 17px;
                    margin: 0;
                }

                .grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 28px 22px;
                }

                .card {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid #e5e5e5;
                    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
                    transition:
                        transform 0.2s ease,
                        box-shadow 0.2s ease;
                }

                .card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.13);
                }

                .image-link {
                    display: block;
                    text-decoration: none;
                }

                .image-container {
                    width: 100%;
                    height: 250px;
                    background: #f3f3f3;
                    overflow: hidden;
                }

                .listing-image {
                    width: 100%;
                    height: 100%;
                    display: block;
                    object-fit: cover;
                }

                .no-image {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #888888;
                    font-size: 16px;
                }

                .details {
                    padding: 18px;
                }

                .title-row {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 10px;
                }

                .listing-title {
                    font-size: 19px;
                    font-weight: 600;
                    margin: 0;
                    line-height: 1.3;
                }

                .rating {
                    white-space: nowrap;
                    font-size: 14px;
                    color: #333333;
                }

                .location {
                    color: #555555;
                    font-size: 15px;
                    margin: 12px 0 7px;
                }

                .property-type {
                    color: #777777;
                    font-size: 14px;
                    margin: 0 0 6px;
                }

                .guests {
                    color: #777777;
                    font-size: 14px;
                    margin: 0;
                }

                .bottom-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    margin-top: 18px;
                }

                .price {
                    font-size: 17px;
                    font-weight: 700;
                    margin: 0;
                }

                .per-night {
                    color: #777777;
                    font-size: 13px;
                    font-weight: 400;
                }

                .book-button {
                    display: inline-block;
                    background: #ff385c;
                    color: white;
                    text-decoration: none;
                    padding: 10px 17px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    transition: background 0.2s ease;
                }

                .book-button:hover {
                    background: #e31c5f;
                }

                .empty {
                    text-align: center;
                    padding: 100px 20px;
                }

                .empty-title {
                    font-size: 25px;
                    margin-bottom: 10px;
                }

                .empty-text {
                    color: #777777;
                }

                @media (max-width: 1100px) {
                    .grid {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                }

                @media (max-width: 800px) {
                    .container {
                        padding: 25px 20px 40px;
                    }

                    .grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }

                    .title {
                        font-size: 30px;
                    }
                }

                @media (max-width: 550px) {
                    .grid {
                        grid-template-columns: 1fr;
                    }

                    .image-container {
                        height: 280px;
                    }
                }
            `}</style>

            <main className="page">
                <div className="container">

                    {/* Back */}
                    <Link href="/" className="back-link">
                        ← Back to Home
                    </Link>

                    {/* Header */}
                    <div className="header">
                        <h1 className="title">
                            Find a place to stay
                        </h1>

                        <p className="subtitle">
                            Choose from available properties.
                        </p>
                    </div>

                    {/* Listings */}
                    {listings.length === 0 ? (
                        <div className="empty">
                            <h2 className="empty-title">
                                No listings available
                            </h2>

                            <p className="empty-text">
                                Please check again later.
                            </p>
                        </div>
                    ) : (
                        <div className="grid">
                            {listings.map((listing) => {
                                const image =
                                    listing.images &&
                                    listing.images.length > 0
                                        ? listing.images[0].image_url
                                        : null;

                                return (
                                    <article
                                        key={listing.id}
                                        className="card"
                                    >
                                        {/* Image */}
                                        <Link
                                            href={`/listing/${listing.id}`}
                                            className="image-link"
                                        >
                                            <div className="image-container">
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={listing.title}
                                                        className="listing-image"
                                                    />
                                                ) : (
                                                    <div className="no-image">
                                                        No image
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Details */}
                                        <div className="details">

                                            <div className="title-row">
                                                <h2 className="listing-title">
                                                    {listing.title}
                                                </h2>

                                                <span className="rating">
                                                    ★{" "}
                                                    {listing.rating || 0}
                                                </span>
                                            </div>

                                            <p className="location">
                                                📍 {listing.city},{" "}
                                                {listing.country}
                                            </p>

                                            <p className="property-type">
                                                {listing.property_type}
                                            </p>

                                            <p className="guests">
                                                👥 Up to{" "}
                                                {listing.max_guests} guests
                                            </p>

                                            <div className="bottom-row">

                                                <p className="price">
                                                    ₹
                                                    {Number(
                                                        listing.price_per_night
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                    <span className="per-night">
                                                        {" "}
                                                        / night
                                                    </span>
                                                </p>

                                                <Link
                                                    href={`/booking/${listing.id}`}
                                                    className="book-button"
                                                >
                                                    Book
                                                </Link>

                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}