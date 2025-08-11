import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { SQL_COMMANDS } from '../../../../lib/init-supabase-tables'

export async function GET() {
  try {
    // Test basic Supabase connection
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })

    const response = {
      connection: 'success',
      timestamp: new Date().toISOString(),
      supabaseUrl: 'https://fpzoowjaorzrrvkyvprj.supabase.co',
      environment: process.env.NODE_ENV,
      tablesTest: {}
    }

    // Test each table
    const tables = ['users', 'shifts', 'location_perimeter']
    
    for (const table of tables) {
      try {
        const { data: tableData, error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        response.tablesTest[table] = {
          exists: !tableError,
          error: tableError?.message || null,
          hasData: tableData && tableData.length > 0
        }
      } catch (err) {
        response.tablesTest[table] = {
          exists: false,
          error: err.message,
          hasData: false
        }
      }
    }

    // Add SQL commands for manual table creation
    response.sqlCommands = {
      message: 'If tables do not exist, run these SQL commands in Supabase Studio SQL Editor:',
      commands: SQL_COMMANDS
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({
      connection: 'failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Attempt to create tables manually
    const results = {}
    
    // Create users table
    try {
      const { error: usersError } = await supabase.rpc('exec_sql', {
        sql: SQL_COMMANDS.users
      })
      results.users = { success: !usersError, error: usersError?.message }
    } catch (err) {
      results.users = { success: false, error: err.message }
    }

    // Create shifts table  
    try {
      const { error: shiftsError } = await supabase.rpc('exec_sql', {
        sql: SQL_COMMANDS.shifts
      })
      results.shifts = { success: !shiftsError, error: shiftsError?.message }
    } catch (err) {
      results.shifts = { success: false, error: err.message }
    }

    // Create location_perimeter table
    try {
      const { error: locationError } = await supabase.rpc('exec_sql', {
        sql: SQL_COMMANDS.location_perimeter
      })
      results.location_perimeter = { success: !locationError, error: locationError?.message }
    } catch (err) {
      results.location_perimeter = { success: false, error: err.message }
    }

    return NextResponse.json({
      message: 'Table creation attempted',
      results,
      note: 'If RPC calls failed, you may need to create tables manually in Supabase Studio',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to create tables',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
