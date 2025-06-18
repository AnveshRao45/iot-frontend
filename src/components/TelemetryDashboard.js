   import { Client } from '@stomp/stompjs';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import SockJS from 'sockjs-client';

   const TelemetryDashboard = ({ deviceId }) => {
       const [telemetry, setTelemetry] = useState([]);
       const [error, setError] = useState('');
       let stompClient = null;

       const getAuthHeader = () => {
           const token = localStorage.getItem('token');
           return token ? { Authorization: `Bearer ${token}` } : {};
       };

       const fetchTelemetry = async () => {
           try {
               const response = await axios.get(`http://localhost:8080/api/telemetry/device/${deviceId}`, {
                   headers: getAuthHeader(),
               });
               setTelemetry(response.data.map(item => ({
                   timestamp: new Date(item.timestamp).toLocaleTimeString(),
                   temperature: JSON.parse(item.payload).temperature,
                   humidity: JSON.parse(item.payload).humidity
               })));
               setError('');
           } catch (err) {
               setError('Failed to fetch telemetry.');
               console.error('Error fetching telemetry:', err);
           }
       };

       useEffect(() => {
           fetchTelemetry();

           const socket = new SockJS('http://localhost:8080/ws');
           stompClient = new Client({
               webSocketFactory: () => socket,
               onConnect: () => {
                   stompClient.subscribe(`/topic/telemetry/${deviceId}`, (message) => {
                       const newTelemetry = JSON.parse(message.body);
                       setTelemetry(prev => [...prev, {
                           timestamp: new Date(newTelemetry.timestamp).toLocaleTimeString(),
                           temperature: JSON.parse(newTelemetry.payload).temperature,
                           humidity: JSON.parse(newTelemetry.payload).humidity
                       }].slice(-50)); // Keep last 50 points
                   });
               },
               onStompError: (err) => {
                   setError('WebSocket connection failed.');
                   console.error('WebSocket error:', err);
               }
           });
           stompClient.activate();

           return () => {
               if (stompClient) stompClient.deactivate();
           };
       }, [deviceId]);

       return (
           <div className="container mx-auto p-4">
               <h2 className="text-2xl font-bold mb-4">Telemetry for Device: {deviceId}</h2>
               {error && <p className="text-red-500 mb-4">{error}</p>}
               <LineChart
                   width={800}
                   height={400}
                   data={telemetry}
                   margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
               >
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="timestamp" />
                   <YAxis />
                   <Tooltip />
                   <Legend />
                   <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
                   <Line type="monotone" dataKey="humidity" stroke="#82ca9d" />
               </LineChart>
               <div className="mt-4">
                   <h3 className="text-xl font-semibold mb-2">Recent Telemetry</h3>
                   <ul className="space-y-2">
                       {telemetry.slice(-10).map((t, index) => (
                           <li key={index} className="p-2 border-b">
                               Timestamp: {t.timestamp} - Temperature: {t.temperature}°C - Humidity: {t.humidity}%
                           </li>
                       ))}
                   </ul>
               </div>
           </div>
       );
   };

   export default TelemetryDashboard;