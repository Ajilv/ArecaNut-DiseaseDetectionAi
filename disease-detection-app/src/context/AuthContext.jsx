import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api'; // ✅ Make sure this path is correct

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user_data');
        
        console.log('Auth check - Token:', !!token, 'UserData:', !!userData); // Debug
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          console.log('Setting user from localStorage:', parsedUser); // Debug
          setUser(parsedUser);
          
          // Optional: Verify token is still valid
          try {
            const profile = await authAPI.getProfile();
            console.log('Profile verified:', profile); // Debug
            setUser(profile);
          } catch (error) {
            console.log('Token invalid, clearing storage'); // Debug
            // Token invalid, clear storage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('AuthContext: Attempting login with:', credentials); // Debug
      const response = await authAPI.login(credentials);
      console.log('AuthContext: Login API response:', response); // Debug
      
      // ✅ FIXED: Handle different Django response formats
      let access, refresh, userData;
      
      if (response.access) {
        access = response.access;
        refresh = response.refresh;
        
        // ✅ If Django doesn't send user object, create one
        userData = response.user || {
          id: 1, // Default ID
          username: credentials.username,
          email: credentials.email || ''
        };
      } else {
        throw new Error('Invalid response: Missing access token');
      }

      console.log('Storing tokens and user:', { access: !!access, refresh: !!refresh, userData }); // Debug

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      console.log('Setting user state:', userData); // Debug
      setUser(userData);
      
      // ✅ Show success notification
      showNotification('Login successful! Welcome back!', 'success');
      
      return response;
    } catch (error) {
      console.error('AuthContext: Login failed:', error); // Debug
      const errorMessage = error.message || 'Login failed. Please try again.';
      setError(errorMessage);
      
      // ✅ Show error notification
      showNotification(errorMessage, 'error');
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('AuthContext: Attempting registration...'); // Debug
      const response = await authAPI.register(userData);
      console.log('AuthContext: Registration response:', response); // Debug
      
      // ✅ For registration, DON'T automatically log in
      // Show success message and let user go to login page
      showNotification('Account created successfully!', 'success');
      
      return response;
    } catch (error) {
      console.error('AuthContext: Registration failed:', error); // Debug
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      
      // ✅ Show error notification
      showNotification(errorMessage, 'error');
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      setUser(null);
      
      // ✅ Show logout notification
      showNotification('Logged out successfully', 'info');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ✅ Notification system
  const showNotification = (message, type = 'info') => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `
      fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium
      ${type === 'success' ? 'bg-green-600' : 
        type === 'error' ? 'bg-red-600' : 
        type === 'info' ? 'bg-blue-600' : 'bg-gray-600'}
      transform transition-transform duration-300 translate-x-full
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(full)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user,
  };

  console.log('AuthContext current state:', { user: !!user, loading, error }); // Debug

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};