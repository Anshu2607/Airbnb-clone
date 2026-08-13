"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Menu,
  UserCircle,
  Heart,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

type ListingImage = {
  id: number;
  image_url: string;
};

type Amenity = {
  id: number;
  name: string;
};

type Host = {
  id: number;
  name: string;
  avatar?: string;
};

type Listing = {
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
  images: ListingImage[];
  amenities: Amenity[];
};

type ListingResponse = {
  listings: Listing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

const categories = [
  { name: "All", icon: "🏠" },
  { name: "Beach", icon: "🏖️" },
  { name: "Villa", icon: "🏡" },
  { name: "Cabin", icon: "🛖" },
  { name: "Apartment", icon: "🏢" },
  { name: "House", icon: "🏠" },
  { name: "Pool", icon: "🏊" },
  { name: "Luxury", icon: "✨" },
];

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     SEARCH INPUTS
  ========================= */

  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");

  /* =========================
     APPLIED SEARCH
  ========================= */

  const [searchLocation, setSearchLocation] =
    useState("");

  const [searchGuests, setSearchGuests] =
    useState("");

  const [propertyType, setPropertyType] =
    useState("");
const [minPrice, setMinPrice] = useState("");
const [maxPrice, setMaxPrice] = useState("");
const [minGuests, setMinGuests] = useState("");
  /* =========================
     PAGINATION
  ========================= */

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] =
    useState(1);

  /* =========================
     CATEGORY
  ========================= */

  const [activeCategory, setActiveCategory] =
    useState("All");

  /* =========================
     FAVORITES
  ========================= */

  const [favorites, setFavorites] =
    useState<number[]>([]);
    useEffect(() => {
  try {
    const savedFavorites =
      localStorage.getItem("airbnb_wishlist");

    if (savedFavorites) {
      setFavorites(
        JSON.parse(savedFavorites)
      );
    }
  } catch (error) {
    console.error(
      "Failed to load wishlist:",
      error
    );
  }
}, []);

  /* =========================
     LOAD LISTINGS
  ========================= */

  useEffect(() => {
    let cancelled = false;

    const loadListings = async () => {
      try {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams();

        if (searchLocation.trim()) {
          params.append(
            "location",
            searchLocation.trim()
          );
        }

        if (searchGuests) {
          params.append(
            "guests",
            searchGuests
          );
        }

        if (propertyType) {
          params.append(
            "property_type",
            propertyType
          );
        }
        if (minPrice) {
  params.append("min_price", minPrice);
}

if (maxPrice) {
  params.append("max_price", maxPrice);
}

if (minGuests) {
  params.append("guests", minGuests);
}

        params.append(
          "page",
          page.toString()
        );

        params.append(
          "limit",
          "12"
        );

        const url =
          `${API_URL}/api/listings/?${params.toString()}`;

        console.log(
          "Fetching listings:",
          url
        );

        const response =
          await fetch(url);

        if (!response.ok) {
          const text =
            await response.text();

          throw new Error(
            text ||
              `Failed to fetch listings (${response.status})`
          );
        }

        const data: ListingResponse =
          await response.json();

        if (!cancelled) {
          setListings(
            data.listings || []
          );

          setTotalPages(
            data.pagination
              ?.total_pages || 1
          );
        }
      } catch (err) {
        console.error(
          "Error fetching listings:",
          err
        );

        if (!cancelled) {
          setListings([]);

          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch listings"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadListings();

    return () => {
      cancelled = true;
    };
  }, [
    page,
  searchLocation,
  searchGuests,
  propertyType,
  minPrice,
  maxPrice,
  minGuests,
  ]);

  /* =========================
     SEARCH
  ========================= */

  const handleSearch = () => {
    setError("");

    /*
     * Apply the current search inputs.
     */

    setSearchLocation(
      location.trim()
    );

    setSearchGuests(
      guests
    );

    /*
     * Always return to page 1.
     */

    setPage(1);
  };

  /* =========================
     ENTER KEY SEARCH
  ========================= */

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();

      handleSearch();
    }
  };

  /* =========================
     CATEGORY
  ========================= */

  const handleCategoryClick = (
    category: string
  ) => {
    setActiveCategory(category);

    if (category === "All") {
      setPropertyType("");
      setSearchLocation("");
      setSearchGuests("");
      setLocation("");
      setGuests("");
      setPage(1);

      return;
    }

    if (category === "Beach") {
      setPropertyType("");
      setLocation("Goa");
      setSearchLocation("Goa");
      setSearchGuests("");
      setGuests("");
      setPage(1);

      return;
    }

    if (
      category === "Villa" ||
      category === "Cabin" ||
      category === "Apartment" ||
      category === "House"
    ) {
      setPropertyType(category);
      setSearchLocation("");
      setSearchGuests("");
      setLocation("");
      setGuests("");
      setPage(1);

      return;
    }

    if (category === "Pool") {
      setPropertyType("");
      setSearchLocation("");
      setSearchGuests("");
      setLocation("");
      setGuests("");
      setPage(1);

      return;
    }

    if (category === "Luxury") {
      setPropertyType("");
      setSearchLocation("");
      setSearchGuests("");
      setLocation("");
      setGuests("");
      setPage(1);

      return;
    }

    setPropertyType("");
    setSearchLocation("");
    setSearchGuests("");
    setPage(1);
  };

  /* =========================
     FAVORITE
  ========================= */

  const toggleFavorite = (id: number) => {
  setFavorites((current) => {
    let updatedFavorites: number[];

    if (current.includes(id)) {
      updatedFavorites = current.filter(
        (favoriteId) => favoriteId !== id
      );
    } else {
      updatedFavorites = [
        ...current,
        id,
      ];
    }

    try {
      localStorage.setItem(
        "airbnb_wishlist",
        JSON.stringify(updatedFavorites)
      );
    } catch (error) {
      console.error(
        "Failed to save wishlist:",
        error
      );
    }

    return updatedFavorites;
  });
};

  /* =========================
     PRICE
  ========================= */

  const formatPrice = (
    price: number
  ) => {
    return new Intl.NumberFormat(
      "en-IN"
    ).format(price);
  };

  /* =========================
     CLEAR SEARCH
  ========================= */

  const clearSearch = () => {
    setLocation("");
    setCheckIn("");
    setCheckOut("");
    setGuests("");

    setSearchLocation("");
    setSearchGuests("");

    setPropertyType("");
    setActiveCategory("All");

    setPage(1);
  };

  return (
    <main className="airbnb-page">

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="navbar">

        <Link
          href="/"
          className="logo"
        >
          airbnb
        </Link>

        <div className="nav-center">

          <button
            className="nav-active"
            type="button"
          >
            Stays
          </button>

          <button
            type="button"
          >
            Experiences
          </button>

        </div>

        <div className="nav-right">

          <Link
            href="/host"
            className="host-button"
          >
            Airbnb your home
          </Link>

          <button
            className="profile-menu"
            type="button"
          >
            <Menu size={20} />

            <UserCircle
              size={28}
            />
          </button>

        </div>

      </header>

      {/* =========================
          SEARCH BAR
      ========================= */}

      <section className="search-section">

        <div className="search-bar">

          {/* WHERE */}

          <div className="search-field">

            <span>
              Where
            </span>

            <input
              type="text"
              placeholder="Search destinations"
              value={location}
              onChange={(event) => {
                setLocation(
                  event.target.value
                );
              }}
              onKeyDown={
                handleSearchKeyDown
              }
            />

          </div>

          <div className="search-divider" />

          {/* CHECK IN */}

          <div className="search-field">

            <span>
              Check in
            </span>

            <input
              type="date"
              value={checkIn}
              min={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              onChange={(event) => {
                setCheckIn(
                  event.target.value
                );
              }}
            />

          </div>

          <div className="search-divider" />

          {/* CHECK OUT */}

          <div className="search-field">

            <span>
              Check out
            </span>

            <input
              type="date"
              value={checkOut}
              min={
                checkIn ||
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              onChange={(event) => {
                setCheckOut(
                  event.target.value
                );
              }}
            />

          </div>

          <div className="search-divider" />

          {/* WHO */}

          <div className="search-field guests-field">

            <span>
              Who
            </span>

            <input
              type="number"
              min="1"
              placeholder="Add guests"
              value={guests}
              onChange={(event) => {
                setGuests(
                  event.target.value
                );
              }}
              onKeyDown={
                handleSearchKeyDown
              }
            />

          </div>

          {/* SEARCH BUTTON */}

          <button
            className="search-button"
            type="button"
            onClick={
              handleSearch
            }
            aria-label="Search"
            disabled={loading}
          >
            <Search
              size={20}
            />
          </button>

        </div>

      </section>

      {/* =========================
          CATEGORIES
      ========================= */}

      <section className="category-section">

        <div className="categories">

          {categories.map(
            (category) => (
              <button
                key={
                  category.name
                }
                type="button"
                className={`category ${
                  activeCategory ===
                  category.name
                    ? "category-active"
                    : ""
                }`}
                onClick={() =>
                  handleCategoryClick(
                    category.name
                  )
                }
              >

                <span className="category-icon">
                  {category.icon}
                </span>

                <span>
                  {category.name}
                </span>

              </button>
            )
          )}

        </div>

        {/* FILTER */}

        <button
          className="filter-button"
          type="button"
          onClick={() => {

            const type =
              window.prompt(
                "Enter property type: Apartment, Villa, Cabin, House"
              );

            if (!type) {
              return;
            }

            setPropertyType(
              type.trim()
            );

            setPage(1);

          }}
        >

          <SlidersHorizontal
            size={16}
          />

          Filters

        </button>

      </section>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <section
          style={{
            maxWidth: "1200px",
            margin: "20px auto",
            padding: "0 20px",
          }}
        >

          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              background: "#fff0f2",
              color: "#c2183a",
              border:
                "1px solid #ffd0d8",
            }}
          >

            <strong>
              Search failed
            </strong>

            <p
              style={{
                margin:
                  "6px 0 10px",
              }}
            >
              {error}
            </p>

            <button
              type="button"
              onClick={
                clearSearch
              }
              style={{
                padding:
                  "8px 14px",
                borderRadius:
                  "8px",
                border:
                  "1px solid #ccc",
                background:
                  "white",
                cursor:
                  "pointer",
              }}
            >
              Clear search
            </button>

          </div>

        </section>
      )}

      {/* =========================
          LISTINGS
      ========================= */}

      <section className="listings-section">

        {loading ? (

          <div className="loading">

            <div className="spinner" />

            <p>
              Loading stays...
            </p>

          </div>

        ) : listings.length === 0 ? (

          <div className="empty-state">

            <h2>
              No stays found
            </h2>

            <p>
              Try changing your
              search or removing
              some filters.
            </p>

            <button
              type="button"
              onClick={
                clearSearch
              }
            >
              Clear filters
            </button>

          </div>

        ) : (

          <>

            <div className="listing-grid">

              {listings.map(
                (listing) => (

                  <Link
                    href={`/listing/${listing.id}`}
                    className="listing-card"
                    key={listing.id}
                  >

                    {/* IMAGE */}

                    <div className="image-container">

                      <img
                        src={
                          listing
                            .images?.[0]
                            ?.image_url ||
                          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"
                        }
                        alt={
                          listing.title
                        }
                      />

                      {/* FAVORITE */}

                      <button
                        type="button"
                        className={`favorite-button ${
                          favorites.includes(
                            listing.id
                          )
                            ? "favorite-active"
                            : ""
                        }`}
                        onClick={(
                          event
                        ) => {

                          event.preventDefault();

                          event.stopPropagation();

                          toggleFavorite(
                            listing.id
                          );

                        }}
                        aria-label="Add to favorites"
                      >

                        <Heart
                          size={23}
                          fill={
                            favorites.includes(
                              listing.id
                            )
                              ? "currentColor"
                              : "none"
                          }
                        />

                      </button>

                      {/* GUEST FAVORITE */}

                      {listing.rating >=
                        4.9 && (
                        <span className="guest-favorite">
                          Guest favorite
                        </span>
                      )}

                      {/* NEXT IMAGE */}

                      {listing.images &&
                        listing.images
                          .length > 1 && (

                        <button
                          type="button"
                          className="image-next"
                          aria-label="Next image"
                          onClick={(
                            event
                          ) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                        >
                          <ChevronRight
                            size={16}
                          />
                        </button>

                      )}

                    </div>

                    {/* INFORMATION */}

                    <div className="listing-info">

                      <div className="listing-title-row">

                        <h3>
                          {listing.city}
                        </h3>

                        <span className="rating">
                          ★{" "}
                          {listing.rating}
                        </span>

                      </div>

                      <p className="listing-name">
                        {
                          listing.title
                        }
                      </p>

                      <p className="listing-property">
                        {
                          listing.property_type
                        }{" "}
                        ·{" "}
                        {
                          listing.max_guests
                        }{" "}
                        guests
                      </p>

                      <p className="listing-price">

                        <strong>
                          ₹
                          {formatPrice(
                            listing.price_per_night
                          )}
                        </strong>{" "}
                        night

                      </p>

                    </div>

                  </Link>

                )
              )}

            </div>

            {/* =========================
                PAGINATION
            ========================= */}

            {totalPages > 1 && (

              <div className="pagination">

                <button
                  type="button"
                  disabled={
                    page === 1
                  }
                  onClick={() => {
                    setPage(
                      (current) =>
                        current - 1
                    );
                  }}
                  aria-label="Previous page"
                >
                  <ChevronLeft
                    size={18}
                  />
                </button>

                <span>
                  Page {page} of{" "}
                  {totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    page ===
                    totalPages
                  }
                  onClick={() => {
                    setPage(
                      (current) =>
                        current + 1
                    );
                  }}
                  aria-label="Next page"
                >
                  <ChevronRight
                    size={18}
                  />
                </button>

              </div>

            )}

          </>

        )}

      </section>

    </main>
  );
}