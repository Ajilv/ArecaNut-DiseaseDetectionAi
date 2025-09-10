export const API_BASE_URL = 'http://localhost:8000/api';
export const MEDIA_BASE_URL = 'http://127.0.0.1:8000'; 

export const API_ENDPOINTS = {
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  REFRESH: '/auth/refresh/',
  LOGOUT: '/auth/logout/',
  PROFILE: '/auth/profile/',
  ANALYZE: '/analysis/analyze/', 
  HISTORY: '/analysis/history/'  
};

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4
};