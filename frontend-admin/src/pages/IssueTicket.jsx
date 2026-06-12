import { useState, useEffect } from 'react';
import { issueFine, getDrivers, me } from '../services/api';

export default function IssueTicket() {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [officer, setOfficer] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch logged-in officer details and list of drivers
    const fetchData = async () => {
      try {
        const currentUser = await me();
        setOfficer(currentUser);
        
        const driversList = await getDrivers();
        setDrivers(driversList);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setMessage({ type: 'error', text: 'Failed to load driver data.' });
      }
    };
    
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!officer || !officer.id) {
      setMessage({ type: 'error', text: 'Officer information not found. Please log in again.' });
      setLoading(false);
      return;
    }

    try {
      await issueFine(selectedDriverId, officer.id, parseFloat(amount), description);
      setMessage({ type: 'success', text: 'Traffic fine issued successfully!' });
      
      // Reset form
      setSelectedDriverId('');
      setAmount('');
      setDescription('');
    } catch (error) {
      console.error("Error issuing fine:", error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || error.response?.data || 'Failed to issue the fine. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Issue New Traffic Fine</h2>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="driver" className="block text-sm font-medium text-gray-700 mb-1">
            Select Driver
          </label>
          <select
            id="driver"
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>-- Select a Driver --</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.displayName || driver.username} {driver.phoneNumber ? `(${driver.phoneNumber})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Fine Amount (LKR)
          </label>
          <input
            type="number"
            id="amount"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="e.g. 1500"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Violation Description
          </label>
          <textarea
            id="description"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Describe the traffic violation..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors`}
        >
          {loading ? 'Processing...' : 'Issue Fine'}
        </button>
      </form>
    </div>
  );
}