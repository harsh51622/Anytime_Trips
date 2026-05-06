import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Map, Calendar, Shield } from 'lucide-react';
import api from '../services/api';
import TripCard from '../components/TripCard';

const Home = () => {
  const [featuredTrips, setFeaturedTrips] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await api.get('trips/');
        setFeaturedTrips(response.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching trips:', error);
      }
    };
    fetchTrips();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/trips?destination=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-dark-900/40 backdrop-blur-[2px]"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            Discover Your Next <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-primary-100">
              Great Adventure
            </span>
          </h1>
          <p className="text-xl text-slate-200 mb-10 max-w-2xl mx-auto drop-shadow">
            Experience the world's most breathtaking destinations with our curated luxury travel packages.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Where do you want to go?" 
                className="w-full pl-12 pr-4 py-4 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800"
              />
            </div>
            <button type="submit" className="btn-primary py-4 px-8 rounded-xl text-lg w-full md:w-auto">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose Wanderlust?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We provide unparalleled experiences with top-tier accommodations and exclusive itineraries.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 mx-auto bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6">
                <Map className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Curated Destinations</h3>
              <p className="text-slate-600">Handpicked locations that offer the most authentic and breathtaking experiences.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 mx-auto bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Flexible Bookings</h3>
              <p className="text-slate-600">Plans change, and we understand. Enjoy flexible booking options for peace of mind.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 mx-auto bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Payments</h3>
              <p className="text-slate-600">Industry-leading security protocols to ensure your transactions are safe and protected.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Trips Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Featured Destinations</h2>
              <p className="text-slate-600 max-w-2xl">Explore our most popular and highly rated travel packages.</p>
            </div>
            <Link to="/trips" className="text-primary-600 font-semibold hover:text-primary-700 hidden md:block">
              View All Destinations &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link to="/trips" className="btn-primary inline-block">
              View All Destinations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
