// Shift Service - Updated for Supabase backend
export const ShiftService = {
  async clockIn(userId, username, location, note = '') {
    try {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clockIn',
          userId,
          username,
          location,
          note
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Clock in failed');
      }

      return data.shift;
    } catch (error) {
      console.error('Clock in error:', error);
      throw error;
    }
  },

  async clockOut(userId, username, location, note = '') {
    try {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clockOut',
          userId,
          username,
          location,
          note
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Clock out failed');
      }

      return data.shift;
    } catch (error) {
      console.error('Clock out error:', error);
      throw error;
    }
  },

  async getActiveShift(userId) {
    try {
      const response = await fetch(`/api/shifts?userId=${userId}&activeOnly=true`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get active shift');
      }

      return data.shifts && data.shifts.length > 0 ? data.shifts[0] : null;
    } catch (error) {
      console.error('Get active shift error:', error);
      throw error;
    }
  },

  async getUserShifts(userId) {
    try {
      const response = await fetch(`/api/shifts?userId=${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get shifts');
      }

      return data.shifts || [];
    } catch (error) {
      console.error('Get user shifts error:', error);
      throw error;
    }
  },

  async getAllShifts() {
    try {
      const response = await fetch('/api/shifts');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get all shifts');
      }

      return data.shifts || [];
    } catch (error) {
      console.error('Get all shifts error:', error);
      throw error;
    }
  }
};

// Location Service
export const LocationService = {
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  },

  async getLocationPerimeter() {
    try {
      const response = await fetch('/api/location/perimeter');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get location perimeter');
      }

      return data.perimeter;
    } catch (error) {
      console.error('Get location perimeter error:', error);
      // Return default perimeter if API fails
      return {
        latitude: 0,
        longitude: 0,
        radius: 2000
      };
    }
  },

  async updateLocationPerimeter(latitude, longitude, radius = 2000) {
    try {
      const response = await fetch('/api/location/perimeter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude,
          radius
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update location perimeter');
      }

      return data.perimeter;
    } catch (error) {
      console.error('Update location perimeter error:', error);
      throw error;
    }
  },

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  },

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  },

  isWithinPerimeter(currentLat, currentLon, perimeterLat, perimeterLon, radius) {
    const distance = this.calculateDistance(currentLat, currentLon, perimeterLat, perimeterLon);
    return distance <= radius;
  },

  // Additional methods for compatibility
  async getPerimeter() {
    try {
      const perimeter = await this.getLocationPerimeter();
      return perimeter || {
        latitude: '',
        longitude: '',
        radius: '2000'
      };
    } catch (error) {
      console.error('Error getting perimeter:', error);
      return {
        latitude: '',
        longitude: '',
        radius: '2000'
      };
    }
  },

  async setPerimeter(latitude, longitude, radius) {
    try {
      const result = await this.updateLocationPerimeter(latitude, longitude, radius);
      return result;
    } catch (error) {
      console.error('Error setting perimeter:', error);
      throw error;
    }
  }
};
