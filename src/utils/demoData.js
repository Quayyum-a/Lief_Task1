// Demo data initialization for testing the application
export const initializeDemoData = () => {
  // Clear existing data
  localStorage.clear();

  // Create demo users
  const demoUsers = [
    {
      id: "manager-1",
      username: "manager",
      password: "password123",
      role: "manager",
      createdAt: "2024-01-01T10:00:00.000Z"
    },
    {
      id: "care-1", 
      username: "alice",
      password: "password123",
      role: "care_worker",
      createdAt: "2024-01-01T10:00:00.000Z"
    },
    {
      id: "care-2",
      username: "bob", 
      password: "password123",
      role: "care_worker",
      createdAt: "2024-01-02T10:00:00.000Z"
    },
    {
      id: "care-3",
      username: "carol",
      password: "password123", 
      role: "care_worker",
      createdAt: "2024-01-03T10:00:00.000Z"
    }
  ];

  // Create demo shifts (last week)
  const now = new Date();
  const demoShifts = [];
  
  for (let i = 7; i >= 1; i--) {
    const shiftDate = new Date();
    shiftDate.setDate(now.getDate() - i);
    
    // Alice's shifts
    const aliceClockIn = new Date(shiftDate);
    aliceClockIn.setHours(8, 0, 0, 0);
    const aliceClockOut = new Date(shiftDate);
    aliceClockOut.setHours(16, 30, 0, 0);
    
    demoShifts.push({
      id: `alice-shift-${i}`,
      userId: "care-1",
      username: "alice",
      clockInTime: aliceClockIn.toISOString(),
      clockInLocation: { latitude: 51.5074, longitude: -0.1278 },
      clockInNote: i % 3 === 0 ? "Started early today" : null,
      clockOutTime: aliceClockOut.toISOString(),
      clockOutLocation: { latitude: 51.5075, longitude: -0.1279 },
      clockOutNote: i % 4 === 0 ? "Finished all tasks" : null
    });

    // Bob's shifts (missed one day)
    if (i !== 3) {
      const bobClockIn = new Date(shiftDate);
      bobClockIn.setHours(9, 15, 0, 0);
      const bobClockOut = new Date(shiftDate);
      bobClockOut.setHours(17, 45, 0, 0);
      
      demoShifts.push({
        id: `bob-shift-${i}`,
        userId: "care-2", 
        username: "bob",
        clockInTime: bobClockIn.toISOString(),
        clockInLocation: { latitude: 51.5076, longitude: -0.1277 },
        clockInNote: i % 2 === 0 ? "Traffic was heavy" : null,
        clockOutTime: bobClockOut.toISOString(),
        clockOutLocation: { latitude: 51.5074, longitude: -0.1280 },
        clockOutNote: null
      });
    }

    // Carol's shifts (part-time, only 3 days)
    if (i <= 3) {
      const carolClockIn = new Date(shiftDate);
      carolClockIn.setHours(13, 0, 0, 0);
      const carolClockOut = new Date(shiftDate);
      carolClockOut.setHours(18, 0, 0, 0);
      
      demoShifts.push({
        id: `carol-shift-${i}`,
        userId: "care-3",
        username: "carol", 
        clockInTime: carolClockIn.toISOString(),
        clockInLocation: { latitude: 51.5073, longitude: -0.1281 },
        clockInNote: "Afternoon shift",
        clockOutTime: carolClockOut.toISOString(),
        clockOutLocation: { latitude: 51.5072, longitude: -0.1282 },
        clockOutNote: "All patients checked"
      });
    }
  }

  // Add one current active shift for Bob
  const bobActiveClockIn = new Date();
  bobActiveClockIn.setHours(bobActiveClockIn.getHours() - 2); // Started 2 hours ago
  
  demoShifts.push({
    id: "bob-current",
    userId: "care-2",
    username: "bob", 
    clockInTime: bobActiveClockIn.toISOString(),
    clockInLocation: { latitude: 51.5074, longitude: -0.1278 },
    clockInNote: "Starting another shift",
    clockOutTime: null,
    clockOutLocation: null,
    clockOutNote: null
  });

  // Set location perimeter (London coordinates)
  const locationPerimeter = {
    latitude: 51.5074,
    longitude: -0.1278,
    radius: 2000
  };

  // Store data in localStorage
  localStorage.setItem('users', JSON.stringify(demoUsers));
  localStorage.setItem('shifts', JSON.stringify(demoShifts));
  localStorage.setItem('locationPerimeter', JSON.stringify(locationPerimeter));

  console.log('Demo data initialized successfully!');
  console.log('Demo accounts:');
  console.log('Manager: username="manager", password="password123"');
  console.log('Care Workers: username="alice"|"bob"|"carol", password="password123"');
  
  return {
    users: demoUsers,
    shifts: demoShifts,
    perimeter: locationPerimeter
  };
};

export const clearDemoData = () => {
  localStorage.clear();
  console.log('Demo data cleared!');
};
