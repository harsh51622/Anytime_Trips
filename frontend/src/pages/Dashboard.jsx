import { useState, useEffect, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Calendar, MapPin, IndianRupee, Clock } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchBookings = async () => {
        try {
          const response = await api.get('bookings/');
          setBookings(response.data);
        } catch (error) {
          console.error('Error fetching bookings:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchBookings();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome back, {user.first_name || user.username}!</h1>
        <p className="text-slate-600">Manage your bookings and account settings here.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-28">
            <div className="flex flex-col items-center mb-6 pb-6 border-b border-slate-100">
              <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
                <User className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{user.first_name} {user.last_name}</h2>
              <p className="text-slate-500 text-sm">{user.email}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Member Since</span>
                <span className="font-semibold text-slate-700">2026</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Total Trips</span>
                <span className="font-semibold text-slate-700">{bookings.length}</span>
              </div>
            </div>
            
            <button className="w-full mt-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Bookings</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col sm:flex-row hover:shadow-md transition-shadow">
                  <div className="sm:w-1/3 h-48 sm:h-auto relative bg-slate-200">
                    {booking.trip_details.image && (
                      <img src={booking.trip_details.image} alt={booking.trip_details.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 sm:w-2/3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{booking.trip_details.title}</h3>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Total Price</p>
                          <div className="flex items-center text-lg font-bold text-primary-600">
                            <IndianRupee className="w-4 h-4" />
                            <span>{booking.total_price}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4">
                        <div className="flex items-center text-sm text-slate-600">
                          <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                          <span>{booking.trip_details.destination}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Clock className="w-4 h-4 mr-2 text-slate-400" />
                          <span>{booking.trip_details.duration} Days</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <User className="w-4 h-4 mr-2 text-slate-400" />
                          <span>{booking.members} Travelers</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                          <span>Booked on {new Date(booking.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                      <Link to={`/trips/${booking.trip}`} className="px-4 py-2 border border-primary-200 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors">
                        View Trip details
                      </Link>
                      {booking.status === 'Pending' && (
                        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/20">
                          Complete Payment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No bookings yet</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-6">
                You haven't booked any trips yet. Explore our destinations and start your adventure!
              </p>
              <Link to="/trips" className="btn-primary inline-block">
                Explore Destinations
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
