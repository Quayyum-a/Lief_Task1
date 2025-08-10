export class ShiftService {
  static getShifts() {
    return JSON.parse(localStorage.getItem("shifts") || "[]");
  }

  static saveShift(shift) {
    const shifts = this.getShifts();
    shifts.push(shift);
    localStorage.setItem("shifts", JSON.stringify(shifts));
    return shift;
  }

  static updateShift(shiftId, updates) {
    const shifts = this.getShifts();
    const index = shifts.findIndex((s) => s.id === shiftId);
    if (index !== -1) {
      shifts[index] = { ...shifts[index], ...updates };
      localStorage.setItem("shifts", JSON.stringify(shifts));
      return shifts[index];
    }
    return null;
  }

  static getCurrentShift(userId) {
    const shifts = this.getShifts();
    return shifts.find((s) => s.userId === userId && !s.clockOutTime);
  }

  static getShiftsByUser(userId) {
    const shifts = this.getShifts();
    return shifts.filter((s) => s.userId === userId);
  }

  static getActiveShifts() {
    const shifts = this.getShifts();
    return shifts.filter((s) => !s.clockOutTime);
  }

  static getShiftsInDateRange(startDate, endDate) {
    const shifts = this.getShifts();
    return shifts.filter((s) => {
      const shiftDate = new Date(s.clockInTime);
      return shiftDate >= startDate && shiftDate <= endDate;
    });
  }
}

export class LocationService {
  static getPerimeter() {
    const saved = localStorage.getItem("locationPerimeter");
    return saved
      ? JSON.parse(saved)
      : {
          latitude: 51.5074,
          longitude: -0.1278,
          radius: 2000,
        };
  }

  static setPerimeter(latitude, longitude, radius) {
    const perimeter = { latitude, longitude, radius };
    localStorage.setItem("locationPerimeter", JSON.stringify(perimeter));
    return perimeter;
  }

  static getCurrentPosition() {
    return new Promise((resolve, reject) => {
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

  static isWithinPerimeter(userLat, userLon) {
    const perimeter = this.getPerimeter();
    const distance = this.calculateDistance(
      userLat,
      userLon,
      perimeter.latitude,
      perimeter.longitude
    );
    return distance <= perimeter.radius;
  }
}
