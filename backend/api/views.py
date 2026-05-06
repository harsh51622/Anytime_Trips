from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from django.db import transaction
from .models import (
    Category, Place, Trip, TransportOption, Seat,
    Booking, Passenger, Review, SavedTrip
)
from .serializers import (
    RegisterSerializer, UserSerializer, CategorySerializer, PlaceSerializer,
    TripSerializer, TransportOptionSerializer, BookingSerializer, ReviewSerializer
)
import razorpay
from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView

# Auth Views
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

# Base Data Views
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (permissions.AllowAny,)

class PlaceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
    permission_classes = (permissions.AllowAny,)

class TransportOptionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TransportOption.objects.all()
    serializer_class = TransportOptionSerializer
    permission_classes = (permissions.AllowAny,)
    
    def get_queryset(self):
        trip_id = self.request.query_params.get('trip_id')
        if trip_id:
            return self.queryset.filter(trip_id=trip_id)
        return self.queryset

# Trip Views
class TripViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        queryset = Trip.objects.all()
        search = self.request.query_params.get('search', None)
        category = self.request.query_params.get('category', None)
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)

        if search:
            queryset = queryset.filter(title__icontains=search) | queryset.filter(place__name__icontains=search)
        if category:
            queryset = queryset.filter(place__category__name__icontains=category)
        if min_price:
            queryset = queryset.filter(base_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(base_price__lte=max_price)
            
        return queryset

# Booking Views
class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).order_by('-created_at')

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        trip_id = request.data.get('trip')
        transport_id = request.data.get('transport_option')
        passengers_data = request.data.get('passengers', [])

        if not trip_id or not passengers_data:
            return Response({'error': 'Trip and passengers are required'}, status=status.HTTP_400_BAD_REQUEST)

        trip = Trip.objects.get(id=trip_id)
        transport = TransportOption.objects.filter(id=transport_id).first() if transport_id else None

        # Check seats
        seat_ids = [p.get('seat') for p in passengers_data if p.get('seat')]
        if seat_ids:
            seats = Seat.objects.select_for_update().filter(id__in=seat_ids)
            for seat in seats:
                if seat.is_booked:
                    return Response({'error': f'Seat {seat.seat_number} is already booked'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate Price
        num_passengers = len(passengers_data)
        base_cost = trip.base_price * num_passengers
        transport_cost = (transport.price * num_passengers) if transport else 0
        total_price = base_cost + transport_cost
        
        # Taxes - Let's say 5% GST
        taxes = total_price * Decimal('0.05') if 'Decimal' in globals() else float(total_price) * 0.05
        # Wait, import Decimal
        from decimal import Decimal
        total_price = Decimal(total_price) + Decimal(taxes)

        booking = Booking.objects.create(
            user=request.user,
            trip=trip,
            transport_option=transport,
            total_price=total_price,
            status='Pending'
        )

        for p_data in passengers_data:
            seat_id = p_data.get('seat')
            seat_obj = None
            if seat_id:
                seat_obj = Seat.objects.get(id=seat_id)
                seat_obj.is_booked = True
                seat_obj.save()

            Passenger.objects.create(
                booking=booking,
                name=p_data['name'],
                age=p_data['age'],
                gender=p_data['gender'],
                seat=seat_obj
            )

        serializer = self.get_serializer(booking)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# Reviews
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        trip_id = self.request.query_params.get('trip_id')
        if trip_id:
            return self.queryset.filter(trip_id=trip_id)
        return self.queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Razorpay Payment Views
razorpay_client = razorpay.Client(auth=("rzp_test_placeholder", "rzp_secret_placeholder"))

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_razorpay_order(request):
    booking_id = request.data.get('booking_id')
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
        # Amount is in paise
        amount = int(booking.total_price * 100)
        
        # Create Order
        razorpay_order = razorpay_client.order.create({
            "amount": amount,
            "currency": "INR",
            "receipt": f"receipt_{booking.id}",
            "payment_capture": "1"
        })
        
        booking.razorpay_order_id = razorpay_order['id']
        booking.save()
        
        return Response(razorpay_order, status=status.HTTP_200_OK)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def verify_payment(request):
    data = request.data
    try:
        booking_id = data.get('booking_id')
        booking = Booking.objects.get(id=booking_id, user=request.user)
        booking.status = 'Confirmed'
        booking.save()
        
        return Response({'status': 'Payment successful'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
