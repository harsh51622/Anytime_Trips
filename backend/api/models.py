from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    image = models.URLField(blank=True, null=True)
    
    def __str__(self):
        return self.name

class Place(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='places')
    starting_price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.URLField() # Main image

    def __str__(self):
        return self.name

class PlaceImage(models.Model):
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField()

    def __str__(self):
        return f"Image for {self.place.name}"

class Trip(models.Model):
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='trips')
    title = models.CharField(max_length=200)
    description = models.TextField()
    duration_days = models.IntegerField()
    duration_nights = models.IntegerField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    available_seats = models.IntegerField(default=50)
    map_location = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class TripImage(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField()

    def __str__(self):
        return f"Image for {self.trip.title}"

class Itinerary(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='itineraries')
    day_number = models.IntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    activities = models.TextField(help_text="Comma separated activities")

    class Meta:
        ordering = ['day_number']

    def __str__(self):
        return f"Day {self.day_number} - {self.trip.title}"

class TransportOption(models.Model):
    TRANSPORT_TYPES = (
        ('Car', 'Car'),
        ('Bus', 'Bus'),
        ('Train', 'Train'),
    )
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='transport_options')
    type = models.CharField(max_length=20, choices=TRANSPORT_TYPES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    details = models.CharField(max_length=200, help_text="e.g. AC Sleeper, SUV")

    def __str__(self):
        return f"{self.type} for {self.trip.title}"

class Seat(models.Model):
    transport_option = models.ForeignKey(TransportOption, on_delete=models.CASCADE, related_name='seats')
    seat_number = models.CharField(max_length=10)
    is_booked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.seat_number} - {self.transport_option.type}"

class Booking(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Cancelled', 'Cancelled'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='bookings')
    transport_option = models.ForeignKey(TransportOption, on_delete=models.SET_NULL, null=True, blank=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.trip.title}"

class Passenger(models.Model):
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    )
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='passengers')
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    seat = models.OneToOneField(Seat, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField() # 1 to 5
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.user.username} for {self.trip.title}"

class SavedTrip(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_trips')
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='saved_by')

    class Meta:
        unique_together = ('user', 'trip')

    def __str__(self):
        return f"{self.user.username} saved {self.trip.title}"
