"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// =========================================================
// TYPES
// =========================================================

interface BookingListing {
  id: number;
  title: string;
}

interface BookingGuest {
  id: number;
  name: string;
  email?: string;
  avatar?: string | null;
}

interface Booking {
  id: number;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  listing: BookingListing;
  guest?: BookingGuest;
}

interface BookingsResponse {
  bookings: Booking[];
  total: number;
}

type TripFilter = "all" | "upcoming" | "past";

// =========================================================
// HELPERS
// =========================================================

/**
 * Get the currently selected user.
 *
 * The project is not using complete authentication yet, so the
 * current user is stored in localStorage.
 *
 * If no user has been selected yet, user ID 4 is used as the
 * current test guest. This prevents:
 *
 *     Cannot read properties of null (reading 'id')
 *
 * which previously crashed the Trips page.
 */
function getCurrentUserId(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUserId = localStorage.getItem("currentUserId");

  if (storedUserId) {
    const parsedId = Number(storedUserId);

    if (Number.isInteger(parsedId) && parsedId > 0) {
      return parsedId;
    }
  }

  // Temporary test user until authentication is completed.
  localStorage.setItem("currentUserId", "4");

  return 4;
}

function parseDate(dateString: string): Date {
  return new Date(`${dateString}T00:00:00`);
}

function getToday(): Date {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
}

