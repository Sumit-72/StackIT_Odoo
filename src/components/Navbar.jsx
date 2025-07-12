import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <nav className="bg-white border-b border-gray-200">
        <div className="navbar-container">
          <div className="navbar-content">
            <Link to="/" className="text-2xl font-bold text-black">
              StackIt
            </Link>
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="navbar-container">
        <div className="navbar-content">
          <Link to="/" className="text-2xl font-bold text-black">
            StackIt
          </Link>
          
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-black transition-colors font-medium">
              Home
            </Link>
            <Link to="/ask" className="text-gray-700 hover:text-black transition-colors font-medium">
              Ask Question
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <NotificationDropdown />
                <span className="text-gray-600 text-sm">
                  Welcome, {user?.username || 'User'}!
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/login"
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-black border border-black px-4 py-2 rounded hover:bg-gray-50 transition-colors font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 