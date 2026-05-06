import random
from django.core.management.base import BaseCommand
from api.models import (
    Category, Place, PlaceImage, Trip, TripImage, Itinerary,
    TransportOption, Seat
)

class Command(BaseCommand):
    help = 'Seeds the database with mock travel data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Deleting old data...')
        Trip.objects.all().delete()
        Place.objects.all().delete()
        Category.objects.all().delete()

        categories_data = {
            'Hill Stations': ['Manali', 'Shimla', 'Leh-Ladakh', 'Ooty', 'Darjeeling', 'Munnar', 'Nainital', 'Mussoorie', 'Kodaikanal', 'Auli'],
            'Beaches': ['Goa', 'Andaman', 'Gokarna', 'Varkala', 'Puri', 'Kovalam', 'Pondicherry', 'Tarkarli', 'Marari', 'Radhanagar'],
            'Historical': ['Jaipur', 'Agra', 'Hampi', 'Khajuraho', 'Mysore', 'Gwalior', 'Jodhpur', 'Udaipur', 'Ajanta Ellora', 'Fatehpur Sikri'],
            'Spiritual': ['Varanasi', 'Rishikesh', 'Haridwar', 'Amritsar', 'Tirupati', 'Madurai', 'Bodh Gaya', 'Rameswaram', 'Dwarka', 'Kedarnath'],
            'Adventure': ['Bir Billing', 'Spiti Valley', 'Meghalaya', 'Zanskar', 'Dandeli', 'Roopkund', 'Gulmarg', 'Kullu', 'Lonavala', 'Kasol'],
            'Wildlife': ['Jim Corbett', 'Ranthambore', 'Kaziranga', 'Bandhavgarh', 'Kanha', 'Gir', 'Periyar', 'Sundarbans', 'Nagarhole', 'Mudumalai']
        }

        self.stdout.write('Creating Categories and Places...')
        places_created = []
        for cat_name, places_list in categories_data.items():
            category = Category.objects.create(name=cat_name, image=f'https://picsum.photos/400/300?random={random.randint(1,1000)}')
            
            for place_name in places_list:
                place = Place.objects.create(
                    name=place_name,
                    description=f"Explore the beautiful and mesmerizing {place_name}. A perfect getaway for {cat_name.lower()} lovers.",
                    category=category,
                    starting_price=random.randint(4999, 15000),
                    image=f'https://picsum.photos/800/600?random={random.randint(1,1000)}'
                )
                places_created.append(place)
                
                # Add 3 gallery images for the place
                for _ in range(3):
                    PlaceImage.objects.create(
                        place=place,
                        image_url=f'https://picsum.photos/800/600?random={random.randint(1,1000)}'
                    )

        self.stdout.write(f'Created {len(places_created)} Places.')
        self.stdout.write('Creating Trips, Itineraries, and Transport...')
        
        trips_created = 0
        for place in places_created:
            # Create 1 or 2 trips per place
            num_trips = random.choice([1, 2])
            for t_idx in range(num_trips):
                duration_days = random.randint(2, 7)
                duration_nights = duration_days - 1
                
                trip_types = ['Budget', 'Luxury', 'Family', 'Backpacker']
                trip_type = random.choice(trip_types)
                title = f"{duration_days}D/{duration_nights}N {trip_type} Trip to {place.name}"
                
                trip = Trip.objects.create(
                    place=place,
                    title=title,
                    description=f"An amazing {trip_type.lower()} experience in {place.name}. Enjoy sightseeing, local cuisine, and comfortable stays.",
                    duration_days=duration_days,
                    duration_nights=duration_nights,
                    base_price=place.starting_price + random.randint(1000, 10000),
                    available_seats=random.randint(10, 50),
                    map_location="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112000!2d77.0!3d28.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDMwJzAwLjAiTiA3N8KwMDAnMDAuMCJF!5e0!3m2!1sen!2sin!4v1611111111111!5m2!1sen!2sin"
                )
                trips_created += 1

                # Add trip images
                for _ in range(4):
                    TripImage.objects.create(
                        trip=trip,
                        image_url=f'https://picsum.photos/800/600?random={random.randint(1,1000)}'
                    )

                # Add itinerary
                for day in range(1, duration_days + 1):
                    Itinerary.objects.create(
                        trip=trip,
                        day_number=day,
                        title=f"Day {day} in {place.name}",
                        description=f"Morning breakfast, followed by local sightseeing and evening leisure.",
                        activities="Sightseeing, Photography, Local Food Tasting"
                    )

                # Add Transport Options
                transport_types = ['Car', 'Bus', 'Train']
                for t_type in transport_types:
                    # Not all trips have all transports
                    if random.random() > 0.3: 
                        price = random.randint(1000, 5000) if t_type != 'Car' else random.randint(5000, 15000)
                        details = "AC Sleeper" if t_type in ['Bus', 'Train'] else "Private SUV"
                        
                        t_option = TransportOption.objects.create(
                            trip=trip,
                            type=t_type,
                            price=price,
                            details=details
                        )

                        # Add seats for Bus and Train
                        if t_type in ['Bus', 'Train']:
                            num_seats = 20 if t_type == 'Bus' else 40
                            prefix = 'B' if t_type == 'Bus' else 'T'
                            for i in range(1, num_seats + 1):
                                Seat.objects.create(
                                    transport_option=t_option,
                                    seat_number=f"{prefix}{i}",
                                    is_booked=random.random() > 0.8 # 20% chance booked
                                )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {trips_created} trips with full details!'))
