"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function AddListingPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        city: "",
        country: "India",
        price_per_night: "",
        property_type: "Apartment",
        max_guests: "1",
        image_url: "",
        amenities: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const imageUrls = formData.image_url
                .split("\n")
                .map((url) => url.trim())
                .filter(Boolean);

            const amenities = formData.amenities
                .split(",")
                .map((amenity) => amenity.trim())
                .filter(Boolean);

            const response = await fetch(
                `${API_URL}/api/listings/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        host_id: 1,
                        title: formData.title,
                        description: formData.description,
                        location: formData.location,
                        city: formData.city,
                        country: formData.country,
                        price_per_night:
                            Number(formData.price_per_night),
                        property_type:
                            formData.property_type,
                        max_guests:
                            Number(formData.max_guests),
                        image_urls: imageUrls,
                        amenities: amenities,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Failed to create listing"
                );
            }

            setSuccess(
                "Listing created successfully!"
            );

            setTimeout(() => {
                router.push("/host");
            }, 1000);
        } catch (err) {
            console.error(
                "Error creating listing:",
                err
            );

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(
                    "Failed to create listing"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="host-page">
            <div className="host-container">

                {/* Header */}
                <div className="host-header">
                    <div>
                        <h1>Add New Listing</h1>

                        <p>
                            Create a new property for
                            guests to book.
                        </p>
                    </div>

                    <Link
                        href="/host"
                        className="secondary-button"
                    >
                        Back to Dashboard
                    </Link>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="listing-form"
                >

                    {/* Basic Information */}
                    <section className="form-section">
                        <h2>
                            Basic Information
                        </h2>

                        <div className="form-group">
                            <label htmlFor="title">
                                Property Title
                            </label>

                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Beautiful apartment in Mumbai"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">
                                Description
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                value={
                                    formData.description
                                }
                                onChange={handleChange}
                                placeholder="Describe your property..."
                                rows={5}
                                required
                            />
                        </div>

                        <div className="form-row">

                            <div className="form-group">
                                <label htmlFor="property_type">
                                    Property Type
                                </label>

                                <select
                                    id="property_type"
                                    name="property_type"
                                    value={
                                        formData.property_type
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >
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

                                    <option value="Guesthouse">
                                        Guesthouse
                                    </option>

                                    <option value="Cottage">
                                        Cottage
                                    </option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="max_guests">
                                    Maximum Guests
                                </label>

                                <input
                                    id="max_guests"
                                    name="max_guests"
                                    type="number"
                                    min="1"
                                    value={
                                        formData.max_guests
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />
                            </div>

                        </div>
                    </section>

                    {/* Location */}
                    <section className="form-section">
                        <h2>
                            Location
                        </h2>

                        <div className="form-group">
                            <label htmlFor="location">
                                Address / Location
                            </label>

                            <input
                                id="location"
                                name="location"
                                type="text"
                                value={
                                    formData.location
                                }
                                onChange={handleChange}
                                placeholder="Bandra West"
                                required
                            />
                        </div>

                        <div className="form-row">

                            <div className="form-group">
                                <label htmlFor="city">
                                    City
                                </label>

                                <input
                                    id="city"
                                    name="city"
                                    type="text"
                                    value={
                                        formData.city
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Mumbai"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="country">
                                    Country
                                </label>

                                <input
                                    id="country"
                                    name="country"
                                    type="text"
                                    value={
                                        formData.country
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />
                            </div>

                        </div>
                    </section>

                    {/* Pricing */}
                    <section className="form-section">
                        <h2>
                            Pricing
                        </h2>

                        <div className="form-group">
                            <label htmlFor="price_per_night">
                                Price Per Night (₹)
                            </label>

                            <input
                                id="price_per_night"
                                name="price_per_night"
                                type="number"
                                min="1"
                                step="0.01"
                                value={
                                    formData.price_per_night
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="4500"
                                required
                            />
                        </div>
                    </section>

                    {/* Images */}
                    <section className="form-section">
                        <h2>
                            Property Images
                        </h2>

                        <div className="form-group">
                            <label htmlFor="image_url">
                                Image URLs
                            </label>

                            <textarea
                                id="image_url"
                                name="image_url"
                                value={
                                    formData.image_url
                                }
                                onChange={handleChange}
                                placeholder={
                                    "Paste image URL here\n" +
                                    "Add another URL on the next line"
                                }
                                rows={4}
                            />

                            <small>
                                Add one image URL per
                                line.
                            </small>
                        </div>
                    </section>

                    {/* Amenities */}
                    <section className="form-section">
                        <h2>
                            Amenities
                        </h2>

                        <div className="form-group">
                            <label htmlFor="amenities">
                                Amenities
                            </label>

                            <input
                                id="amenities"
                                name="amenities"
                                type="text"
                                value={
                                    formData.amenities
                                }
                                onChange={handleChange}
                                placeholder="WiFi, Kitchen, Parking, Air Conditioning"
                            />

                            <small>
                                Separate amenities with
                                commas.
                            </small>
                        </div>
                    </section>

                    {/* Messages */}
                    {error && (
                        <div className="form-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="form-success">
                            {success}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="form-actions">

                        <Link
                            href="/host"
                            className="cancel-button"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating..."
                                : "Create Listing"}
                        </button>

                    </div>

                </form>
            </div>
        </main>
    );
}