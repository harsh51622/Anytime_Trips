import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, IndianRupee, Users, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await api.get(`trips/${id}/`);
        setTrip(response.data);
      } catch (error) {
        console.error('Error fetching trip details:', error);
        toast.error('Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please log in to book a trip');
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    try {
      const response = await api.post('bookings/', {
        trip: trip.id,
        members: members
      });
      
      const booking = response.data;
      
      // Initialize Razorpay
      const orderResponse = await api.post('payments/create-order/', {
        booking_id: booking.id
      });
      
      const options = {
        key: 'rzp_test_placeholder', // Should come from env in production
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'Wanderlust Travel',
        description: `Booking for ${trip.title}`,
        order_id: orderResponse.data.id,
        handler: async function (response) {
          try {
            await api.post('payments/verify/', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: booking.id
            });
            toast.success('Payment successful! Booking confirmed.');
            navigate('/dashboard');
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
        },
        theme: {
          color: '#7c3aed'
        }
      };
      
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
      
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error('Failed to initiate booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!trip) {
    return <div className="text-center py-20 text-xl text-slate-600">Trip not found</div>;
  }

  const totalPrice = trip.price * members;

  return (
    <div className="bg-white pb-20">
      {/* Header Image */}
      <div className="relative h-[60vh] w-full">
        {trip.image ? (
          <img src={trip.image} alt={trip.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-200"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white max-w-7xl mx-auto">
          <div className="flex items-center text-primary-300 font-medium mb-4">
            <MapPin className="w-5 h-5 mr-2" />
            <span className="text-lg">{trip.destination}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-md">{trip.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-lg">
            <div className="flex items-center">
              <Clock className="w-6 h-6 mr-2 text-primary-400" />
              <span>{trip.duration} Days</span>
            </div>
            <div className="flex items-center">
              <IndianRupee className="w-6 h-6 mr-2 text-primary-400" />
              <span className="font-bold">{trip.price} <span className="text-sm font-normal text-slate-300">/ person</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Trip Info */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Overview</h2>
              <div className="prose max-w-none text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                {trip.description}
              </div>
            </section>
            
            <section className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">What's Included</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Premium Accommodation', 'Expert Local Guide', 'Daily Breakfast', 'Airport Transfers', 'All Entry Fees'].map((item, idx) => (
                  <li key={idx} className="flex items-center text-slate-700">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Booking Sidebar */}
          <div>
            <div className="bg-white rounded-3xl shadow-2xl shadow-primary-900/5 border border-slate-100 p-8 sticky top-28">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Book This Trip</h3>
              <p className="text-slate-500 mb-8">Reserve your spot before it sells out.</p>
              
              <form onSubmit={handleBooking} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Travelers</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-slate-400" />
                    </div>
                    <select 
                      value={members} 
                      onChange={(e) => setMembers(Number(e.target.value))}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 appearance-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <div className="flex justify-between text-slate-600 mb-2">
                    <span>₹{trip.price} x {members} travelers</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 mb-4">
                    <span>Taxes & Fees</span>
                    <span className="text-green-600">Included</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold text-slate-900 pt-4 border-t border-slate-100">
                    <span>Total Price</span>
                    <div className="flex items-center text-primary-600">
                      <IndianRupee className="w-6 h-6" />
                      <span>{totalPrice}</span>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={bookingLoading}
                  className="w-full btn-primary py-4 text-lg mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {bookingLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
                <p className="text-xs text-center text-slate-400 mt-4">You won't be charged yet.</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
