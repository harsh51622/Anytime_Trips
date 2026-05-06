import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark-900 pt-16 pb-8 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="bg-primary-600 p-2 rounded-xl">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Wanderlust</span>
            </Link>
            <p className="text-slate-400 max-w-md">
              Experience the world with ultra-premium luxury travel packages. 
              We curate the finest destinations for memories that last a lifetime.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Home</Link></li>
              <li><Link to="/trips" className="hover:text-primary-400 transition-colors">Destinations</Link></li>
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Login</Link></li>
              <li><Link to="/signup" className="hover:text-primary-400 transition-colors">Sign Up</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-slate-400">
              <li>123 Luxury Avenue</li>
              <li>Mumbai, Maharashtra 400001</li>
              <li>contact@wanderlust.com</li>
              <li>+91 98765 43210</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Wanderlust Travel. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
