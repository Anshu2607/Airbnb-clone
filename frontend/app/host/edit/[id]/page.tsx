"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = "http://127.0.0.1:8000";

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
}

export default function EditListingPage() {
    const params = useParams();
    const router = useRouter();

    const listingId = params.id as string;

    const [listing, setListing] = useState<Listing | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [pricePerNight, setPricePerNight] = useState("");
    const [propertyType, setPropertyType] = useState("");
    const [maxGuests, setMaxGuests] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================================================
    // FETCH LISTING
    // =========================================================

    useEffect(() => {
        if (!listingId) {
            return;
        }

        let cancelled = false;

        const fetchListing = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/api/listings/${listingId}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch listing");
                }

                const data: Listing = await response.json();

                if (cancelled) {
                    return;
                }

                setListing(data);

                setTitle(data.title || "");
                setDescription(data.description || "");
                setLocation(data.location || "");
                setCity(data.city || "");
                setCountry(data.country || "");
                setPricePerNight(
                    String(data.price_per_night ?? "")
                );
                setPropertyType(data.property_type || "");
                setMaxGuests(
                    String(data.max_guests ?? "")
                );
            } catch (err) {
                console.error("Error fetching listing:", err);

                if (!cancelled) {
                    setError("Failed to load listing.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchListing();

        return () => {
            cancelled = true;
        };
    }, [listingId]);

    // =========================================================
    // SUBMIT FORM
    // =========================================================

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_URL}/api/listings/${listingId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        location,
                        city,
                        country,
                        price_per_night: Number(pricePerNight),
                        property_type: propertyType,
                        max_guests: Number(maxGuests),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Failed to update listing"
                );
            }

            setSuccess("Listing updated successfully!");

            // Give the user a moment to see success message
            setTimeout(() => {
                router.push("/host");
                router.refresh();
            }, 1000);
        } catch (err) {
            console.error("Error updating listing:", err);

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Failed to update listing.");
            }
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <main className="edit-listing-page">
                <div className="edit-listing-container">
                    <p>Loading listing...</p>
                </div>
            </main>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error && !listing) {
        return (
            <main className="edit-listing-page">
                <div className="edit-listing-container">
                    <Link
                        href="/host"
                        className="back-link"
                    >
                        ← Back to Dashboard
                    </Link>

                    <h1>Edit Listing</h1>

                    <div className="error-message">
                        {error}
                    </div>
                </div>
            </main>
        );
    }

    // =========================================================
    // FORM
    // =========================================================

    return (
        <main className="edit-listing-page">
            <div className="edit-listing-container">

                {/* Header */}

                <div className="edit-header">

                    <div>
                        <Link
                            href="/host"
                            className="back-link"
                        >
                            ← Back to Dashboard
                        </Link>

                        <h1>Edit Listing</h1>

                        <p>
                            Update the details of your property.
                        </p>
                    </div>

                </div>

                {/* Success */}

                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}

                {/* Error */}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    className="edit-listing-form"
                >

                    {/* Title */}

                    <div className="form-group">
                        <label htmlFor="title">
                            Listing Title
                        </label>

                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(event) =>
                                setTitle(event.target.value)
                            }
                            placeholder="Enter listing title"
                            required
                        />
                    </div>

                    {/* Description */}

                    <div className="form-group">
                        <label htmlFor="description">
                            Description
                        </label>

                        <textarea
                            id="description"
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value
                                )
                            }
                            placeholder="Describe your property"
                            rows={6}
                            required
                        />
                    </div>

                    {/* Location */}

                    <div className="form-row">

                        <div className="form-group">
                            <label htmlFor="location">
                                Location
                            </label>

                            <input
                                id="location"
                                type="text"
                                value={location}
                                onChange={(event) =>
                                    setLocation(
                                        event.target.value
                                    )
                                }
                                placeholder="e.g. Boring Road"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="city">
                                City
                            </label>

                            <input
                                id="city"
                                type="text"
                                value={city}
                                onChange={(event) =>
                                    setCity(
                                        event.target.value
                                    )
                                }
                                placeholder="e.g. Patna"
                                required
                            />
                        </div>

                    </div>

                    {/* Country */}

                    <div className="form-group">
                        <label htmlFor="country">
                            Country
                        </label>

                        <input
                            id="country"
                            type="text"
                            value={country}
                            onChange={(event) =>
                                setCountry(
                                    event.target.value
                                )
                            }
                            placeholder="e.g. India"
                            required
                        />
                    </div>

                    {/* Price + Guests */}

                    <div className="form-row">

                        <div className="form-group">
                            <label htmlFor="price">
                                Price per Night
                            </label>

                            <input
                                id="price"
                                type="number"
                                min="0"
                                value={pricePerNight}
                                onChange={(event) =>
                                    setPricePerNight(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter price"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="guests">
                                Maximum Guests
                            </label>

                            <input
                                id="guests"
                                type="number"
                                min="1"
                                value={maxGuests}
                                onChange={(event) =>
                                    setMaxGuests(
                                        event.target.value
                                    )
                                }
                                placeholder="Maximum guests"
                                required
                            />
                        </div>

                    </div>

                    {/* Property Type */}

                    <div className="form-group">
                        <label htmlFor="propertyType">
                            Property Type
                        </label>

                        <select
                            id="propertyType"
                            value={propertyType}
                            onChange={(event) =>
                                setPropertyType(
                                    event.target.value
                                )
                            }
                            required
                        >
                            <option value="">
                                Select property type
                            </option>

                            <option value="Apartment">
                                Apartment
                            </option>

                            <option value="House">
                                House
                            </option>

                            <option value="Villa">
                                Villa
                            </option>

                            <option value="Hotel">
                                Hotel
                            </option>

                            <option value="Guest House">
                                Guest House
                            </option>

                            <option value="Cabin">
                                Cabin
                            </option>

                            <option value="Other">
                                Other
                            </option>
                        </select>
                    </div>

                    {/* Buttons */}

                    <div className="form-actions">

                        <Link
                            href="/host"
                            className="cancel-button"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            className="save-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                    </div>

                </form>

            </div>
        </main>
    );
}