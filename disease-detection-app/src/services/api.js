import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.REFRESH}`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        window.location.reload();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API service functions
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Login failed');
    }
  },

  register: async (userData) => {
    try {
      const registerData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        password2: userData.password2
      };
      const response = await api.post(API_ENDPOINTS.REGISTER, registerData);
      return response.data;
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.username) {
          errorMessage = `Username: ${errorData.username[0]}`;
        } else if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`;
        } else if (errorData.password) {
          errorMessage = `Password: ${errorData.password[0]}`;
        } else if (errorData.password2) {
          errorMessage = `Confirm Password: ${errorData.password2[0]}`;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post(API_ENDPOINTS.LOGOUT, { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    }
  },

  getProfile: async () => {
    try {
      console.log('API: Fetching profile...');
      const response = await api.get(API_ENDPOINTS.PROFILE);
      console.log('API: Profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Profile error:', error.response?.data);
      throw new Error(error.response?.data?.error || 'Failed to fetch profile');
    }
  },

  updateProfile: async (data) => {
    try {
      console.log('API: Updating profile...');
      const response = await api.put(API_ENDPOINTS.PROFILE, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('API: Update profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Update profile error:', error.response?.data);
      throw new Error(error.response?.data?.error || 'Failed to update profile');
    }
  },

  createProfile: async (data) => {
    try {
      console.log('API: Creating profile...');
      const response = await api.post(API_ENDPOINTS.PROFILE, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('API: Create profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Create profile error:', error.response?.data);
      throw new Error(error.response?.data?.error || 'Failed to create profile');
    }
  }
};

export const analysisAPI = {
  analyze: async (imageFile) => {
    try {
      console.log('API: Uploading file:', imageFile.name);
      const formData = new FormData();
      formData.append('file', imageFile);
      console.log('API: FormData created, making request...');
      const response = await api.post(API_ENDPOINTS.ANALYZE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('API: Analysis response:', response.data);
      const data = response.data;
      return {
        id: data.id,
        prediction: data.result,
        confidence: 1.0,
        recommendations: data.recommendations,
        remedies: data.remedies,
        timestamp: data.created_at,
        file_url: data.file,
        symptoms: data.symptoms,
        additional_info: data.additional_info,
        result: data.result,
        created_at: data.created_at
      };
    } catch (error) {
      console.error('API: Analysis error:', error.response?.data);
      throw new Error(error.response?.data?.detail || error.response?.data?.error || 'Analysis failed');
    }
  },

  getHistory: async () => {
    try {
      console.log('API: Fetching history...');
      const response = await api.get(API_ENDPOINTS.HISTORY);
      console.log('API: History response:', response.data);
      
      let historyData;
      if (Array.isArray(response.data)) {
        historyData = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        historyData = response.data.results;
      } else {
        historyData = [];
      }
      
      const transformedData = historyData.map(item => ({
        id: item.id,
        prediction: item.result,
        confidence: 1.0,
        timestamp: item.created_at,
        file_url: item.file,
        recommendations: item.recommendations,
        remedies: item.remedies,
        symptoms: item.symptoms,
        additional_info: item.additional_info,
        result: item.result,
        created_at: item.created_at
      }));
      
      console.log('API: Transformed history:', transformedData);
      
      return {
        results: transformedData,
        count: transformedData.length
      };
    } catch (error) {
      console.error('API: History error:', error.response?.data);
      throw new Error('Failed to fetch history');
    }
  },

  getAnalysisById: async (id) => {
    try {
      console.log('API: Fetching analysis by ID:', id);
      const response = await api.get(`${API_ENDPOINTS.ANALYZE}${id}/`);
      console.log('API: Single analysis response:', response.data);
      
      const data = response.data;
      return {
        id: data.id,
        prediction: data.result,
        confidence: 1.0,
        recommendations: data.recommendations,
        remedies: data.remedies,
        timestamp: data.created_at,
        file_url: data.file,
        symptoms: data.symptoms,
        additional_info: data.additional_info,
        result: data.result,
        created_at: data.created_at
      };
    } catch (error) {
      console.error('API: Single analysis error:', error.response?.data);
      throw new Error('Failed to fetch analysis');
    }
  }
};

export default api;