# Full-Stack Vercel Deployment Guide

## Changes Made for Single Vercel Deployment

### ✅ **Converted to Next.js API Routes**
Instead of using Express server with rewrites, created native Next.js API routes:

- `app/api/auth/login/route.js` - User login
- `app/api/auth/register/route.js` - User registration  
- `app/api/shifts/route.js` - Shift management
- `app/api/location/perimeter/route.js` - Location settings
- `app/api/health/db/route.js` - Database health check

### ✅ **Removed CORS Issues**
- Simplified CORS configuration since frontend/backend are same domain
- No more cross-origin requests

### ✅ **Database Integration**
- Each API route includes database connection setup
- Auto-initializes database tables on first register request
- Uses mysql2 for database connectivity

## Environment Variables for Vercel

Set these in your Vercel project dashboard under **Settings > Environment Variables**:

```
# Database Configuration
DB_HOST=your-database-host
DB_USER=your-database-username  
DB_PASSWORD=your-database-password
DB_NAME=healthcare_shifts

# Optional: Node environment
NODE_ENV=production
```

## Deployment Steps

1. **Push your updated code to Git**
2. **Redeploy on Vercel** (it should auto-deploy from Git)
3. **Set environment variables** in Vercel dashboard
4. **Test the deployment**

## Testing Your Deployment

### 1. Health Check
Visit: `https://your-vercel-app.vercel.app/api/health/db`

Should return:
```json
{
  "status": "healthy",
  "database": "connected", 
  "message": "Database connection is working properly"
}
```

### 2. User Registration
Go to: `https://your-vercel-app.vercel.app/register`
- Fill out the form
- Should work without "Invalid response from server" error

### 3. User Login  
Go to: `https://your-vercel-app.vercel.app/login`
- Use credentials from registration
- Should successfully log in

## What Was Fixed

### ❌ **Before (Issues):**
- CORS errors blocking API calls
- Express server causing deployment conflicts
- "Invalid response from server" errors
- API rewrites not working properly

### ✅ **After (Fixed):**
- Native Next.js API routes (no CORS issues)
- Single deployment on Vercel
- Proper error handling
- Database auto-initialization

## File Structure Now

```
your-project/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js
│   │   │   └── register/route.js  
│   │   ├── shifts/route.js
│   │   ├── location/perimeter/route.js
│   │   └── health/db/route.js
│   ├── dashboard/page.jsx
│   ├── login/page.jsx
│   ├── register/page.jsx
│   └── layout.jsx
├── lib/
│   ├── components/
│   └── contexts/
├── package.json
└── vercel.json
```

## Database Setup

The application will automatically create these tables on first use:
- `users` - User accounts and authentication
- `shifts` - Shift tracking data
- `location_perimeter` - Geofence settings

## Troubleshooting

### If you still get errors:

1. **Check Vercel Function Logs:**
   - Go to Vercel dashboard > Functions tab
   - Check for any runtime errors

2. **Verify Environment Variables:**
   - Ensure all DB_* variables are set correctly
   - Double-check database credentials

3. **Test Database Connection:**
   - Visit `/api/health/db` endpoint
   - Should return "healthy" status

4. **Clear Browser Cache:**
   - Hard refresh (Ctrl+F5 or Cmd+Shift+R)
   - Or open in incognito/private mode

The "Invalid response from server" error should now be completely resolved with proper Next.js API routes!
