from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Category, Place, PlaceImage, Trip, TripImage, Itinerary,
    TransportOption, Seat, Booking, Passenger, Review, SavedTrip
)

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class PlaceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaceImage
        fields = ('id', 'image_url')

class PlaceSerializer(serializers.ModelSerializer):
    images = PlaceImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Place
        fields = '__all__'

class TripImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripImage
        fields = ('id', 'image_url')

class ItinerarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Itinerary
        fields = '__all__'

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = '__all__'

class TransportOptionSerializer(serializers.ModelSerializer):
    seats = SeatSerializer(many=True, read_only=True)

    class Meta:
        model = TransportOption
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ('user', 'trip')

class TripSerializer(serializers.ModelSerializer):
    images = TripImageSerializer(many=True, read_only=True)
    itineraries = ItinerarySerializer(many=True, read_only=True)
    transport_options = TransportOptionSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    place_details = PlaceSerializer(source='place', read_only=True)

    class Meta:
        model = Trip
        fields = '__all__'

class PassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passenger
        fields = '__all__'
        read_only_fields = ('booking',)

class BookingSerializer(serializers.ModelSerializer):
    trip_details = TripSerializer(source='trip', read_only=True)
    passengers = PassengerSerializer(many=True, read_only=True)
    transport_details = TransportOptionSerializer(source='transport_option', read_only=True)
    
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('user', 'status', 'razorpay_order_id', 'total_price')

class UserSerializer(serializers.ModelSerializer):
    bookings = BookingSerializer(many=True, read_only=True)
    last_order = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'bookings', 'last_order')

    def get_last_order(self, obj):
        last_booking = obj.bookings.order_by('-created_at').first()
        if last_booking:
            return BookingSerializer(last_booking).data
        return None

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            validated_data['username'],
            validated_data['email'],
            validated_data['password']
        )
        return user
