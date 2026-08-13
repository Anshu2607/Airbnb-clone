"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/currentUser";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// =========================================================
// TYPES
// =========================================================

interface ReviewUser {
  id: number;
  name: string;
  avatar: string | null;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user: ReviewUser;
}

interface ReviewsResponse {
  listing_id: number;
  rating: number;
  total_reviews: number;
  reviews: Review[];
}

interface Listing {
  id: number;
  title: string;
  description: string;
  location: string;
  property_type: string;
  price_per_night: number;
  max_guests: number;
  bedrooms?: number;
  bathrooms?: number;
  rating?: number;
  host_id?: number;
  images?: string[];
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [listing, setListing] =
    useState<Listing | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // BOOKING STATE
  // =========================================================

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const [bookingLoading, setBookingLoading] =
    useState(false);

  const [bookingMessage, setBookingMessage] =
    useState("");

  // =========================================================
  // IMAGE STATE
  // =========================================================

  const [currentImage, setCurrentImage] = useState(0);

  // =========================================================
  // REVIEW STATE
  // =========================================================

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] =
    useState(false);

  const [reviewRating, setReviewRating] =
    useState(5);

  const [reviewComment, setReviewComment] =
    useState("");

  const [reviewMessage, setReviewMessage] =
    useState("");

  const [reviewSubmitting, setReviewSubmitting] =
    useState(false);

  // Temporary guest ID
  // Later this will come from authentication.
  const guestId = 4;

  // =========================================================
  // FETCH LISTING
  // =========================================================

  useEffect(() => {
    if (!id) return;

    const fetchListing = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/listings/${id}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch listing"
          );
        }

        const data = await response.json();

        setListing(data);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load this listing."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // =========================================================
  // FETCH REVIEWS
  // =========================================================

  const fetchReviews = async () => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/reviews/listing/${id}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.detail || "Failed to fetch reviews"
      );
    }

    setReviews(data.reviews || []);
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    setReviews([]);
  }
};

const fetchListing = async () => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/listings/${id}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.detail || "Failed to fetch listing"
      );
    }

    setListing(data);
  } catch (error) {
    console.error("Failed to fetch listing:", error);
    setListing(null);
  }
};
  useEffect(() => {
  if (!id) return;

  fetchListing();
  fetchReviews();
}, [id]);

  // =========================================================
  // DATE CALCULATION
  // =========================================================

  const calculateNights = () => {
    if (!checkIn || !checkOut) {
      return 0;
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const difference =
      end.getTime() - start.getTime();

    const nights = Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    );

    return nights > 0 ? nights : 0;
  };

  const nights = calculateNights();

  const totalPrice =
    listing && nights > 0
      ? listing.price_per_night * nights
      : 0;

  // =========================================================
  // BOOK LISTING
  // =========================================================

