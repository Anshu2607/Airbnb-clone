# Airbnb Clone

[🚀 Live Demo](https://airbnb-clone-nine-livid.vercel.app/)

A full-stack Airbnb-inspired accommodation booking platform built with **Next.js**, **React/TypeScript**, **FastAPI**, **Pydantic**, **SQLAlchemy**, and a relational database.

The application is designed as a practical full-stack project covering property discovery, listing details, reviews, reservations, trips, host bookings, search/filtering, wishlist functionality, user handling, and a responsive Airbnb-inspired UI.

> **Status:** Core listing, review, booking, trips, and host-booking functionality has been developed and API-tested during the project. Some authentication, wishlist, gallery, and final UI/testing work may still require refinement depending on the current source code.

---

## Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Backend](#backend)
6. [Frontend](#frontend)
7. [Database Design](#database-design)
8. [API Endpoints](#api-endpoints)
9. [Listing Flow](#listing-flow)
10. [Review Flow](#review-flow)
11. [Booking Flow](#booking-flow)
12. [Trips / My Bookings](#trips--my-bookings)
13. [Host Bookings](#host-bookings)
14. [Search and Filters](#search-and-filters)
15. [Wishlist](#wishlist)
16. [Authentication and User Handling](#authentication-and-user-handling)
17. [Images and Gallery](#images-and-gallery)
18. [Environment Variables](#environment-variables)
19. [Installation](#installation)
20. [Running the Project](#running-the-project)
21. [API Testing](#api-testing)
22. [Common Issues](#common-issues)
23. [Recommended Testing Order](#recommended-testing-order)
24. [Development Workflow](#development-workflow)
25. [Future Improvements](#future-improvements)
26. [Security](#security)
27. [Project Roadmap](#project-roadmap)
28. [License](#license)

---

# Features

## Guest Features

- Browse accommodation listings
- View listing cards
- View detailed listing pages
- View property title and description
- View location
- View city and country
- View property type
- View price per night
- View maximum guest capacity
- View property rating
- View property images
- View amenities
- View host information
- Search listings by location
- Select check-in and check-out dates
- Select number of guests
- Filter by property type
- Filter by minimum/maximum price
- Filter by minimum guest capacity
- Filter by category
- Pagination
- Reserve a property
- View trips/bookings
- Submit reviews after a completed stay
- View reviews for a listing
- Wishlist support

## Host Features

- Host/property association
- View bookings for hosted properties
- View guest details
- View booking dates
- View guest count
- View total booking amount
- View booking status

## Backend Features

- REST API using FastAPI
- Pydantic request validation
- SQLAlchemy ORM
- Relational database models
- Listing management
- Booking management
- Booking conflict detection
- Guest booking lookup
- Host booking lookup
- Review eligibility validation
- Duplicate-review prevention
- Automatic listing rating recalculation
- CORS support
- HTTP error handling

---

# Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| Next.js 16 | React framework and routing |
| React | User interface |
| TypeScript | Type-safe frontend |
| CSS | Styling |
| App Router | File-based routing |
| Fetch API | Backend communication |
| Turbopack | Development bundler |

## Backend

| Technology | Purpose |
|---|---|
| Python | Backend language |
| FastAPI | REST API framework |
| Pydantic | Request/data validation |
| SQLAlchemy | ORM |
| Uvicorn | ASGI development server |
| Virtualenv | Python dependency isolation |

## Database

The project uses SQLAlchemy and can be configured with a relational database such as:

- SQLite for local development
- PostgreSQL for a production-oriented setup

---

# Architecture

The application follows a client-server architecture:

```text
┌─────────────────────────┐
│        Browser          │
│    localhost:3000       │
└────────────┬────────────┘
             │
             │ HTTP / Fetch
             ▼
┌─────────────────────────┐
│       Next.js           │
│        Frontend         │
└────────────┬────────────┘
             │
             │ REST API
             ▼
┌─────────────────────────┐
│        FastAPI          │
│        Backend          │
│     127.0.0.1:8000     │
└────────────┬────────────┘
             │
             │ SQLAlchemy
             ▼
┌─────────────────────────┐
│       Database          │
│   SQLite / PostgreSQL   │
└─────────────────────────┘
```

The main responsibility of each layer is:

### Frontend

Handles:

- Pages
- Components
- Forms
- Search
- Filters
- User interactions
- API requests
- Loading/error states

### Backend

Handles:

- API endpoints
- Validation
- Business rules
- Booking availability
- Reviews
- User/listing relationships
- Database operations

### Database

Stores:

- Users
- Listings
- Bookings
- Reviews
- Images
- Amenities
- Relationships between entities

---

# Project Structure

A representative structure is:

```text
airbnb-clone/
│
├── backend/
│   │
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── database/
│   │   │   ├── database.py
│   │   │   └── models.py
│   │   │
│   │   └── routes/
│   │       ├── listings.py
│   │       ├── bookings.py
│   │       ├── reviews.py
│   │       └── users.py
│   │
│   ├── venv/
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   │
│   ├── app/
│   │   ├── page.tsx
│   │   ├── listing/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── trips/
│   │   │   └── page.tsx
│   │   └── ...
│   │
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   └── ...
│
└── README.md
```

The exact structure may change as new features are added.

---

# Backend

The backend is organized as a FastAPI application.

Main entry point:

```text
backend/app/main.py
```

The application registers route modules for the main resources.

## Listings Route

```text
backend/app/routes/listings.py
```

Responsible for:

- Listing retrieval
- Listing details
- Search
- Filtering
- Pagination
- Listing-related data

## Bookings Route

```text
backend/app/routes/bookings.py
```

Responsible for:

- Creating bookings
- Availability checks
- Booking conflict detection
- Guest bookings
- Host bookings
- Booking status

## Reviews Route

```text
backend/app/routes/reviews.py
```

Responsible for:

- Creating reviews
- Checking whether a user completed a stay
- Preventing duplicate reviews
- Retrieving listing reviews
- Recalculating listing ratings

## Users Route

```text
backend/app/routes/users.py
```

Responsible for user-related operations.

---

# Frontend

The frontend uses the Next.js App Router.

## Home Page

```text
frontend/app/page.tsx
```

The home page handles:

- Listing retrieval
- Listing cards
- Search
- Categories
- Filters
- Pagination
- Navigation to listing details

The frontend communicates with FastAPI using the browser `fetch()` API.

Example backend base URL:

```text
http://127.0.0.1:8000
```

## Listing Detail Page

```text
frontend/app/listing/[id]/page.tsx
```

Dynamic routes allow URLs such as:

```text
/listing/3
/listing/4
/listing/10
```

The listing detail page can display:

- Title
- Location
- Rating
- Description
- Property type
- Images
- Amenities
- Host
- Price
- Check-in
- Check-out
- Guests
- Reviews
- Reservation form

## Trips Page

```text
frontend/app/trips/page.tsx
```

The Trips page retrieves and displays bookings belonging to the current guest.

Typical information:

- Listing
- Check-in
- Check-out
- Guests
- Total price
- Status

---

# Database Design

The main entities are:

```text
User
Listing
Booking
Review
Image
Amenity
```

## User

Represents a guest or host.

Typical fields:

```text
id
name
email
avatar
```

## Listing

Represents an accommodation.

Typical fields:

```text
id
title
description
location
city
country
price_per_night
property_type
max_guests
rating
host_id
```

A listing can be related to:

- One host
- Multiple images
- Multiple amenities
- Multiple bookings
- Multiple reviews

## Booking

Represents a reservation.

Typical fields:

```text
id
listing_id
guest_id
check_in
check_out
guests
total_price
status
```

## Review

Represents feedback submitted by a guest.

Typical fields:

```text
id
listing_id
user_id
rating
comment
created_at
```

---

# API Endpoints

The backend uses an `/api` prefix.

## Listings

### Get Listings

```http
GET /api/listings/
```

Example:

```http
GET /api/listings/?page=1&limit=12
```

### Get Listing Details

```http
GET /api/listings/{listing_id}
```

Example:

```http
GET /api/listings/3
```

---

# Reviews API

## Create Review

```http
POST /api/reviews/
```

Example:

```json
{
  "listing_id": 3,
  "user_id": 4,
  "rating": 4.5,
  "comment": "Beautiful property and a comfortable stay."
}
```

The backend verifies:

1. Listing exists
2. User exists
3. User has a confirmed booking
4. Checkout date has passed
5. User has not already reviewed the listing

If the user has not completed a stay, the API returns an error similar to:

```json
{
  "detail": "You can review a listing only after completing a stay"
}
```

If the user already reviewed the listing:

```json
{
  "detail": "You have already reviewed this listing"
}
```

## Get Reviews for a Listing

```http
GET /api/reviews/listing/{listing_id}
```

Example:

```http
GET /api/reviews/listing/3
```

Example response:

```json
{
  "listing_id": 3,
  "rating": 4.79,
  "total_reviews": 2,
  "reviews": []
}
```

Each review contains rating, comment, creation time, and user information.

---

# Booking Flow

The booking process is:

```text
User opens listing
       │
       ▼
Select check-in
       │
       ▼
Select check-out
       │
       ▼
Select guests
       │
       ▼
Calculate total
       │
       ▼
POST /api/bookings/
       │
       ▼
Check availability
       │
       ├── Conflict ──► 400 Bad Request
       │
       ▼
Create booking
       │
       ▼
Confirmed booking
       │
       ▼
Appears in Trips
```

## Booking Request

Example:

```json
{
  "listing_id": 3,
  "guest_id": 1,
  "check_in": "2026-09-01",
  "check_out": "2026-09-03",
  "guests": 2,
  "total_price": 13000
}
```

---

# Booking Conflict Detection

The backend prevents overlapping bookings for the same listing.

For example, if a listing already has:

```text
Check-in: 2026-08-20
Check-out: 2026-08-26
```

another overlapping reservation should be rejected.

Typical response:

```json
{
  "detail": "Listing is already booked for the selected dates"
}
```

This is important because the frontend cannot be trusted to enforce availability by itself. The final availability check must happen on the backend.

---

# Trips / My Bookings

Guest bookings are retrieved through:

```http
GET /api/bookings/guest/{guest_id}
```

Example:

```http
GET /api/bookings/guest/1
```

Example response:

```json
{
  "bookings": [],
  "total": 0
}
```

The Trips page uses this information to display the user's stays.

A complete Trips UI can separate:

- Upcoming trips
- Past trips
- Cancelled bookings

based on the returned dates/status.

---

# Host Bookings

Hosts can retrieve bookings for their properties:

```http
GET /api/bookings/host/{host_id}
```

Example:

```http
GET /api/bookings/host/3
```

Example response structure:

```json
{
  "bookings": [
    {
      "id": 8,
      "check_in": "2026-10-01",
      "check_out": "2026-10-03",
      "guests": 2,
      "total_price": 13000,
      "status": "confirmed",
      "listing": {
        "id": 3,
        "title": "Mountain Cabin in Manali"
      },
      "guest": {
        "id": 4,
        "name": "Ananya Singh",
        "email": "ananya@example.com",
        "avatar": "https://..."
      }
    }
  ]
}
```

This allows a host interface to display:

- Guest
- Guest email
- Listing
- Dates
- Guest count
- Total amount
- Booking status

---

# Search and Filters

The home page supports search/filter state such as:

```text
Location
Check-in
Check-out
Guests
Property Type
Minimum Price
Maximum Price
Minimum Guests
Category
```

A clear-search operation should reset these values and return pagination to page 1.

Conceptually:

```text
Clear Search
     │
     ├── location reset
     ├── dates reset
     ├── guests reset
     ├── property type reset
     ├── price filters reset
     ├── guest filter reset
     ├── category reset
     └── page = 1
```

---

# Wishlist

Wishlist functionality is intended to allow users to:

- Add a listing
- Remove a listing
- View saved listings
- Persist saved listings

Typical UI:

```text
Listing Card
     │
     ▼
   Heart
     │
     ├── Not saved → Add
     │
     └── Saved     → Remove
```

The exact wishlist endpoint names should match the current backend implementation.

---

# Authentication and User Handling

The current project associates operations with user IDs, for example:

```text
guest_id
user_id
host_id
```

A production-ready version should replace manually supplied IDs with authenticated user context.

Recommended flow:

```text
Login
  │
  ▼
Authentication
  │
  ▼
JWT / Session
  │
  ▼
Current User
  │
  ├── Trips
  ├── Bookings
  ├── Reviews
  └── Wishlist
```

This prevents a client from simply submitting another user's ID.

---

# Images and Gallery

Listing images are represented as objects.

Example:

```json
{
  "id": 7,
  "image_url": "https://images.unsplash.com/..."
}
```

The frontend must use the URL field:

```ts
image.image_url
```

rather than passing the entire object as an image URL.

Incorrect handling can result in:

```text
[object Object]
```

appearing in a generated URL.

The listing page can use the image collection to implement:

- Main image
- Thumbnails
- Gallery
- Image navigation
- Responsive image display

---

# Environment Variables

The frontend can use:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Then:

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;
```

Do not commit passwords, database credentials, JWT secrets, API keys, or other private values to Git.

---

# Installation

## Prerequisites

Install:

- Python 3.10+
- Node.js
- npm
- Git
- SQLite or PostgreSQL, depending on database configuration

Check versions:

```powershell
python --version
node --version
npm --version
```

---

# Backend Installation

Navigate to the backend:

```powershell
cd backend
```

Create a virtual environment:

```powershell
python -m venv venv
```

Activate on Windows:

```powershell
.env\Scriptsctivate
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

If the project uses Pydantic `EmailStr`, install:

```powershell
pip install email-validator
```

---

# Frontend Installation

Navigate to the frontend:

```powershell
cd frontend
```

Install packages:

```powershell
npm install
```

---

# Running the Project

Two terminals are recommended.

## Terminal 1 — Backend

```powershell
cd "C:\Users\anshu priya\Desktop\airbnb-clone\backend"
.env\Scripts\activate
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

## Terminal 2 — Frontend

```powershell
cd "C:\Users\anshu priya\Desktop\airbnb-clone\frontend"
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# API Testing

FastAPI automatically provides Swagger UI:

```text
http://127.0.0.1:8000/docs
```

Use Swagger to verify the backend before debugging the frontend.

## Listing Test

```http
GET /api/listings/
```

Expected:

```text
200 OK
```

## Listing Detail Test

```http
GET /api/listings/3
```

Expected:

```text
200 OK
```

if listing ID `3` exists.

## Guest Bookings

```http
GET /api/bookings/guest/1
```

## Host Bookings

```http
GET /api/bookings/host/3
```

## Reviews

```http
GET /api/reviews/listing/3
```

---

# Common Issues

## `Failed to fetch`

Frontend error:

```text
TypeError: Failed to fetch
```

Check:

1. Backend is running
2. API URL is correct
3. Port `8000` is available
4. CORS is configured
5. The requested endpoint exists

First test:

```text
http://127.0.0.1:8000/api/listings/
```

If the browser cannot open that endpoint, fix the backend before changing frontend code.

---

## `404 Not Found` for `/api/listings/`

If you see:

```text
GET /api/listings/ 404 Not Found
```

verify that the correct FastAPI application is running.

For this project, if the application entry point is:

```text
backend/app/main.py
```

start it with:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Do not use:

```powershell
uvicorn main:app --reload
```

unless the `main.py` in the current directory is actually the correct application entry point.

---

## `email_validator` Missing

Error:

```text
ModuleNotFoundError: No module named 'email_validator'
```

Fix:

```powershell
pip install email-validator
```

Restart Uvicorn afterward.

---

## Listing Not Found

If:

```http
GET /api/listings/2
```

returns:

```json
{
  "detail": "Listing not found"
}
```

check:

```http
GET /api/listings/
```

and verify which IDs actually exist.

For example, if the database contains:

```text
3
4
5
```

then requesting ID `2` correctly produces a 404.

---

## `[object Object]` Image URL

If the browser requests something like:

```text
/listing/[object%20Object]
```

an image object is being used where a string URL is required.

Given:

```json
{
  "id": 7,
  "image_url": "https://..."
}
```

use:

```ts
image.image_url
```

instead of:

```ts
image
```

---

## Trips Says No Current User

If Trips shows:

```text
No current user found.
Please select a user before viewing your trips.
```

the frontend does not currently have a valid current-user context.

The long-term solution is proper authentication and a current-user endpoint rather than manually selecting a user ID.

---

# Recommended Testing Order

Test the application in this order:

### 1. Listings

```text
GET /api/listings/
GET /api/listings/{id}
```

Verify:

- Listing data
- Pagination
- Filters
- Listing IDs

### 2. Listing Details

Verify:

- Title
- Location
- Description
- Price
- Rating
- Images
- Amenities
- Host

### 3. Reviews

Test:

```text
POST /api/reviews/
GET /api/reviews/listing/{id}
```

Verify:

- Completed-stay restriction
- Duplicate-review prevention
- Rating calculation
- Review display

### 4. Booking

Test:

```text
POST /api/bookings/
```

Verify:

- Valid dates
- Invalid dates
- Guest limits
- Overlapping bookings
- Total price
- Status

### 5. Trips

Test:

```text
GET /api/bookings/guest/{guest_id}
```

Verify that newly created bookings appear.

### 6. Host Bookings

Test:

```text
GET /api/bookings/host/{host_id}
```

Verify:

- Guest information
- Listing
- Dates
- Price
- Status

### 7. Filters

Test combinations of:

- Location
- Property type
- Price
- Guests
- Dates
- Category

### 8. Wishlist

Test:

- Add
- Remove
- Persistence
- UI state

### 9. Authentication

Test:

- Registration
- Login
- Current user
- Protected operations
- Logout

### 10. Final UI

Check:

- Responsive design
- Loading states
- Error states
- Empty states
- Images
- Navigation
- Forms
- Buttons
- Mobile layout

---

# Development Workflow

Recommended workflow:

```text
Start database
      │
      ▼
Start FastAPI
      │
      ▼
Test API in Swagger
      │
      ▼
Verify database data
      │
      ▼
Start Next.js
      │
      ▼
Test frontend
      │
      ▼
Check browser console
      │
      ▼
Check backend terminal
      │
      ▼
Fix API integration
      │
      ▼
Run complete user flow
```

When debugging, identify the failing layer:

```text
Database
   ↓
Backend API
   ↓
Frontend fetch()
   ↓
Frontend state
   ↓
UI
```

This avoids changing frontend code when the real problem is a backend route, database record, CORS configuration, or server process.

---

# Future Improvements

## Authentication

- JWT authentication
- Password hashing
- Login/logout
- Protected routes
- Current-user endpoint
- Role-based authorization

## Booking

- Booking cancellation
- Availability calendar
- Booking confirmation
- Payment integration
- Automatic status changes
- Email notifications

## Host Dashboard

- Create listing
- Edit listing
- Delete listing
- Upload images
- Manage amenities
- Booking analytics

## Reviews

- Edit review
- Delete review
- Rating breakdown
- Pagination
- Host responses

## Search

- Map-based search
- Distance filtering
- Availability-aware search
- Advanced sorting

## UI

- Responsive mobile navigation
- Skeleton loading
- Toast notifications
- Modal components
- Image lightbox
- Better error pages
- Improved accessibility

## Production

- PostgreSQL
- Docker
- CI/CD
- Cloud deployment
- HTTPS
- Structured logging
- Monitoring
- Rate limiting
- Automated tests

---

# Security

Before public deployment, implement:

- Password hashing
- JWT/session authentication
- Authorization checks
- Server-side ownership validation
- Secure CORS
- Rate limiting
- HTTPS
- Environment-based secrets
- Database credential protection
- Input validation

Sensitive operations must not trust a user-provided ID alone.

For example, instead of trusting:

```json
{
  "user_id": 1
}
```

the backend should determine the current user from an authenticated session/token.

---

# Project Roadmap

The project development plan is:

```text
1. 🔴 Fix listing detail API
2. 🔴 Fix reviews frontend
3. 🔴 Complete/test booking
4. 🟠 Trips / My Bookings
5. 🟠 Host Bookings
6. 🟠 Filters
7. 🟠 Wishlist
8. 🟡 Authentication / user handling
9. 🟡 Images / gallery
10. 🟢 Final UI + testing
```

The status should be updated as each feature is fully tested.

---

# Conclusion

This Airbnb Clone is a full-stack accommodation-booking project demonstrating practical implementation of:

- Next.js
- React
- TypeScript
- FastAPI
- Python
- Pydantic
- SQLAlchemy
- Relational databases
- REST APIs
- CRUD operations
- Dynamic routes
- Search and filtering
- Pagination
- Booking logic
- Date conflict detection
- Reviews
- Rating calculation
- Guest workflows
- Host workflows
- API/frontend integration
- Error handling
- Responsive UI

The project is structured so that the frontend is responsible for presentation and user interaction while the FastAPI backend handles validation, business logic, and persistence.

---

# License

This project is intended for educational and portfolio purposes.

This is an Airbnb-inspired project and is **not affiliated with, sponsored by, or endorsed by Airbnb, Inc.**
