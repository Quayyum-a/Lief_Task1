import { apiService } from './apiService.js';

export class ShiftService {
  static async getShifts() {
    try {
      return await apiService.getAllShifts();
    } catch (error) {
      console.error('API error, falling back to localStorage:', error);
      if (typeof window === 'undefined') return [];
      return JSON.parse(localStorage.getItem("shifts") || "[]");
    }
  }

  static async clockIn(userId, username, location, note = null) {
    try {
      return await apiService.clockIn(userId, username, location, note);
    } catch (error) {
      console.error('API error, falling back to localStorage:', error);
      // Fallback to localStorage
      if (typeof window === 'undefined') throw error;

      const shifts = JSON.parse(localStorage.getItem("shifts") || "[]");
      const activeShift = shifts.find((s) => s.userId === userId && !s.clockOutTime);

      if (activeShift) {
        throw new Error('User already has an active shift');
      }

      const shift = {
        id: `shift-${Date.now()}`,
        userId,
        username,
        clockInTime: new Date().toISOString(),
        clockInLocation: location,
        clockInNote: note,
        clockOutTime: null,
        clockOutLocation: null,
        clockOutNote: null
      };

      shifts.push(shift);
      localStorage.setItem("shifts", JSON.stringify(shifts));
      return shift;
    }
  }

  static async clockOut(userId, location, note = null) {
    try {
      return await apiService.clockOut(userId, location, note);
    } catch (error) {
      console.error('API error, falling back to localStorage:', error);
      // Fallback to localStorage
      if (typeof window === 'undefined') throw error;

      const shifts = JSON.parse(localStorage.getItem("shifts") || "[]");
      const activeShiftIndex = shifts.findIndex((s) => s.userId === userId && !s.clockOutTime);

      if (activeShiftIndex === -1) {
        throw new Error('No active shift found for user');
      }

      shifts[activeShiftIndex].clockOutTime = new Date().toISOString();
      shifts[activeShiftIndex].clockOutLocation = location;
      shifts[activeShiftIndex].clockOutNote = note;

      localStorage.setItem("shifts", JSON.stringify(shifts));
      return shifts[activeShiftIndex];
    }
  }

  static async getCurrentShift(userId) {
    try {
      return await apiService.getCurrentShift(userId);
    } catch (error) {
      console.error('API error, falling back to localStorage:', error);
      if (typeof window === 'undefined') return null;
      const shifts = JSON.parse(localStorage.getItem("shifts") || "[]");
      return shifts.find((s) => s.userId === userId && !s.clockOutTime) || null;
    }
  }

  static async getShiftsByUser(userId) {
    try {
      return await apiService.getUserShifts(userId);
    } catch (error) {
      console.error('API error, falling back to localStorage:', error);
      if (typeof window === 'undefined') return [];
      const shifts = JSON.parse(localStorage.getItem("shifts") || "[]");
      return shifts.filter((s) => s.userId === userId);
    }
  }

  static async getActiveShifts() {
    try {
      return await apiService.getActiveShifts();
    } catch (error) {
      console.error('API error, falling back to localStorage:', error);
      if (typeof window === 'undefined') return [];
      const shifts = JSON.parse(localStorage.getItem("shifts") || "[]");
      return shifts.filter((s) => !s.clockOutTime);
    }
  }

  static async getShiftsInDateRange(startDate, endDate) {
    try {
      const allShifts = await apiService.getAllShifts();
      return allShifts.filter((s) => {
        const shiftDate = new Date(s.clockInTime);
        return shiftDate >= startDate && shiftDate <= endDate;
      });
    } catch (error) {
      console.error('API error, falling back to localStorage:', error);
      if (typeof window === 'undefined') return [];
      const shifts = JSON.parse(localStorage.getItem("shifts") || "[]");
      return shifts.filter((s) => {
        const shiftDate = new Date(s.clockInTime);
        return shiftDate >= startDate && shiftDate <= endDate;
      });
    }
  }

  // Legacy methods for backward compatibility
  static saveShift(shift) {
    if (typeof window === 'undefined') return shift;
    const shifts = JSON.parse(localStorage.getItem("shifts") || "[]");
    shifts.push(shift);
    localStorage.setItem("shifts", JSON.stringify(shifts));
    return shift;
  }

  static updateShift(shiftId, updates) {
    if (typeof window === 'undefined') return null;
    const shifts = JSON.parse(localStorage.getItem("shifts") || "[]");
    const index = shifts.findIndex((s) => s.id === shiftId);
    if (index !== -1) {
      shifts[index] = { ...shifts[index], ...updates };
      localStorage.setItem("shifts", JSON.stringify(shifts));
      return shifts[index];
    }
    return null;
  }
}

export class LocationService {
  static async getPerimeter() {
    try {
      return await apiService.getLocationPerimeter();
    } catch (error) {
      console.error('API error, falling back to localStorage:', error);
      if (typeof window === 'undefined') {
        return {
          latitude: 51.5074,
          longitude: -0.1278,
          radius: 2000,
        };
      }
      const saved = localStorage.getItem("locationPerimeter");
      return saved
        ? JSON.parse(saved)
        : {
            latitude: 51.5074,
            longitude: -0.1278,
            radius: 2000,
          };
    }
  }

  static async setPerimeter(latitude, longitude, radius) {
    try {
      return await apiService.setLocationPerimeter(latitude, longitude, radius);
    } catch (error) {
      console.error('API error, falling back to localStorage:', error);
      const perimeter = { latitude, longitude, radius };
      if (typeof window !== 'undefined') {
        localStorage.setItem("locationPerimeter", JSON.stringify(perimeter));
      }
      return perimeter;
    }
  }

  static getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error("Geolocation not available on server"));
        return;
      }

      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
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
  }

  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  static async isWithinPerimeter(userLat, userLon) {
    const perimeter = await this.getPerimeter();
    const distance = this.calculateDistance(
      userLat,
      userLon,
      perimeter.latitude,
      perimeter.longitude
    );
    return distance <= perimeter.radius;
  }
}
