from django.contrib import admin
from .models import (
    Category, Place, PlaceImage, Trip, TripImage, Itinerary,
    TransportOption, Seat, Booking, Passenger, Review, SavedTrip
)

admin.site.register(Category)
admin.site.register(Place)
admin.site.register(PlaceImage)
admin.site.register(Trip)
admin.site.register(TripImage)
admin.site.register(Itinerary)
admin.site.register(TransportOption)
admin.site.register(Seat)
admin.site.register(Booking)
admin.site.register(Passenger)
admin.site.register(Review)
admin.site.register(SavedTrip)
