from datetime import date, timedelta

from app.database.database import SessionLocal
from app.database.models import (
    Amenity,
    Booking,
    Listing,
    ListingImage,
    Review,
    User,
)


def seed_database():
    db = SessionLocal()

    try:
        # ---------------------------------------------------------
        # 1. Clear existing data
        # ---------------------------------------------------------

        db.query(Review).delete()
        db.query(Booking).delete()
        db.query(ListingImage).delete()
        db.query(Listing).delete()
        db.query(Amenity).delete()
        db.query(User).delete()

        db.commit()

        # ---------------------------------------------------------
        # 2. Create users
        # ---------------------------------------------------------

        hosts = [
            User(
                name="Aarav Sharma",
                email="aarav@example.com",
                role="host",
                avatar="https://i.pravatar.cc/150?img=12",
            ),
            User(
                name="Priya Mehta",
                email="priya@example.com",
                role="host",
                avatar="https://i.pravatar.cc/150?img=32",
            ),
            User(
                name="Rohan Kapoor",
                email="rohan@example.com",
                role="host",
                avatar="https://i.pravatar.cc/150?img=56",
            ),
        ]

        guests = [
            User(
                name="Ananya Singh",
                email="ananya@example.com",
                role="guest",
                avatar="https://i.pravatar.cc/150?img=44",
            ),
            User(
                name="Kabir Verma",
                email="kabir@example.com",
                role="guest",
                avatar="https://i.pravatar.cc/150?img=68",
            ),
        ]

        db.add_all(hosts)
        db.add_all(guests)

        db.commit()

        for user in hosts + guests:
            db.refresh(user)

        # ---------------------------------------------------------
        # 3. Create amenities
        # ---------------------------------------------------------

        amenity_names = [
            "WiFi",
            "Kitchen",
            "Pool",
            "Free parking",
            "Air conditioning",
            "TV",
            "Washer",
            "Workspace",
            "Hot tub",
            "Breakfast",
        ]

        amenities = [
            Amenity(name=name)
            for name in amenity_names
        ]

        db.add_all(amenities)
        db.commit()

        for amenity in amenities:
            db.refresh(amenity)

        amenity_map = {
            amenity.name: amenity
            for amenity in amenities
        }

        # ---------------------------------------------------------
        # 4. Listing data
        # ---------------------------------------------------------

        listing_data = [
            {
                "host": hosts[0],
                "title": "Luxury Apartment in Central Paris",
                "description": (
                    "A beautiful modern apartment in the heart of Paris "
                    "with stunning city views and stylish interiors."
                ),
                "location": "Paris, France",
                "city": "Paris",
                "country": "France",
                "price": 18500,
                "property_type": "Apartment",
                "max_guests": 4,
                "rating": 4.92,
                "images": [
                    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
                    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
                    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
                ],
                "amenities": [
                    "WiFi",
                    "Kitchen",
                    "Air conditioning",
                    "TV",
                    "Workspace",
                ],
            },
            {
                "host": hosts[1],
                "title": "Beachfront Villa in Goa",
                "description": (
                    "Relax in this spacious beachfront villa with a "
                    "private pool and breathtaking ocean views."
                ),
                "location": "Goa, India",
                "city": "Goa",
                "country": "India",
                "price": 12500,
                "property_type": "Villa",
                "max_guests": 8,
                "rating": 4.88,
                "images": [
                    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
                    "https://images.unsplash.com/photo-1600607688969-a5bfcd646154",
                ],
                "amenities": [
                    "WiFi",
                    "Kitchen",
                    "Pool",
                    "Free parking",
                    "Air conditioning",
                    "TV",
                ],
            },
            {
                "host": hosts[2],
                "title": "Mountain Cabin in Manali",
                "description": (
                    "A cozy wooden cabin surrounded by mountains and "
                    "pine forests. Perfect for a peaceful getaway."
                ),
                "location": "Manali, India",
                "city": "Manali",
                "country": "India",
                "price": 6500,
                "property_type": "Cabin",
                "max_guests": 5,
                "rating": 4.79,
                "images": [
                    "https://images.unsplash.com/photo-1510798831971-661eb04b3739",
                    "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8",
                    "https://images.unsplash.com/photo-1542718610-a1d656d1884c",
                ],
                "amenities": [
                    "WiFi",
                    "Kitchen",
                    "Free parking",
                    "TV",
                    "Workspace",
                ],
            },
            {
                "host": hosts[0],
                "title": "Modern Studio in Mumbai",
                "description": (
                    "A stylish studio apartment close to the best "
                    "restaurants, cafes and attractions in Mumbai."
                ),
                "location": "Mumbai, India",
                "city": "Mumbai",
                "country": "India",
                "price": 5200,
                "property_type": "Studio",
                "max_guests": 2,
                "rating": 4.71,
                "images": [
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
                    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
                ],
                "amenities": [
                    "WiFi",
                    "Kitchen",
                    "Air conditioning",
                    "TV",
                    "Washer",
                ],
            },
            {
                "host": hosts[1],
                "title": "Tropical Villa in Bali",
                "description": (
                    "A peaceful tropical villa surrounded by greenery "
                    "with a beautiful private swimming pool."
                ),
                "location": "Bali, Indonesia",
                "city": "Bali",
                "country": "Indonesia",
                "price": 9800,
                "property_type": "Villa",
                "max_guests": 6,
                "rating": 4.95,
                "images": [
                    "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
                    "https://images.unsplash.com/photo-1540541338287-41700207dee6",
                    "https://images.unsplash.com/photo-1564501049412-61c2a3083791",
                ],
                "amenities": [
                    "WiFi",
                    "Pool",
                    "Kitchen",
                    "Air conditioning",
                    "Free parking",
                ],
            },
            {
                "host": hosts[2],
                "title": "Lake View Cottage in Udaipur",
                "description": (
                    "Enjoy peaceful mornings overlooking the lake from "
                    "this charming cottage."
                ),
                "location": "Udaipur, India",
                "city": "Udaipur",
                "country": "India",
                "price": 7200,
                "property_type": "Cottage",
                "max_guests": 4,
                "rating": 4.83,
                "images": [
                    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
                    "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8",
                ],
                "amenities": [
                    "WiFi",
                    "Kitchen",
                    "Free parking",
                    "Breakfast",
                    "TV",
                ],
            },
            {
                "host": hosts[0],
                "title": "Luxury Penthouse in Dubai",
                "description": (
                    "A luxurious penthouse with panoramic city views "
                    "and premium amenities."
                ),
                "location": "Dubai, UAE",
                "city": "Dubai",
                "country": "UAE",
                "price": 22000,
                "property_type": "Penthouse",
                "max_guests": 6,
                "rating": 4.97,
                "images": [
                    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
                    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
                ],
                "amenities": [
                    "WiFi",
                    "Pool",
                    "Kitchen",
                    "Air conditioning",
                    "TV",
                    "Hot tub",
                ],
            },
            {
                "host": hosts[1],
                "title": "Cozy Home in London",
                "description": (
                    "A warm and comfortable home located in a quiet "
                    "neighborhood with easy access to central London."
                ),
                "location": "London, UK",
                "city": "London",
                "country": "UK",
                "price": 14500,
                "property_type": "House",
                "max_guests": 5,
                "rating": 4.76,
                "images": [
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
                    "https://images.unsplash.com/photo-1600607688969-a5bfcd646154",
                ],
                "amenities": [
                    "WiFi",
                    "Kitchen",
                    "Washer",
                    "TV",
                    "Workspace",
                ],
            },
            {
                "host": hosts[2],
                "title": "Desert Retreat in Jaisalmer",
                "description": (
                    "Experience Rajasthan from a beautiful desert retreat "
                    "with traditional architecture."
                ),
                "location": "Jaisalmer, India",
                "city": "Jaisalmer",
                "country": "India",
                "price": 4800,
                "property_type": "House",
                "max_guests": 4,
                "rating": 4.68,
                "images": [
                    "https://images.unsplash.com/photo-1548013146-72479768bada",
                    "https://images.unsplash.com/photo-1524498250077-390f9e378fc0",
                ],
                "amenities": [
                    "WiFi",
                    "Breakfast",
                    "Free parking",
                    "Air conditioning",
                ],
            },
            {
                "host": hosts[0],
                "title": "Modern Loft in New York",
                "description": (
                    "An elegant loft in Manhattan with modern furniture "
                    "and plenty of natural light."
                ),
                "location": "New York, USA",
                "city": "New York",
                "country": "USA",
                "price": 19500,
                "property_type": "Loft",
                "max_guests": 4,
                "rating": 4.84,
                "images": [
                    "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
                    "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
                ],
                "amenities": [
                    "WiFi",
                    "Kitchen",
                    "Air conditioning",
                    "TV",
                    "Workspace",
                ],
            },
            {
                "host": hosts[1],
                "title": "Forest Cabin in Himachal",
                "description": (
                    "Escape to nature in this peaceful cabin surrounded "
                    "by dense forest and mountains."
                ),
                "location": "Himachal Pradesh, India",
                "city": "Shimla",
                "country": "India",
                "price": 5900,
                "property_type": "Cabin",
                "max_guests": 4,
                "rating": 4.81,
                "images": [
                    "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8",
                    "https://images.unsplash.com/photo-1542718610-a1d656d1884c",
                ],
                "amenities": [
                    "WiFi",
                    "Kitchen",
                    "Free parking",
                    "TV",
                ],
            },
            {
                "host": hosts[2],
                "title": "Seaside Apartment in Barcelona",
                "description": (
                    "Bright apartment near the beach with modern "
                    "interiors and excellent city access."
                ),
                "location": "Barcelona, Spain",
                "city": "Barcelona",
                "country": "Spain",
                "price": 11200,
                "property_type": "Apartment",
                "max_guests": 4,
                "rating": 4.78,
                "images": [
                    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
                    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
                ],
                "amenities": [
                    "WiFi",
                    "Kitchen",
                    "Air conditioning",
                    "TV",
                ],
            },
            {
                "host": hosts[0],
                "title": "Traditional Home in Kyoto",
                "description": (
                    "Stay in a beautiful traditional-inspired home "
                    "close to Kyoto's historic attractions."
                ),
                "location": "Kyoto, Japan",
                "city": "Kyoto",
                "country": "Japan",
                "price": 8900,
                "property_type": "House",
                "max_guests": 5,
                "rating": 4.93,
                "images": [
                    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
                    "https://images.unsplash.com/photo-1528360983277-13d401cdc186",
                ],
                "amenities": [
                    "WiFi",
                    "Kitchen",
                    "TV",
                    "Washer",
                    "Breakfast",
                ],
            },
            {
                "host": hosts[1],
                "title": "Cliffside Villa in Santorini",
                "description": (
                    "Wake up to spectacular sea views from this "
                    "beautiful Santorini villa."
                ),
                "location": "Santorini, Greece",
                "city": "Santorini",
                "country": "Greece",
                "price": 24000,
                "property_type": "Villa",
                "max_guests": 4,
                "rating": 4.98,
                "images": [
                    "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff",
                    "https://images.unsplash.com/photo-1601918774946-25832a4be0d6",
                    "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff",
                ],
                "amenities": [
                    "WiFi",
                    "Pool",
                    "Air conditioning",
                    "Breakfast",
                    "Hot tub",
                ],
            },
            {
                "host": hosts[2],
                "title": "Minimalist Apartment in Singapore",
                "description": (
                    "A clean and modern apartment in a convenient "
                    "location close to restaurants and attractions."
                ),
                "location": "Singapore",
                "city": "Singapore",
                "country": "Singapore",
                "price": 10500,
                "property_type": "Apartment",
                "max_guests": 3,
                "rating": 4.75,
                "images": [
                    "https://images.unsplash.com/photo-1554995207-c18c203602cb",
                    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
                ],
                "amenities": [
                    "WiFi",
                    "Kitchen",
                    "Air conditioning",
                    "TV",
                    "Washer",
                ],
            },
        ]

        listings = []

        # ---------------------------------------------------------
        # 5. Create listings
        # ---------------------------------------------------------

        for data in listing_data:
            listing = Listing(
                host_id=data["host"].id,
                title=data["title"],
                description=data["description"],
                location=data["location"],
                city=data["city"],
                country=data["country"],
                price_per_night=data["price"],
                property_type=data["property_type"],
                max_guests=data["max_guests"],
                rating=data["rating"],
            )

            listing.amenities = [
                amenity_map[name]
                for name in data["amenities"]
            ]

            db.add(listing)
            db.flush()

            for image_url in data["images"]:
                image = ListingImage(
                    listing_id=listing.id,
                    image_url=image_url,
                )
                db.add(image)

            listings.append(listing)

        db.commit()

        for listing in listings:
            db.refresh(listing)

        # ---------------------------------------------------------
        # 6. Create existing bookings
        # ---------------------------------------------------------

        today = date.today()

        bookings = [
            Booking(
                listing_id=listings[0].id,
                guest_id=guests[0].id,
                check_in=today + timedelta(days=10),
                check_out=today + timedelta(days=14),
                guests=2,
                total_price=listings[0].price_per_night * 4,
                status="confirmed",
            ),
            Booking(
                listing_id=listings[1].id,
                guest_id=guests[1].id,
                check_in=today + timedelta(days=20),
                check_out=today + timedelta(days=25),
                guests=4,
                total_price=listings[1].price_per_night * 5,
                status="confirmed",
            ),
            Booking(
                listing_id=listings[2].id,
                guest_id=guests[0].id,
                check_in=today + timedelta(days=30),
                check_out=today + timedelta(days=33),
                guests=2,
                total_price=listings[2].price_per_night * 3,
                status="confirmed",
            ),
        ]

        db.add_all(bookings)

        # ---------------------------------------------------------
        # 7. Create reviews
        # ---------------------------------------------------------

        reviews = [
            Review(
                listing_id=listings[0].id,
                user_id=guests[0].id,
                rating=5,
                comment="Amazing apartment and perfect location!",
            ),
            Review(
                listing_id=listings[0].id,
                user_id=guests[1].id,
                rating=5,
                comment="Beautiful place. Would definitely stay again.",
            ),
            Review(
                listing_id=listings[1].id,
                user_id=guests[0].id,
                rating=5,
                comment="The villa was even better than the pictures.",
            ),
            Review(
                listing_id=listings[2].id,
                user_id=guests[1].id,
                rating=4.5,
                comment="Peaceful location and wonderful views.",
            ),
            Review(
                listing_id=listings[4].id,
                user_id=guests[0].id,
                rating=5,
                comment="Absolutely beautiful villa!",
            ),
            Review(
                listing_id=listings[5].id,
                user_id=guests[1].id,
                rating=4.5,
                comment="Lovely cottage and very relaxing.",
            ),
        ]

        db.add_all(reviews)

        db.commit()

        print("Database seeded successfully!")
        print(f"Users created: {len(hosts) + len(guests)}")
        print(f"Listings created: {len(listings)}")
        print(f"Amenities created: {len(amenities)}")
        print(f"Bookings created: {len(bookings)}")
        print(f"Reviews created: {len(reviews)}")

    except Exception as error:
        db.rollback()
        print("Error while seeding database:")
        print(error)

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()