import React, { useState, useEffect } from 'react';
import bgLight from '../../assets/bg_light3.jpg'; 
import { Eye, EyeOff, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

const LoginForm = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { login, loading, error, clearError, user } = useAuth();

  // ✅ Redirect to dashboard when login is successful
  useEffect(() => {
    if (user) {
      setSuccessMessage('Login successful! Redirecting to dashboard...');
      // The App.jsx will automatically show the dashboard since user is now set
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (localError) setLocalError('');
    if (error) clearError();
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    // Basic validation
    if (!formData.username.trim()) {
      setLocalError('Username is required');
      return;
    }
    if (!formData.password) {
      setLocalError('Password is required');
      return;
    }

    try {
      console.log('Attempting login with:', formData);
      const result = await login(formData);
      console.log('Login successful:', result);
      
      // ✅ Success message (user state change will trigger redirect)
      setSuccessMessage('Login successful! Welcome back!');
      
    } catch (err) {
      console.error('Login error:', err);
      setLocalError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${bgLight})` }}>
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner size="large" text="Signing you in..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center" style={{
                  backgroundImage: `url(${bgLight})`,
                  backgroundColor: 'rgba(100, 200, 155, 0.4)', 
                  backgroundBlendMode: 'overlay',
                  paddingTop: '80px'
                }}>
      <div className="flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mt-[30px]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your disease detection account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="input-field"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input-field pr-12"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* ✅ Success Message */}
              {successMessage && (
                <div className="flex items-center space-x-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Error Message */}
              {(localError || error) && (
                <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{localError || error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <span className="text-gray-600">Don't have an account? </span>
            <button
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;