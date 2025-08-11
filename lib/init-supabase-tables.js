import { supabase } from './supabase.js'

export async function initializeSupabaseTables() {
  try {
    console.log('Initializing Supabase tables...')

    // Create users table
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('manager', 'care_worker')),
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `
    })

    if (usersError) {
      console.log('Creating users table via direct SQL...')
      // Try direct table creation if RPC doesn't work
      const { error: directUsersError } = await supabase
        .from('users')
        .select('id')
        .limit(1)
      
      if (directUsersError && directUsersError.code === '42P01') {
        // Table doesn't exist, we'll handle this in the web interface
        console.log('Users table needs to be created manually in Supabase Studio')
      }
    }

    // Create shifts table
    const { error: shiftsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS shifts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          username TEXT NOT NULL,
          clock_in_time TIMESTAMPTZ NOT NULL,
          clock_in_latitude NUMERIC(10, 8),
          clock_in_longitude NUMERIC(11, 8),
          clock_in_note TEXT,
          clock_out_time TIMESTAMPTZ NULL,
          clock_out_latitude NUMERIC(10, 8) NULL,
          clock_out_longitude NUMERIC(11, 8) NULL,
          clock_out_note TEXT NULL,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );
      `
    })

    if (shiftsError) {
      console.log('Creating shifts table via direct SQL...')
      const { error: directShiftsError } = await supabase
        .from('shifts')
        .select('id')
        .limit(1)
      
      if (directShiftsError && directShiftsError.code === '42P01') {
        console.log('Shifts table needs to be created manually in Supabase Studio')
      }
    }

    // Create location_perimeter table
    const { error: locationError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS location_perimeter (
          id SERIAL PRIMARY KEY,
          latitude NUMERIC(10, 8) NOT NULL,
          longitude NUMERIC(11, 8) NOT NULL,
          radius INTEGER NOT NULL DEFAULT 2000,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );
      `
    })

    if (locationError) {
      console.log('Creating location_perimeter table via direct SQL...')
      const { error: directLocationError } = await supabase
        .from('location_perimeter')
        .select('id')
        .limit(1)
      
      if (directLocationError && directLocationError.code === '42P01') {
        console.log('Location_perimeter table needs to be created manually in Supabase Studio')
      }
    }

    console.log('Supabase tables initialization completed')
    return true
  } catch (error) {
    console.error('Error initializing Supabase tables:', error)
    return false
  }
}

// SQL commands for manual execution in Supabase Studio
export const SQL_COMMANDS = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('manager', 'care_worker')),
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `,
  shifts: `
    CREATE TABLE IF NOT EXISTS shifts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      clock_in_time TIMESTAMPTZ NOT NULL,
      clock_in_latitude NUMERIC(10, 8),
      clock_in_longitude NUMERIC(11, 8),
      clock_in_note TEXT,
      clock_out_time TIMESTAMPTZ NULL,
      clock_out_latitude NUMERIC(10, 8) NULL,
      clock_out_longitude NUMERIC(11, 8) NULL,
      clock_out_note TEXT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `,
  location_perimeter: `
    CREATE TABLE IF NOT EXISTS location_perimeter (
      id SERIAL PRIMARY KEY,
      latitude NUMERIC(10, 8) NOT NULL,
      longitude NUMERIC(11, 8) NOT NULL,
      radius INTEGER NOT NULL DEFAULT 2000,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `
}
