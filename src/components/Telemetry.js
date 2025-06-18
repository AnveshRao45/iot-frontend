import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Telemetry = () => {
  const [telemetry, setTelemetry] = useState([]);
  const [telemetryPayload, setTelemetryPayload] = useState({ temperature: '', humidity: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch telemetry from /api/devices/telemetry
  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/devices/telemetry', {
        headers: getAuthHeader(),
      });
      setTelemetry(response.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch telemetry.');
      console.error('Error fetching telemetry:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchTelemetry();
    }
  }, [navigate]);

  // Send telemetry via /api/devices/telemetry
  const handleSendTelemetry = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/devices/telemetry', JSON.stringify(telemetryPayload), {
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      });
      setTelemetryPayload({ temperature: '', humidity: '' });
      fetchTelemetry();
      setError('');
    } catch (error) {
      setError('Failed to send telemetry.');
      console.error('Error sending telemetry:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Telemetry Management</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-blue-500 mb-4">Loading...</p>}

      {/* Telemetry Form */}
      <form onSubmit={handleSendTelemetry} className="mb-6">
        <input
          type="number"
          placeholder="Temperature (°C)"
          value={telemetryPayload.temperature}
          onChange={(e) => setTelemetryPayload({ ...telemetryPayload, temperature: e.target.value })}
          className="border p-2 mr-2 rounded"
          required
        />
        <input
          type="number"
          placeholder="Humidity (%)"
          value={telemetryPayload.humidity}
          onChange={(e) => setTelemetryPayload({ ...telemetryPayload, humidity: e.target.value })}
          className="border p-2 mr-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Telemetry'}
        </button>
      </form>

      {/* Telemetry List */}
      <h3 className="text-xl font-semibold mb-2">Telemetry Data</h3>
      <ul className="space-y-2">
        {telemetry.map(t => (
          <li key={t.id} className="p-2 border-b">
            Device ID: {t.deviceId} - Payload: {t.payload} - Timestamp: {t.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Telemetry;