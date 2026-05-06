from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, UserDetailView, TripViewSet, BookingViewSet, 
    CategoryViewSet, PlaceViewSet, TransportOptionViewSet, ReviewViewSet,
    create_razorpay_order, verify_payment
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'places', PlaceViewSet)
router.register(r'trips', TripViewSet)
router.register(r'transport-options', TransportOptionViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', UserDetailView.as_view(), name='user_detail'),
    
    path('', include(router.urls)),
    
    path('payments/create-order/', create_razorpay_order, name='create_order'),
    path('payments/verify/', verify_payment, name='verify_payment'),
]
