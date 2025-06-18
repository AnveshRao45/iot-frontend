   import axios from 'axios';
   import { useEffect, useState } from 'react';
   import { useNavigate, Link } from 'react-router-dom';
   import DeviceForm from './DeviceForm';
   import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
   import { Client } from '@stomp/stompjs';
   import SockJS from 'sockjs-client';

   const DeviceList = () => {
       const [devices, setDevices] = useState([]);
       const [editingDevice, setEditingDevice] = useState(null);
       const [telemetry, setTelemetry] = useState([]);
       const [telemetryPayload, setTelemetryPayload] = useState({ temperature: '', humidity: '' });
       const [error, setError] = useState('');
       const [loading, setLoading] = useState(false);
       const navigate = useNavigate();
       let stompClient = null;

       const getAuthHeader = () => {
           const token = localStorage.getItem('token');
           return token ? { Authorization: `Bearer ${token}` } : {};
       };

       const fetchDevices = async () => {
           setLoading(true);
           try {
               const response = await axios.get('http://localhost:8080/api/devices', {
                   headers: getAuthHeader(),
               });
               setDevices(response.data);
           } catch (error) {
               setError('Failed to fetch devices. Please try again.');
               console.error('Error fetching devices:', error);
           } finally {
               setLoading(false);
           }
       };

       const fetchTelemetry = async () => {
           try {
               const response = await axios.get('http://localhost:8080/api/devices/telemetry', {
                   headers: getAuthHeader(),
               });
               setTelemetry(response.data.map(t => ({
                   ...t,
                   timestamp: new Date(t.timestamp).toLocaleTimeString(),
                   temperature: JSON.parse(t.payload).temperature,
                   humidity: JSON.parse(t.payload).humidity
               })));
           } catch (error) {
               setError('Failed to fetch telemetry. Please try again.');
               console.error('Error fetching telemetry:', error);
           }
       };

       useEffect(() => {
           const token = localStorage.getItem('token');
           if (!token) {
               navigate('/login');
           } else {
               fetchDevices();
               fetchTelemetry();

               const socket = new SockJS('http://localhost:8080/ws');
               stompClient = new Client({
                   webSocketFactory: () => socket,
                   onConnect: () => {
                       stompClient.subscribe('/topic/telemetry/test-device', (message) => {
                           const newTelemetry = JSON.parse(message.body);
                           setTelemetry(prev => [...prev, {
                               ...newTelemetry,
                               timestamp: new Date(newTelemetry.timestamp).toLocaleTimeString(),
                               temperature: JSON.parse(newTelemetry.payload).temperature,
                               humidity: JSON.parse(newTelemetry.payload).humidity
                           }].slice(-50));
                       });
                   },
                   onStompError: (error) => {
                       setError('WebSocket connection failed.');
                       console.error('WebSocket error:', error);
                   }
               });
               stompClient.activate();

               return () => {
                   if (stompClient) stompClient.deactivate();
               };
           }
       }, [navigate]);

       const handleAddDevice = async (device) => {
           setLoading(true);
           try {
               const response = await axios.post('http://localhost:8080/api/devices', device, {
                   headers: getAuthHeader(),
               });
               setDevices([...devices, response.data]);
               setError('');
           } catch (error) {
               setError('Failed to add device. Ensure device ID is unique.');
               console.error('Error adding device:', error);
           } finally {
               setLoading(false);
           }
       };

       const handleUpdateDevice = async (device) => {
           setLoading(true);
           try {
               const response = await axios.put(`http://localhost:8080/api/devices/${device.id}`, device, {
                   headers: getAuthHeader(),
               });
               setDevices(devices.map(d => (d.id === device.id ? response.data : d)));
               setEditingDevice(null);
               setError('');
           } catch (error) {
               setError('Failed to update device.');
               console.error('Error updating device:', error);
           } finally {
               setLoading(false);
           }
       };

       const handleDeleteDevice = async (id) => {
           setLoading(true);
           try {
               await axios.delete(`http://localhost:8080/api/devices/${id}`, {
                   headers: getAuthHeader(),
               });
               setDevices(devices.filter(d => d.id !== id));
               setError('');
           } catch (error) {
               setError('Failed to delete device.');
               console.error('Error deleting device:', error);
           } finally {
               setLoading(false);
           }
       };

       const handleSendTelemetry = async (e) => {
           e.preventDefault();
           setLoading(true);
           try {
               const payload = JSON.stringify(telemetryPayload);
               await axios.post('http://localhost:8080/api/devices/telemetry', payload, {
                   headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
               });
               setTelemetryPayload({ temperature: '', humidity: '' });
               setError('');
           } catch (error) {
               setError('Failed to send telemetry.');
               console.error('Error sending telemetry:', error);
           } finally {
               setLoading(false);
           }
       };

       const handleLogout = () => {
           localStorage.removeItem('token');
           navigate('/login');
       };

       return (
           <div className="container mx-auto p-4">
               <h2 className="text-2xl font-bold mb-4">Device Management</h2>
               {error && <p className="text-red-500 mb-4">{error}</p>}
               {loading && <p className="text-blue-500 mb-4">Loading...</p>}

               <DeviceForm
                   initialValues={null}
                   onSubmit={handleAddDevice}
               />

               {editingDevice && (
                   <DeviceForm
                       initialValues={editingDevice}
                       onSubmit={handleUpdateDevice}
                       onCancel={() => setEditingDevice(null)}
                   />
               )}

               <h3 className="text-xl font-semibold mb-2">Devices</h3>
               <ul className="space-y-2 mb-6">
                   {devices.map(device => (
                       <li key={device.id} className="flex justify-between items-center p-2 border-b">
                           <span>
                               <strong>{device.name}</strong> (ID: {device.id}) - {device.status}
                           </span>
                           <div>
                               <button
                                   onClick={() => setEditingDevice(device)}
                                   className="bg-yellow-500 text-white px-4 py-1 rounded mr-2 hover:bg-yellow-600"
                               >
                                   Edit
                               </button>
                               <button
                                   onClick={() => handleDeleteDevice(device.id)}
                                   className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 mr-2"
                               >
                                   Delete
                               </button>
                               <Link
                                   to={`/telemetry/${device.id}`}
                                   className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                               >
                                   View Dashboard
                               </Link>
                           </div>
                       </li>
                   ))}
               </ul>

               <h3 className="text-xl font-semibold mb-2">Send Telemetry</h3>
               <form method="post" action="/telemetry" onSubmit={handleSendTelemetry} className="mb-6">
                   <input
                       type="number"
                       placeholder="Temperature (°C)"
                       value={telemetryPayload.temperature}
                       onChange={(e) => setTelemetryPayload({ ...telemetryPayload, temperature: e.target.value })}
                       className="border p-2 rounded mr-2"
                       required
                   />
                   <input
                       type="number"
                       placeholder="Humidity (%)"
                       value={telemetryPayload.humidity}
                       onChange={(e) => setTelemetryPayload({ ...telemetryPayload, humidity: e.target.value })}
                       className="border p-2 rounded mr-2"
                       required
                   />
                   <button
                       type="submit"
                       className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                       disabled={loading}
                   >
                       Send
                   </button>
               </form>

               <h3 className="text-xl font-semibold mb-2">Telemetry Data</h3>
               <LineChart
                   width={800}
                   height={400}
                   data={telemetry}
                   margin={{ top: 100, right: 300, left: 20, bottom: 5 }}
               >
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="timestamp" />
                   <YAxis />
                   <Tooltip />
                   <Legend />
                   <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
                   <Line type="monotone" dataKey="humidity" stroke="#82ca9d" />
               </LineChart>
               <ul className="space-y-2 mt-4">
                   {telemetry.map(t => (
                       <li key={t.id} className="p-2 border-b">
                           Device ID: {t.deviceId} - Payload: {t.payload} - Timestamp: {t.timestamp}
                       </li>
                   ))}
               </ul>

               <button
                   onClick={handleLogout}
                   className="bg-red-500 text-white px-4 py-2 rounded hover:bg-gray-600 mt-4"
               >
                   Logout
               </button>
           </div>
       );
   };

   export default DeviceList;