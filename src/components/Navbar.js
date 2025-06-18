import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/devices" className="text-white text-lg font-bold">
          IoT Platform
        </Link>
        {isAuthenticated && (
          <div className="space-x-4">
            <Link to="/devices" className="text-white hover:underline">
              Devices
            </Link>
            <Link to="/telemetry" className="text-white hover:underline">
              Telemetry
            </Link>
            <button
              onClick={handleLogout}
              className="text-white hover:underline"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;