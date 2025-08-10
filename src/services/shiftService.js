import { shiftsAPI, locationUtils } from './api.js';

export class ShiftService {
  static async getShifts() {
    try {
      return await shiftsAPI.getAllShifts();
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }

  static async clockIn(userId, username, location, note = null) {
    try {
      const shift = await shiftsAPI.clockIn(userId, username, location, note);
      return shift.shift || shift;
    } catch (error) {
      console.error('Clock in API error:', error);
      throw error;
    }
  }

  static async clockOut(userId, location, note = null) {
    try {
      const shift = await shiftsAPI.clockOut(userId, location, note);
      return shift.shift || shift;
    } catch (error) {
      console.error('Clock out API error:', error);
      throw error;
    }
  }

  static async getCurrentShift(userId) {
    try {
      return await shiftsAPI.getCurrentShift(userId);
    } catch (error) {
      console.error('Get current shift API error:', error);
      throw error;
    }
  }

  static async getShiftsByUser(userId) {
    try {
      return await shiftsAPI.getUserShifts(userId);
    } catch (error) {
      console.error('Get user shifts API error:', error);
      throw error;
    }
  }

  static async getActiveShifts() {
    try {
      return await shiftsAPI.getActiveShifts();
    } catch (error) {
      console.error('Get active shifts API error:', error);
      throw error;
    }
  }
}

export class LocationService {
  static async getCurrentPosition() {
    try {
      return await locationUtils.getCurrentPosition();
    } catch (error) {
      console.error('Location error:', error);
      throw new Error('Unable to get your location. Please enable location services.');
    }
  }

  static async isWithinPerimeter(latitude, longitude) {
    try {
      return await locationUtils.isWithinPerimeter(latitude, longitude);
    } catch (error) {
      console.error('Perimeter check error:', error);
      return false;
    }
  }

  static calculateDistance(lat1, lon1, lat2, lon2) {
    return locationUtils.calculateDistance(lat1, lon1, lat2, lon2);
  }
}
