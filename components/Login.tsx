
import React, { useState } from 'react';
import { AUTH_PASSWORD } from '../constants';

interface LoginProps {
  onLogin: (email: string) => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === AUTH_PASSWORD) {
      onLogin(email);
    } else {
      setError('Incorrect password. Please use the developer password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-store text-white text-2xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Access the promotion engine</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
              placeholder="name@business.com"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
              placeholder="••••••••"
            />
            {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
            <p className="text-xs text-gray-400 mt-2 italic">Hint: vfx@123</p>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-amber-200 transition-all mb-4"
          >
            LOGIN
          </button>
          
          <button 
            type="button"
            onClick={onBack}
            className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-all"
          >
            <i className="fas fa-arrow-left mr-2"></i>Back to Home
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
