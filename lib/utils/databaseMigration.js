import { userService } from '../services/userService.js';
import { dbShiftService, locationService } from '../services/dbShiftService.js';

export const migrateDemoDataToDatabase = async () => {
  try {
    console.log('Starting database migration...');

    // Create demo users in database
    const demoUsers = [
      {
        username: "manager",
        password: "password123",
        role: "manager"
      },
      {
        username: "alice",
        password: "password123",
        role: "care_worker"
      },
      {
        username: "bob", 
        password: "password123",
        role: "care_worker"
      },
      {
        username: "carol",
        password: "password123", 
        role: "care_worker"
      }
    ];

    const createdUsers = {};
    for (const userData of demoUsers) {
      try {
        const user = await userService.createUser(userData);
        createdUsers[userData.username] = user;
        console.log(`Created user: ${userData.username}`);
      } catch (error) {
        // User might already exist, try to find them
        const existingUser = await userService.findUserByUsername(userData.username);
        if (existingUser) {
          createdUsers[userData.username] = existingUser;
          console.log(`User already exists: ${userData.username}`);
        } else {
          console.error(`Failed to create user ${userData.username}:`, error);
        }
      }
    }

    // Create demo shifts (last week)
    const now = new Date();
    const shiftsCreated = [];
    
    for (let i = 7; i >= 1; i--) {
      const shiftDate = new Date();
      shiftDate.setDate(now.getDate() - i);
      
      // Alice's shifts
      if (createdUsers.alice) {
        try {
          const aliceClockIn = new Date(shiftDate);
          aliceClockIn.setHours(8, 0, 0, 0);
          
          const shift = await dbShiftService.clockIn(
            createdUsers.alice.id,
            'alice',
            { latitude: 51.5074, longitude: -0.1278 },
            i % 3 === 0 ? "Started early today" : null
          );

          // Clock out immediately for completed shifts
          const aliceClockOut = new Date(shiftDate);
          aliceClockOut.setHours(16, 30, 0, 0);
          
          await dbShiftService.clockOut(
            createdUsers.alice.id,
            { latitude: 51.5075, longitude: -0.1279 },
            i % 4 === 0 ? "Finished all tasks" : null
          );

          shiftsCreated.push(`Alice shift ${i}`);
        } catch (error) {
          console.log(`Alice shift ${i} might already exist or DB error:`, error.message);
        }
      }

      // Bob's shifts (missed one day)
      if (createdUsers.bob && i !== 3) {
        try {
          await dbShiftService.clockIn(
            createdUsers.bob.id,
            'bob',
            { latitude: 51.5076, longitude: -0.1277 },
            i % 2 === 0 ? "Traffic was heavy" : null
          );

          await dbShiftService.clockOut(
            createdUsers.bob.id,
            { latitude: 51.5074, longitude: -0.1280 },
            null
          );

          shiftsCreated.push(`Bob shift ${i}`);
        } catch (error) {
          console.log(`Bob shift ${i} might already exist or DB error:`, error.message);
        }
      }

      // Carol's shifts (part-time, only 3 days)
      if (createdUsers.carol && i <= 3) {
        try {
          await dbShiftService.clockIn(
            createdUsers.carol.id,
            'carol',
            { latitude: 51.5073, longitude: -0.1281 },
            "Afternoon shift"
          );

          await dbShiftService.clockOut(
            createdUsers.carol.id,
            { latitude: 51.5072, longitude: -0.1282 },
            "All patients checked"
          );

          shiftsCreated.push(`Carol shift ${i}`);
        } catch (error) {
          console.log(`Carol shift ${i} might already exist or DB error:`, error.message);
        }
      }
    }

    // Add one current active shift for Bob
    if (createdUsers.bob) {
      try {
        await dbShiftService.clockIn(
          createdUsers.bob.id,
          'bob',
          { latitude: 51.5074, longitude: -0.1278 },
          "Starting another shift"
        );
        shiftsCreated.push('Bob active shift');
      } catch (error) {
        console.log('Bob active shift might already exist or DB error:', error.message);
      }
    }

    // Set location perimeter
    try {
      await locationService.setLocationPerimeter(51.5074, -0.1278, 2000);
      console.log('Location perimeter set');
    } catch (error) {
      console.log('Location perimeter might already exist or DB error:', error.message);
    }

    console.log('Database migration completed successfully!');
    console.log(`Created ${Object.keys(createdUsers).length} users`);
    console.log(`Created ${shiftsCreated.length} shifts`);
    
    return {
      users: createdUsers,
      shiftsCreated: shiftsCreated.length,
      success: true
    };
  } catch (error) {
    console.error('Database migration failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
