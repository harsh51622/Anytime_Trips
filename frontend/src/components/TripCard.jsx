import { Link } from 'react-router-dom';
import { MapPin, Clock, IndianRupee } from 'lucide-react';

const TripCard = ({ trip }) => {
  return (
    <div className="group rounded-2xl overflow-hidden glass-card transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      <div className="relative h-64 overflow-hidden">
        {trip.image ? (
          <img 
            src={trip.image} 
            alt={trip.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
            No Image Available
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-primary-600 shadow-lg">
          Featured
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center text-slate-500 text-sm mb-3">
          <MapPin className="w-4 h-4 mr-1 text-primary-500" />
          <span>{trip.destination}</span>
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {trip.title}
        </h3>
        
        <p className="text-slate-600 text-sm mb-6 line-clamp-2">
          {trip.description}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center text-slate-500">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{trip.duration} Days</span>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-0.5">Starting from</p>
            <div className="flex items-center text-xl font-bold text-slate-800">
              <IndianRupee className="w-5 h-5" />
              <span>{trip.price}</span>
            </div>
          </div>
        </div>
        
        <Link 
          to={`/trips/${trip.id}`} 
          className="mt-6 block w-full py-3 text-center bg-slate-50 hover:bg-primary-50 text-primary-600 font-semibold rounded-xl transition-colors duration-300 border border-slate-100 hover:border-primary-100"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default TripCard;
