import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    // Check if user is logged in (you can implement your own auth logic)
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Odoo Q&A
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <Link to="/ask" className="text-gray-700 hover:text-blue-600">
              Ask Question
            </Link>
            
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
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