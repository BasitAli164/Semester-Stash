// lib/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request('/api/auth/profile');
  }

  // Attendance endpoints
  async markAttendance(imageData = null) {
    const payload = imageData ? { image_data: imageData } : {};
    return this.request('/api/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getTodayAttendance() {
    return this.request('/api/attendance/today');
  }

  async getAttendanceHistory(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return this.request(`/api/attendance/history?${queryParams}`);
  }

  async getAttendanceStats() {
    return this.request('/api/attendance/stats');
  }

  // Face recognition endpoints
  async registerFaces(userId, images) {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });
    formData.append('user_id', userId);

    return this.request('/api/face/register', {
      method: 'POST',
      body: formData,
      headers: {
        // Let browser set Content-Type for FormData
      },
    });
  }

  async verifyFace(imageData) {
    return this.request('/api/face/verify', {
      method: 'POST',
      body: JSON.stringify({ image_data: imageData }),
    });
  }

  async recognizeFace(imageData) {
    return this.request('/api/face/recognize', {
      method: 'POST',
      body: JSON.stringify({ image_data: imageData }),
    });
  }
}

export const apiService = new ApiService();