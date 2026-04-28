import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const DynamicTable = ({ model, allowCsvImport, config }: { model: any, allowCsvImport: boolean, config: any }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();
  
  const tableName = model.name.toLowerCase() + 's';

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`http://localhost:3001/api/${tableName}`, { headers });
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [model.name]);

  const handleCsvUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`http://localhost:3001/api/${tableName}/import`, formData, { headers });
      fetchData();
      alert('CSV Imported successfully!');
    } catch (err: any) {
      alert('CSV Import failed: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm('Are you sure?')) return;
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`http://localhost:3001/api/${tableName}/${id}`, { headers });
      fetchData();
    } catch (err: any) {
      alert('Delete failed: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <div className="text-center p-4">Loading data...</div>;
  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-md">Error: {error}</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-800">{t(model.name + ' Data')}</h3>
        {allowCsvImport && config.features?.csvImport && (
          <div>
            <label className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm font-medium">
              {t('Import CSV')}
              <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
            </label>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              {model.fields.map((f: any) => (
                <th key={f.name} className="p-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">{f.name}</th>
              ))}
              <th className="p-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any) => (
              <tr key={row.id} className="border-b hover:bg-gray-50 transition-colors">
                {model.fields.map((f: any) => (
                  <td key={f.name} className="p-4 text-gray-700">{row[f.name]}</td>
                ))}
                <td className="p-4">
                  <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={model.fields.length + 1} className="p-8 text-center text-gray-500">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DynamicTable;
