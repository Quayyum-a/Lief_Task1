// API configuration
const API_BASE_URL = import.meta?.env?.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to make API calls
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: (username, password) =>
    apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (userData) =>
    apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
};

// Shifts API
export const shiftsAPI = {
  getAllShifts: () => apiCall('/api/shifts'),
  
  getUserShifts: (userId) => apiCall(`/api/shifts?userId=${userId}`),
  
  getActiveShifts: () => apiCall('/api/shifts?activeOnly=true'),
  
  getCurrentShift: (userId) => 
    apiCall(`/api/shifts?userId=${userId}&activeOnly=true`)
      .then(data => data.shifts[0] || null),

  clockIn: (userId, username, location, note = null) =>
    apiCall('/api/shifts', {
      method: 'POST',
      body: JSON.stringify({
        action: 'clockIn',
        userId,
        username,
        location,
        note,
      }),
    }),

  clockOut: (userId, location, note = null) =>
    apiCall('/api/shifts', {
      method: 'POST',
      body: JSON.stringify({
        action: 'clockOut',
        userId,
        location,
        note,
      }),
    }),
};

// Location API
export const locationAPI = {
  getPerimeter: () => apiCall('/api/location/perimeter'),
  
  setPerimeter: (latitude, longitude, radius) =>
    apiCall('/api/location/perimeter', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, radius }),
    }),
};

// Location utilities
export const locationUtils = {
  getCurrentPosition: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  },

  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  },

  isWithinPerimeter: async (userLat, userLon) => {
    try {
      const { perimeter } = await locationAPI.getPerimeter();
      const distance = locationUtils.calculateDistance(
        userLat,
        userLon,
        perimeter.latitude,
        perimeter.longitude
      );
      return distance <= perimeter.radius;
    } catch (error) {
      console.error('Error checking perimeter:', error);
      return false;
    }
  },
};
