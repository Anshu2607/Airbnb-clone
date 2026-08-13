from pydantic import BaseModel


class ListingUpdate(BaseModel):
    title: str
    description: str
    location: str
    city: str
    country: str
    price_per_night: float
    property_type: str
    max_guests: int