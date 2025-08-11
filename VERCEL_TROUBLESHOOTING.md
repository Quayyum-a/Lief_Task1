# Vercel Login Error Troubleshooting Guide

## The Issue
You're getting a minified JavaScript error when trying to login on Vercel. This typically indicates a runtime error in the production build.

## Immediate Steps to Debug

### 1. Check Health Endpoints
First, test these endpoints on your Vercel deployment:

**Basic Health Check:**
```
https://your-app.vercel.app/api/health
```

**Database Health Check:**
```
https://your-app.vercel.app/api/health/db
```

### 2. Check Environment Variables in Vercel
Go to your Vercel project dashboard → Settings → Environment Variables

**Required Variables:**
```
DB_HOST=your-database-host
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=healthcare_shifts
NODE_ENV=production
```

### 3. Test Login API Directly
Try making a direct API call to test the login endpoint:

```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

## Common Causes and Solutions

### Cause 1: Missing Environment Variables
**Symptoms:** Database health check returns "Missing environment variables"
**Solution:** Add all required environment variables in Vercel dashboard

### Cause 2: Database Connection Issues
**Symptoms:** Database health check fails with connection errors
**Solutions:**
- Ensure your database allows connections from Vercel IPs
- Check if your database is running and accessible
- Verify database credentials are correct
- For cloud databases, ensure SSL is properly configured

### Cause 3: Build-time vs Runtime Issues
**Symptoms:** App builds successfully but fails at runtime
**Solutions:**
- Check Vercel function logs for runtime errors
- Ensure all imports are correctly resolved
- Verify Next.js configuration is compatible with Vercel

### Cause 4: Database Schema Issues
**Symptoms:** Database connection works but queries fail
**Solutions:**
- Ensure database tables exist
- Check if auto-initialization is working
- Manually create tables if needed

## Database Schema Setup
If tables don't exist, create them manually:

```sql
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('manager', 'care_worker') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shifts (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  username VARCHAR(100) NOT NULL,
  clock_in_time TIMESTAMP NOT NULL,
  clock_in_latitude DECIMAL(10, 8),
  clock_in_longitude DECIMAL(11, 8),
  clock_in_note TEXT,
  clock_out_time TIMESTAMP NULL,
  clock_out_latitude DECIMAL(10, 8) NULL,
  clock_out_longitude DECIMAL(11, 8) NULL,
  clock_out_note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS location_perimeter (
  id INT AUTO_INCREMENT PRIMARY KEY,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius INT NOT NULL DEFAULT 2000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Debug Steps

### 1. Enable Detailed Logging
Check Vercel function logs:
1. Go to Vercel dashboard
2. Navigate to your project
3. Go to "Functions" tab
4. Look for runtime errors

### 2. Test Registration First
Try registering a new user first:
```
https://your-app.vercel.app/register
```

### 3. Check Browser Console
Open browser dev tools and check for:
- Network errors (404, 500, etc.)
- JavaScript console errors
- Failed API calls

### 4. Test with Simple Credentials
Try creating a test user with simple credentials:
- Username: `test`
- Password: `test123`
- Role: `manager`

## Fixes Applied

The following improvements have been made to help resolve the issue:

1. **Removed invalid MySQL2 configuration options** that were causing warnings
2. **Added comprehensive error handling** in all API routes
3. **Improved health check endpoints** with detailed debugging information
4. **Added environment variable validation** to quickly identify missing config
5. **Enhanced database connection handling** for serverless environments

## Next Steps

1. **Redeploy to Vercel** with the latest fixes
2. **Test health endpoints** to ensure basic functionality
3. **Set environment variables** if they're missing
4. **Try registration/login** with test credentials
5. **Check function logs** if issues persist

## If Issues Persist

1. **Clear Vercel cache** and redeploy
2. **Check database provider settings** (firewall, SSL, etc.)
3. **Test with a different database** to isolate the issue
4. **Contact Vercel support** if the issue appears to be platform-related

The minified error suggests the issue is happening at runtime, most likely during the authentication process when trying to connect to the database or process the login request.
