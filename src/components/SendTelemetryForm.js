   import React, { useState } from 'react';
   import axios from 'axios';

   const SendTelemetryForm = ({ deviceId }) => {
       const [temperature, setTemperature] = useState('');
       const [humidity, setHumidity] = useState('');
       const [error, setError] = useState('');
       const [success, setSuccess] = useState('');

       const handleSubmit = async (e) => {
           e.preventDefault();
           try {
               const token = localStorage.getItem('token');
               const payload = JSON.stringify({ temperature: parseFloat(temperature), humidity: parseFloat(humidity) });
               await axios.post('http://localhost:8080/api/telemetry/send', { payload }, {
                   headers: { Authorization: `Bearer ${token}` }
               });
               setSuccess('Telemetry sent successfully!');
               setError('');
               setTemperature('');
               setHumidity('');
           } catch (err) {
               setError('Failed to send telemetry: ' + err.message);
               setSuccess('');
           }
       };

       return (
           <div className="p-4">
               <h2 className="text-2xl mb-4">Send Telemetry for Device: {deviceId}</h2>
               <form onSubmit={handleSubmit} className="space-y-4">
                   <div>
                       <label className="block">Temperature (°C):</label>
                       <input
                           type="number"
                           value={temperature}
                           onChange={(e) => setTemperature(e.target.value)}
                           className="border p-2 w-full"
                           required
                       />
                   </div>
                   <div>
                       <label className="block">Humidity (%):</label>
                       <input
                           type="number"
                           value={humidity}
                           onChange={(e) => setHumidity(e.target.value)}
                           className="border p-2 w-full"
                           required
                       />
                   </div>
                   <button type="submit" className="bg-blue-500 text-white p-2 rounded">Send Telemetry</button>
                   {error && <p className="text-red-500">{error}</p>}
                   {success && <p className="text-green-500">{success}</p>}
               </form>
           </div>
       );
   };

   export default SendTelemetryForm;