function formatDate(dateString: string): string {
  const date = parseDate(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(price: number): string {
  return Number(price || 0).toLocaleString("en-IN");
}

function getBookingStatusClass(status: string): string {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "trip-status confirmed";

    case "cancelled":
    case "canceled":
      return "trip-status cancelled";

    case "completed":
      return "trip-status completed";

    case "pending":
      return "trip-status pending";

    default:
      return "trip-status";
  }
}

function isPastBooking(booking: Booking): boolean {
  const today = getToday();
  const checkout = parseDate(booking.check_out);

  return checkout < today;
}

function isUpcomingBooking(booking: Booking): boolean {
  const today = getToday();
  const checkout = parseDate(booking.check_out);

  return checkout >= today;
}

// =========================================================
// PAGE
// =========================================================

export default function TripsPage() {
  const router = useRouter();

  // =======================================================
  // STATE
  // =======================================================

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [currentUserId, setCurrentUserId] =
    useState<number | null>(null);

  const [activeFilter, setActiveFilter] =
    useState<TripFilter>("all");

  // =======================================================
  // GET CURRENT USER
  // =======================================================

  useEffect(() => {
    const userId = getCurrentUserId();
    setCurrentUserId(userId);
  }, []);

  // =======================================================
  // LOAD BOOKINGS
  // =======================================================

  const loadBookings = useCallback(async () => {
    const userId = getCurrentUserId();

    setCurrentUserId(userId);

    if (!userId) {
      setBookings([]);
      setError(
        "No current user found. Please select a user before viewing your trips."
      );
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/bookings/guest/${userId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail || "Failed to load your bookings."
        );
      }

      if (
        !data ||
        !Array.isArray(data.bookings)
      ) {
        throw new Error(
          "Invalid bookings response from the server."
        );
      }

      setBookings(data.bookings);
    } catch (err) {
      console.error("Failed to load trips:", err);

      setBookings([]);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading your trips."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // =======================================================
  // INITIAL FETCH
  // =======================================================

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
  };

  // =======================================================
  // FILTER BOOKINGS
  // =======================================================

  const filteredBookings = useMemo(() => {
    if (activeFilter === "upcoming") {
      return bookings.filter(isUpcomingBooking);
    }

    if (activeFilter === "past") {
      return bookings.filter(isPastBooking);
    }

    return bookings;
  }, [bookings, activeFilter]);

  const upcomingCount = useMemo(
    () =>
      bookings.filter(isUpcomingBooking).length,
    [bookings]
  );

  const pastCount = useMemo(
    () => bookings.filter(isPastBooking).length,
    [bookings]
  );

  // =======================================================
  // BOOKING CARD
  // =======================================================

  const renderBookingCard = (booking: Booking) => {
    const past = isPastBooking(booking);

    return (
      <article
        key={booking.id}
        style={{
          border: "1px solid #ddd",
          borderRadius: "16px",
          overflow: "hidden",
          background: "#fff",
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            padding: "22px",
          }}
        >
          {/* TITLE + STATUS */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "22px",
                  lineHeight: 1.3,
                }}
              >
                {booking.listing?.title ||
                  "Unnamed listing"}
              </h2>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color: "#777",
                  fontSize: "14px",
                }}
              >
                Booking #{booking.id}
              </p>
            </div>

            <span
              className={getBookingStatusClass(
                booking.status
              )}
              style={{
                display: "inline-block",
                padding: "7px 12px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "capitalize",
                background:
                  booking.status.toLowerCase() ===
                  "confirmed"
                    ? "#e8f7ed"
                    : booking.status.toLowerCase() ===
                        "cancelled" ||
                      booking.status.toLowerCase() ===
                        "canceled"
                      ? "#ffe8e8"
                      : "#f1f1f1",
                color:
                  booking.status.toLowerCase() ===
                  "confirmed"
                    ? "#087f3e"
                    : booking.status.toLowerCase() ===
                        "cancelled" ||
                      booking.status.toLowerCase() ===
                        "canceled"
                      ? "#c62828"
                      : "#555",
              }}
            >
              {booking.status}
            </span>
          </div>

          {/* DATES */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "15px",
              marginBottom: "18px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#777",
                  marginBottom: "5px",
                }}
              >
                CHECK-IN
              </div>

              <div
                style={{
                  fontWeight: 600,
                }}
              >
                {formatDate(
                  booking.check_in
                )}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#777",
                  marginBottom: "5px",
                }}
              >
                CHECK-OUT
              </div>

              <div
                style={{
                  fontWeight: 600,
                }}
              >
                {formatDate(
                  booking.check_out
                )}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#777",
                  marginBottom: "5px",
                }}
              >
                GUESTS
              </div>

              <div
                style={{
                  fontWeight: 600,
                }}
              >
                {booking.guests}{" "}
                {booking.guests === 1
                  ? "guest"
                  : "guests"}
              </div>
            </div>
          </div>

          {/* PRICE */}

          <div
            style={{
              borderTop:
                "1px solid #eee",
              paddingTop: "16px",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <span
                style={{
                  color: "#777",
                  fontSize: "14px",
                }}
              >
                Total price
              </span>

              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  marginTop: "3px",
                }}
              >
                ₹
                {formatPrice(
                  booking.total_price
                )}
              </div>
            </div>

            {/* VIEW LISTING */}

            {booking.listing?.id && (
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/listing/${booking.listing.id}`
                  )
                }
                style={{
                  border: "1px solid #222",
                  background: "#fff",
                  color: "#222",
                  borderRadius: "8px",
                  padding:
                    "10px 16px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                View listing
              </button>
            )}
          </div>

          {/* PAST LABEL */}

          {past && (
            <div
              style={{
                marginTop: "15px",
                color: "#777",
                fontSize: "13px",
              }}
            >
              ✓ This stay has ended.
            </div>
          )}
        </div>
      </article>
    );
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "45px 20px",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            marginBottom: "10px",
          }}
        >
          Your trips
        </h1>

        <p
          style={{
            color: "#666",
            fontSize: "18px",
          }}
        >
          Loading your bookings...
        </p>
      </main>
    );
  }

  // =======================================================
  // MAIN UI
  // =======================================================

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "45px 20px 70px",
      }}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "42px",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Your trips
          </h1>

          <p
            style={{
              color: "#666",
              fontSize: "18px",
              marginTop: "10px",
            }}
          >
            View and manage your
            upcoming and past stays.
          </p>

          {currentUserId && (
            <p
              style={{
                color: "#888",
                fontSize: "13px",
                marginTop: "8px",
              }}
            >
              Current guest: User #
              {currentUserId}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            border: "1px solid #ccc",
            background: "#fff",
            borderRadius: "9px",
            padding: "11px 18px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: refreshing
              ? "not-allowed"
              : "pointer",
          }}
        >
          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div
          role="alert"
          style={{
            border: "1px solid #f3b4b4",
            background: "#fff0f0",
            color: "#c62828",
            borderRadius: "12px",
            padding: "18px",
            marginBottom: "30px",
          }}
        >
          <strong>
            Something went wrong
          </strong>

          <div
            style={{
              marginTop: "5px",
            }}
          >
            {error}
          </div>
        </div>
      )}

      {/* ===================================================
          FILTER TABS
      =================================================== */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() =>
            setActiveFilter("all")
          }
          style={{
            border:
              activeFilter === "all"
                ? "1px solid #222"
                : "1px solid #ddd",
            background:
              activeFilter === "all"
                ? "#222"
                : "#fff",
            color:
              activeFilter === "all"
                ? "#fff"
                : "#222",
            borderRadius: "999px",
            padding: "10px 17px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          All ({bookings.length})
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveFilter("upcoming")
          }
          style={{
            border:
              activeFilter ===
              "upcoming"
                ? "1px solid #222"
                : "1px solid #ddd",
            background:
              activeFilter ===
              "upcoming"
                ? "#222"
                : "#fff",
            color:
              activeFilter ===
              "upcoming"
                ? "#fff"
                : "#222",
            borderRadius: "999px",
            padding: "10px 17px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Upcoming ({upcomingCount})
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveFilter("past")
          }
          style={{
            border:
              activeFilter === "past"
                ? "1px solid #222"
                : "1px solid #ddd",
            background:
              activeFilter === "past"
                ? "#222"
                : "#fff",
            color:
              activeFilter === "past"
                ? "#fff"
                : "#222",
            borderRadius: "999px",
            padding: "10px 17px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Past ({pastCount})
        </button>
      </div>

      {/* ===================================================
          NO BOOKINGS
      =================================================== */}

      {filteredBookings.length === 0 ? (
        <section
          style={{
            textAlign: "center",
            padding: "80px 20px",
            borderRadius: "18px",
            background: "#fafafa",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "#f1f1f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 25px",
              fontSize: "38px",
            }}
          >
            📅
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: "30px",
            }}
          >
            {activeFilter ===
            "upcoming"
              ? "No upcoming trips"
              : activeFilter === "past"
                ? "No past trips"
                : "No trips yet"}
          </h2>

          <p
            style={{
              color: "#666",
              fontSize: "17px",
              margin:
                "12px auto 25px",
              maxWidth: "500px",
              lineHeight: 1.5,
            }}
          >
            {activeFilter ===
            "upcoming"
              ? "Your upcoming stays will appear here."
              : activeFilter === "past"
                ? "Your completed stays will appear here."
                : "Once you book a stay, your trips will appear here."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            style={{
              border: "none",
              background: "#222",
              color: "#fff",
              borderRadius: "9px",
              padding: "13px 22px",
              fontWeight: 700,
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            Explore stays →
          </button>
        </section>
      ) : (
        /* =================================================
           BOOKINGS
        ================================================= */

        <section
          style={{
            display: "grid",
            gap: "18px",
          }}
        >
          {filteredBookings.map(
            renderBookingCard
          )}
        </section>
      )}
    </main>
  );
}