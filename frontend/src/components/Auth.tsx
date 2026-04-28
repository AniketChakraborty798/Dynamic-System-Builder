import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useContext(AuthContext);
  const { t } = useTranslation();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? 'login' : 'register';
    try {
      const res = await axios.post(`http://localhost:3001/api/auth/${endpoint}`, { email, password });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
      } else {
        setIsLogin(true); // Switch to login after register
        alert('Registered! Please login.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="flex justify-center items-center py-20">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">{isLogin ? t('Login') : 'Register'}</h2>
        {error && <div className="p-3 mb-6 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-shadow"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-shadow"
              required 
            />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-bold p-3 rounded-lg transition-colors shadow-md mt-4">
            {isLogin ? t('Login') : 'Register'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
