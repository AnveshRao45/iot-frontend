import DeviceList from './components/DeviceList';
import Login from './components/Login';
import Navbar from './components/Navbar';
import { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Telemetry from './components/Telemetry';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route
          path="/devices"
          element={
            <ProtectedRoute>
              <DeviceList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/telemetry"
          element={
            <ProtectedRoute>
              <Telemetry />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/devices" />} />
      </Routes>
    </Router>
  );
}

export default App;