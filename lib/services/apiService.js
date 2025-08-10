// Client-side API service that communicates with the backend API routes

export const apiService = {
  // Shift operations
  async clockIn(userId, username, location, note = null) {
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
      console.error('Clock in API error:', error);
      throw error;
    }
  },

  async clockOut(userId, location, note = null) {
    try {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clockOut',
          userId,
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
      console.error('Clock out API error:', error);
      throw error;
    }
  },

  async getCurrentShift(userId) {
    try {
      const response = await fetch(`/api/shifts?userId=${userId}&activeOnly=true`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get current shift');
      }

      return data.shifts[0] || null;
    } catch (error) {
      console.error('Get current shift API error:', error);
      throw error;
    }
  },

  async getUserShifts(userId) {
    try {
      const response = await fetch(`/api/shifts?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get user shifts');
      }

      return data.shifts;
    } catch (error) {
      console.error('Get user shifts API error:', error);
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

      return data.shifts;
    } catch (error) {
      console.error('Get all shifts API error:', error);
      throw error;
    }
  },

  async getActiveShifts() {
    try {
      const response = await fetch('/api/shifts?activeOnly=true');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get active shifts');
      }

      return data.shifts;
    } catch (error) {
      console.error('Get active shifts API error:', error);
      throw error;
    }
  },

  // Location operations
  async getLocationPerimeter() {
    try {
      const response = await fetch('/api/location/perimeter');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get location perimeter');
      }

      return data.perimeter;
    } catch (error) {
      console.error('Get perimeter API error:', error);
      throw error;
    }
  },

  async setLocationPerimeter(latitude, longitude, radius) {
    try {
      const response = await fetch('/api/location/perimeter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude, radius }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set location perimeter');
      }

      return data.perimeter;
    } catch (error) {
      console.error('Set perimeter API error:', error);
      throw error;
    }
  },

};
