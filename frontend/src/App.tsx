import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import DynamicPage from './DynamicPage';
import AuthContext from './context/AuthContext';

function App() {
  const [config, setConfig] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Fetch config from backend
    axios.get('http://localhost:3001/api/config').then((res) => {
      setConfig(res.data);
      if (res.data.theme) {
        document.documentElement.style.setProperty('--color-primary', res.data.theme.primary);
        document.documentElement.style.setProperty('--color-background', res.data.theme.background);
      }
    }).catch(err => {
      console.error("Failed to load config", err);
      setError("Cannot connect to backend server. Is it running on port 3001?");
    });
    
    // Check local storage for auth
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (error) return <div className="p-10 text-center text-red-600 font-bold text-xl">{error}</div>;
  if (!config) return <div className="p-10 flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>;

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Router>
        <div className="min-h-screen flex flex-col">
          <nav className="bg-white shadow-md p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-primary">{config.appName}</h1>
            <div className="flex gap-4 items-center">
              {config.pages.map((p: any) => (
                <Link key={p.path} to={p.path} className="text-gray-600 hover:text-primary transition-colors">
                  {t(p.title)}
                </Link>
              ))}
              {config.features?.localization && (
                <select 
                  className="border rounded px-2 py-1 ml-4"
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  value={i18n.language}
                >
                  <option value="en">EN</option>
                  <option value="fr">FR</option>
                </select>
              )}
            </div>
          </nav>
          <main className="flex-grow p-6">
            <Routes>
              {config.pages.map((page: any) => (
                <Route 
                  key={page.path} 
                  path={page.path} 
                  element={<DynamicPage page={page} config={config} />} 
                />
              ))}
            </Routes>
          </main>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
