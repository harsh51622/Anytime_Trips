import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search } from 'lucide-react';
import api from '../services/api';
import TripCard from '../components/TripCard';

const Trips = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    destination: searchParams.get('destination') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    duration: searchParams.get('duration') || '',
  });

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.destination) queryParams.append('destination', filters.destination);
      if (filters.min_price) queryParams.append('min_price', filters.min_price);
      if (filters.max_price) queryParams.append('max_price', filters.max_price);
      if (filters.duration) queryParams.append('duration', filters.duration);
      
      setSearchParams(queryParams);
      
      const response = await api.get(`trips/?${queryParams.toString()}`);
      setTrips(response.data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchTrips();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Explore Destinations</h1>
        <p className="text-slate-600">Find your perfect getaway from our extensive collection of luxury trips.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-28">
            <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-slate-100">
              <Filter className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold">Filters</h2>
            </div>
            
            <form onSubmit={applyFilters} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Destination</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    name="destination"
                    value={filters.destination}
                    onChange={handleFilterChange}
                    placeholder="Search destination..." 
                    className="input-field pl-10 py-2.5 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Price Range (₹)</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="number" 
                    name="min_price"
                    value={filters.min_price}
                    onChange={handleFilterChange}
                    placeholder="Min" 
                    className="input-field py-2.5 text-sm w-full"
                  />
                  <span className="text-slate-400">-</span>
                  <input 
                    type="number" 
                    name="max_price"
                    value={filters.max_price}
                    onChange={handleFilterChange}
                    placeholder="Max" 
                    className="input-field py-2.5 text-sm w-full"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Duration (Days)</label>
                <input 
                  type="number" 
                  name="duration"
                  value={filters.duration}
                  onChange={handleFilterChange}
                  placeholder="e.g. 5" 
                  className="input-field py-2.5 text-sm"
                />
              </div>
              
              <button type="submit" className="w-full btn-primary py-3">
                Apply Filters
              </button>
              
              <button 
                type="button" 
                onClick={() => {
                  setFilters({ destination: '', min_price: '', max_price: '', duration: '' });
                  setTimeout(fetchTrips, 100);
                }}
                className="w-full py-3 text-slate-600 hover:text-primary-600 font-medium transition-colors"
              >
                Clear All
              </button>
            </form>
          </div>
        </div>

        {/* Trips Grid */}
        <div className="w-full lg:w-3/4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trips.map(trip => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No destinations found</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                We couldn't find any trips matching your current filters. Try adjusting your search criteria.
              </p>
              <button 
                onClick={() => {
                  setFilters({ destination: '', min_price: '', max_price: '', duration: '' });
                  setTimeout(fetchTrips, 100);
                }}
                className="mt-6 text-primary-600 font-medium hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trips;
