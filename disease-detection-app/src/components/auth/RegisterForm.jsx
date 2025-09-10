import React, { useState } from 'react';
import bgLight from '../../assets/bg_light3.jpg'; // Import the background image
import { User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '' // ✅ FIXED: Changed from confirmPassword to password2
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { register, loading, error, clearError } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (localError) setLocalError('');
    if (error) clearError();
    if (successMessage) setSuccessMessage('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      return 'Username is required';
    }
    if (formData.username.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (!formData.email.trim()) {
      return 'Email is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    if (!formData.password) {
      return 'Password is required';
    }
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!formData.password2) {
      return 'Please confirm your password';
    }
    if (formData.password !== formData.password2) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    try {
      console.log('Attempting registration with:', formData);
      const result = await register(formData); // ✅ Now sends password2 directly
      console.log('Registration successful:', result);
      
      // ✅ Show success message and redirect to login
      setSuccessMessage('Account created successfully! Redirecting to login...');
      
      // ✅ Redirect to login page after 2 seconds
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
      
    } catch (err) {
      console.error('Registration error:', err);
      setLocalError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${bgLight})` }}>
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner size="large" text="Creating your account..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center" style={{backgroundImage: `url(${bgLight})`,backgroundColor: 'rgba(100, 200, 155, 0.4)', backgroundBlendMode: 'overlay',paddingTop: '3rem'}}>
      <div className="flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join our disease detection platform</p>
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
                  placeholder="Choose a username"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-field"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
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
                    placeholder="Create a password"
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

              <div>
                <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="password2"
                    name="password2"
                    type={showPassword2 ? 'text' : 'password'}
                    required
                    className="input-field pr-12"
                    value={formData.password2}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword2(!showPassword2)}
                  >
                    {showPassword2 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <span className="text-gray-600">Already have an account? </span>
            <button
              onClick={onSwitchToLogin}
              className="text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;