const handleBooking = async () => {
  const currentUser = getCurrentUser();

if (!currentUser) {
  alert("Please select a user before booking.");
  return;
}
  try {
    if (!listing) {
      alert("Listing not available");
      return;
    }

    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }

    if (!guests || guests < 1) {
      alert("Please select at least 1 guest");
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      alert("Check-out date must be after check-in date");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      alert("Check-in date cannot be in the past");
      return;
    }

    if (Number(guests) > listing.max_guests) {
      alert(`Maximum ${listing.max_guests} guests allowed`);
      return;
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) /
        millisecondsPerDay
    );

    const totalPrice =
      nights * Number(listing.price_per_night);

    const response = await fetch(
      "http://127.0.0.1:8000/api/bookings/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listing_id: Number(listing.id),

          // Temporary guest user.
          // We will replace this with authentication later.
          guest_id: getCurrentUser()?.id,

          check_in: checkIn,
          check_out: checkOut,

          guests: Number(guests),

          total_price: totalPrice,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.detail || "Failed to create booking"
      );
    }

    alert("Booking confirmed successfully!");

    console.log("Booking created:", data);

  } catch (error) {
    console.error("Booking error:", error);

    alert(
      error instanceof Error
        ? error.message
        : "Failed to create booking"
    );
  }
};

  // =========================================================
  // SUBMIT REVIEW
  // =========================================================

  const handleReviewSubmit = async () => {
    if (!listing) return;

    setReviewMessage("");

    if (!reviewComment.trim()) {
      setReviewMessage(
        "Please write a review comment."
      );

      return;
    }

    try {
      setReviewSubmitting(true);

      const response = await fetch(
        `${API_URL}/api/reviews/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            listing_id: listing.id,
            user_id: guestId,
            rating: reviewRating,
            comment: reviewComment.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to submit review"
        );
      }

      setReviewMessage(
        "Review submitted successfully! ⭐"
      );

      setReviewComment("");
      setReviewRating(5);

      // Update listing rating immediately
      setListing((current) =>
        current
          ? {
              ...current,
              rating:
                data.listing_rating ??
                current.rating,
            }
          : current
      );

      // Reload reviews
      await fetchReviews();
    } catch (err) {
      console.error(
        "Review submission error:",
        err
      );

      setReviewMessage(
        err instanceof Error
          ? err.message
          : "Failed to submit review."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  // =========================================================
  // FORMAT REVIEW DATE
  // =========================================================

  const formatReviewDate = (
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

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="listing-page">
        <div className="loading-container">
          <h2>
            Loading listing...
          </h2>
        </div>
      </main>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !listing) {
    return (
      <main className="listing-page">
        <div className="error-container">
          <h2>
            {error ||
              "Listing not found"}
          </h2>

          <button
            onClick={() =>
              router.back()
            }
            className="back-button"
          >
            ← Go Back
          </button>
        </div>
      </main>
    );
  }

  // =========================================================
  // IMAGES
  // =========================================================

  const images =
    listing.images &&
    listing.images.length > 0
      ? listing.images
      : [
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
        ];

  const nextImage = () => {
    setCurrentImage(
      (prev) =>
        (prev + 1) % images.length
    );
  };

  const previousImage = () => {
    setCurrentImage(
      (prev) =>
        (prev - 1 + images.length) %
        images.length
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="listing-page">

      {/* =====================================================
          BACK BUTTON
      ===================================================== */}

      <button
        className="listing-back"
        onClick={() =>
          router.back()
        }
      >
        ← Back
      </button>

      {/* =====================================================
          TITLE
      ===================================================== */}

      <div className="listing-header">

        <div>
          <h1>
            {listing.title}
          </h1>

          <p className="listing-location">
            📍 {listing.location}
          </p>
        </div>

        <div className="listing-rating">
          ★{" "}
          {listing.rating ??
            "New"}
        </div>

      </div>

      {/* =====================================================
          IMAGE GALLERY
      ===================================================== */}

      <section className="image-gallery">

        <div className="main-image-container">

          <img
            src={`${images[currentImage]}?auto=format&fit=crop&w=1200&q=80`}
            alt={listing.title}
            className="main-listing-image"
          />

          {images.length > 1 && (
            <>
              <button
                className="image-arrow image-arrow-left"
                onClick={
                  previousImage
                }
              >
                ‹
              </button>

              <button
                className="image-arrow image-arrow-right"
                onClick={
                  nextImage
                }
              >
                ›
              </button>
            </>
          )}

        </div>

        {/* THUMBNAILS */}

        {images.length > 1 && (
          <div className="image-thumbnails">

            {images.map(
              (image, index) => (
                <button
                  key={index}
                  onClick={() =>
                    setCurrentImage(
                      index
                    )
                  }
                  className={
                    currentImage ===
                    index
                      ? "thumbnail active"
                      : "thumbnail"
                  }
                >
                  <img
                    src={`${image}?auto=format&fit=crop&w=300&q=80`}
                    alt={`View ${
                      index + 1
                    }`}
                  />
                </button>
              )
            )}

          </div>
        )}

      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section className="listing-content">

        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <div className="listing-info">

          <div className="property-heading">

            <h2>
              {listing.property_type}{" "}
              hosted by our Airbnb host
            </h2>

            <p>
              {listing.max_guests} guests

              {listing.bedrooms
                ? ` · ${listing.bedrooms} bedrooms`
                : ""}

              {listing.bathrooms
                ? ` · ${listing.bathrooms} bathrooms`
                : ""}
            </p>

          </div>

          <hr />

          {/* DESCRIPTION */}

          <div className="description">

            <h2>
              About this place
            </h2>

            <p>
              {listing.description}
            </p>

          </div>

          <hr />

          {/* PROPERTY DETAILS */}

          <div className="property-details">

            <h2>
              What this place offers
            </h2>

            <div className="details-grid">

              <div>
                🏠
                <span>
                  {listing.property_type}
                </span>
              </div>

              <div>
                👥
                <span>
                  Up to{" "}
                  {listing.max_guests}{" "}
                  guests
                </span>
              </div>

              {listing.bedrooms && (
                <div>
                  🛏️
                  <span>
                    {listing.bedrooms}{" "}
                    bedrooms
                  </span>
                </div>
              )}

              {listing.bathrooms && (
                <div>
                  🚿
                  <span>
                    {listing.bathrooms}{" "}
                    bathrooms
                  </span>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* ===================================================
            BOOKING CARD
        =================================================== */}

        <div className="booking-card">

          <div className="price">

            ₹
            {listing.price_per_night.toLocaleString(
              "en-IN"
            )}

            <span>
              {" "}
              night
            </span>

          </div>

          {/* DATES */}

          <div className="booking-inputs">

            <div className="date-input">

              <label>
                CHECK-IN
              </label>

              <input
                type="date"
                value={checkIn}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                onChange={(e) =>
                  setCheckIn(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="date-input">

              <label>
                CHECK-OUT
              </label>

              <input
                type="date"
                value={checkOut}
                min={
                  checkIn ||
                  undefined
                }
                onChange={(e) =>
                  setCheckOut(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* GUESTS */}

          <div className="guest-input">

            <label>
              GUESTS
            </label>

            <select
              value={guests}
              onChange={(e) =>
                setGuests(
                  Number(
                    e.target.value
                  )
                )
              }
            >
              {Array.from(
                {
                  length:
                    listing.max_guests,
                },
                (_, index) => (
                  <option
                    key={index + 1}
                    value={index + 1}
                  >
                    {index + 1}{" "}
                    {index + 1 === 1
                      ? "guest"
                      : "guests"}
                  </option>
                )
              )}
            </select>

          </div>

          {/* RESERVE BUTTON */}

          <button
            className="reserve-button"
            onClick={
              handleBooking
            }
            disabled={
              bookingLoading
            }
          >
            {bookingLoading
              ? "Booking..."
              : "Reserve"}
          </button>

          {/* BOOKING MESSAGE */}

          {bookingMessage && (
            <div
              className={
                bookingMessage.includes(
                  "successful"
                )
                  ? "booking-success"
                  : "booking-error"
              }
            >
              {bookingMessage}
            </div>
          )}

          {/* PRICE BREAKDOWN */}

          {nights > 0 && (
            <div className="price-breakdown">

              <div>

                <span>
                  ₹
                  {listing.price_per_night.toLocaleString(
                    "en-IN"
                  )}{" "}
                  × {nights} nights
                </span>

                <span>
                  ₹
                  {totalPrice.toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>

              <hr />

              <div className="total-row">

                <strong>
                  Total
                </strong>

                <strong>
                  ₹
                  {totalPrice.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

            </div>
          )}

        </div>

      </section>

      {/* =====================================================
          REVIEWS
      ===================================================== */}

      <section
        style={{
          marginTop: "60px",
          paddingTop: "40px",
          borderTop:
            "1px solid #ddd",
        }}
      >

        {/* REVIEW HEADER */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "30px",
          }}
        >

          <h2
            style={{
              fontSize: "28px",
              margin: 0,
            }}
          >
            ⭐ Reviews
          </h2>

          <span
            style={{
              color: "#666",
              fontSize: "16px",
            }}
          >
            {reviews.length}{" "}
            {reviews.length === 1
              ? "review"
              : "reviews"}
          </span>

          <span
            style={{
              fontWeight: 600,
            }}
          >
            ★{" "}
            {listing.rating ??
              "New"}
          </span>

        </div>

        {/* ===================================================
            REVIEW FORM
        =================================================== */}

        <div
          style={{
            border:
              "1px solid #ddd",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "35px",
            maxWidth: "700px",
          }}
        >

          <h3
            style={{
              marginTop: 0,
              marginBottom: "18px",
            }}
          >
            Leave a review
          </h3>

          {/* RATING */}

          <div
            style={{
              marginBottom: "18px",
            }}
          >

            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Rating
            </label>

            <select
              value={reviewRating}
              onChange={(e) =>
                setReviewRating(
                  Number(
                    e.target.value
                  )
                )
              }
              style={{
                padding: "10px",
                border:
                  "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "15px",
              }}
            >
              <option value={5}>
                ⭐⭐⭐⭐⭐ 5
              </option>

              <option value={4}>
                ⭐⭐⭐⭐ 4
              </option>

              <option value={3}>
                ⭐⭐⭐ 3
              </option>

              <option value={2}>
                ⭐⭐ 2
              </option>

              <option value={1}>
                ⭐ 1
              </option>
            </select>

          </div>

          {/* COMMENT */}

          <div
            style={{
              marginBottom: "18px",
            }}
          >

            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Your review
            </label>

            <textarea
              value={reviewComment}
              onChange={(e) =>
                setReviewComment(
                  e.target.value
                )
              }
              placeholder="Share your experience..."
              rows={5}
              style={{
                width: "100%",
                padding: "12px",
                border:
                  "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "15px",
                resize: "vertical",
                boxSizing:
                  "border-box",
              }}
            />

          </div>

          {/* REVIEW MESSAGE */}

          {reviewMessage && (
            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "15px",
                background:
                  reviewMessage.includes(
                    "successfully"
                  )
                    ? "#e8f7ed"
                    : "#ffe5e5",
                color:
                  reviewMessage.includes(
                    "successfully"
                  )
                    ? "#087f3e"
                    : "#c00",
              }}
            >
              {reviewMessage}
            </div>
          )}

          {/* SUBMIT */}

          <button
            onClick={
              handleReviewSubmit
            }
            disabled={
              reviewSubmitting
            }
            style={{
              border: "none",
              borderRadius: "9px",
              padding:
                "12px 22px",
              background:
                reviewSubmitting
                  ? "#aaa"
                  : "#ff385c",
              color: "white",
              fontWeight: 700,
              fontSize: "15px",
              cursor:
                reviewSubmitting
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {reviewSubmitting
              ? "Submitting..."
              : "Submit Review"}
          </button>

        </div>

        {/* ===================================================
            REVIEW LIST
        =================================================== */}

        {reviewLoading ? (
          <p>
            Loading reviews...
          </p>
        ) : reviews.length === 0 ? (
          <div
            style={{
              padding: "30px",
              border:
                "1px solid #eee",
              borderRadius: "14px",
              color: "#666",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: "#222",
              }}
            >
              No reviews yet
            </h3>

            <p>
              Be the first guest to
              review this listing.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >

            {reviews.map(
              (review) => (
                <article
                  key={review.id}
                  style={{
                    borderBottom:
                      "1px solid #eee",
                    paddingBottom:
                      "20px",
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: "12px",
                      marginBottom:
                        "10px",
                    }}
                  >

                    {review.user
                      .avatar ? (
                      <img
                        src={
                          review.user
                            .avatar
                        }
                        alt={
                          review.user
                            .name
                        }
                        style={{
                          width: "45px",
                          height: "45px",
                          borderRadius:
                            "50%",
                          objectFit:
                            "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "45px",
                          height: "45px",
                          borderRadius:
                            "50%",
                          background:
                            "#eee",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          fontWeight: 700,
                        }}
                      >
                        {review.user.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                    <div>

                      <strong>
                        {review.user.name}
                      </strong>

                      <div
                        style={{
                          fontSize:
                            "14px",
                          color:
                            "#666",
                          marginTop:
                            "3px",
                        }}
                      >
                        ★{" "}
                        {review.rating}{" "}
                        ·{" "}
                        {formatReviewDate(
                          review.created_at
                        )}
                      </div>

                    </div>

                  </div>

                  <p
                    style={{
                      margin: 0,
                      lineHeight: 1.6,
                      color: "#333",
                    }}
                  >
                    {review.comment}
                  </p>

                </article>
              )
            )}

          </div>
        )}

      </section>

    </main>
  );
}