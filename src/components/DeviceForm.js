import { useEffect, useState } from 'react';

const DeviceForm = ({ initialValues, onSubmit, onCancel }) => {
  const [device, setDevice] = useState({ id: '', name: '', status: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialValues) {
      setDevice(initialValues);
    } else {
      setDevice({ id: '', name: '', status: '' });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDevice(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSubmit(device);
      if (!initialValues) {
        setDevice({ id: '', name: '', status: '' }); // Reset form for add
      }
    } catch (error) {
      setError('Submission failed. Please check the input values.');
      console.error('Submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {/* <input
        type="text"
        name="id"
        placeholder="Device ID (e.g., device-001)"
        value={device.id}
        onChange={handleChange}
        className="border p-2 mb-2 w-full rounded"
        required
        disabled={initialValues} // Prevent editing ID for updates
      /> */}
      <input
        type="text"
        name="name"
        placeholder="Device Name"
        value={device.name}
        onChange={handleChange}
        className="border p-2 mb-2 w-full rounded"
        required
      />
      <input
        type="text"
        name="status"
        placeholder="Status (e.g., active, inactive)"
        value={device.status}
        onChange={handleChange}
        className="border p-2 mb-2 w-full rounded"
        required
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Submitting...' : initialValues ? 'Update Device' : 'Add Device'}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2"
        >
          Cancel
        </button>
      )}
    </form>
  );
};

export default DeviceForm;