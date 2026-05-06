import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Compass, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed w-full z-50 glass-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-primary-600 p-2 rounded-xl group-hover:rotate-12 transition-all duration-300">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-blue-600">
              Wanderlust
            </span>
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Home</Link>
            <Link to="/trips" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Destinations</Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center space-x-2 text-slate-600 hover:text-primary-600 font-medium transition-colors">
                  <User className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-slate-600 hover:text-red-500 font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Log in</Link>
                <Link to="/signup" className="btn-primary">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
