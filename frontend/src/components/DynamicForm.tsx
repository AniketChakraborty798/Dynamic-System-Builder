import { useState } from 'react';
import axios from 'axios';

const DynamicForm = ({ model }: { model: any }) => {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const tableName = model.name.toLowerCase() + 's';

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`http://localhost:3001/api/${tableName}`, formData, { headers });
      setMessage('Successfully created!');
      setFormData({});
      // Ideally trigger a re-fetch in the table, but this is a simple demo
      setTimeout(() => window.location.reload(), 1000); 
    } catch (err: any) {
      setMessage('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 mt-8">
      <h3 className="text-2xl font-semibold mb-6 text-gray-800">Add New {model.name}</h3>
      {message && <div className={`p-4 mb-6 rounded-md ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {model.fields.map((f: any) => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{f.name}</label>
            {f.type === 'enum' ? (
              <select
                name={f.name}
                value={formData[f.name] || ''}
                onChange={handleChange}
                required={f.required}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition-shadow bg-white"
              >
                <option value="">Select...</option>
                {f.options?.map((opt: string) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={f.type === 'number' ? 'number' : 'text'}
                name={f.name}
                value={formData[f.name] || ''}
                onChange={handleChange}
                required={f.required}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                placeholder={`Enter ${f.name}`}
              />
            )}
          </div>
        ))}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary hover:bg-blue-600 text-white font-semibold p-3 rounded-lg transition-colors shadow-md mt-4 disabled:opacity-50"
        >
          {loading ? 'Saving...' : `Create ${model.name}`}
        </button>
      </form>
    </div>
  );
};

export default DynamicForm;
