import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fpzoowjaorzrrvkyvprj.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwem9vd2phb3J6cnJ2a3l2cHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4ODg2NzAsImV4cCI6MjA3MDQ2NDY3MH0.4MT0Wv4yr4yWp81VlvjIokqfZIgDWb30qtG4swEMovQ'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize database tables
export const initializeSupabaseTables = async () => {
  try {
    // Create users table
    const { error: usersError } = await supabase.rpc('create_users_table', {})
    if (usersError && !usersError.message.includes('already exists')) {
      console.warn('Users table creation:', usersError.message)
    }

    // Create shifts table
    const { error: shiftsError } = await supabase.rpc('create_shifts_table', {})
    if (shiftsError && !shiftsError.message.includes('already exists')) {
      console.warn('Shifts table creation:', shiftsError.message)
    }

    // Create location_perimeter table
    const { error: locationError } = await supabase.rpc('create_location_perimeter_table', {})
    if (locationError && !locationError.message.includes('already exists')) {
      console.warn('Location perimeter table creation:', locationError.message)
    }

    console.log('Supabase tables initialized successfully!')
    return true
  } catch (error) {
    console.error('Supabase table initialization error:', error)
    return false
  }
}

// Helper functions for database operations
export const dbOperations = {
  // Users
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
    return { data, error }
  },

  async getUserByCredentials(username, password) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, role, created_at')
      .eq('username', username)
      .eq('password', password)
      .single()
    return { data, error }
  },

  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Shifts
  async createShift(shiftData) {
    const { data, error } = await supabase
      .from('shifts')
      .insert([shiftData])
      .select()
    return { data, error }
  },

  async updateShift(id, updateData) {
    const { data, error } = await supabase
      .from('shifts')
      .update(updateData)
      .eq('id', id)
      .select()
    return { data, error }
  },

  async getShiftsByUserId(userId) {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getAllShifts() {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getActiveShift(userId) {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('user_id', userId)
      .is('clock_out_time', null)
      .order('clock_in_time', { ascending: false })
      .limit(1)
      .single()
    return { data, error }
  },

  // Location perimeter
  async getLocationPerimeter() {
    const { data, error } = await supabase
      .from('location_perimeter')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    return { data, error }
  },

  async updateLocationPerimeter(locationData) {
    // First try to update existing record
    const { data: existing } = await supabase
      .from('location_perimeter')
      .select('id')
      .limit(1)
      .single()

    if (existing) {
      const { data, error } = await supabase
        .from('location_perimeter')
        .update(locationData)
        .eq('id', existing.id)
        .select()
      return { data, error }
    } else {
      // Create new record if none exists
      const { data, error } = await supabase
        .from('location_perimeter')
        .insert([locationData])
        .select()
      return { data, error }
    }
  }
}
