# Deployment Configuration Guide

## Issues Fixed

### 1. "Response.json: Body has already been consumed" Error
**Problem:** The response body was being read multiple times, causing this error.
**Solution:** Added proper try-catch blocks and single response consumption in AuthContext.

### 2. Backend Showing UI Instead of API
**Problem:** Backend deployment might be serving unexpected content.
**Solution:** Updated root endpoint to clearly return JSON and indicate API-only service.

### 3. CORS and Environment Configuration
**Problem:** Production URLs not properly configured.
**Solution:** Updated CORS to handle multiple origins and environment variables.

## Frontend Deployment (Netlify)

### Environment Variables to Set in Netlify:
1. Go to your Netlify site dashboard
2. Navigate to **Site settings** > **Environment variables**
3. Add the following variable:

```
NEXT_PUBLIC_BACKEND_URL=https://your-backend-app.vercel.app
```

Replace `your-backend-app.vercel.app` with your actual Vercel backend URL.

### Build Settings:
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node version:** 18 or higher

## Backend Deployment (Vercel)

### Environment Variables to Set in Vercel:
1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add the following variables:

```
NODE_ENV=production
FRONTEND_URL=https://your-frontend-app.netlify.app
CORS_ORIGIN=https://your-frontend-app.netlify.app

# Database Configuration (use your actual database)
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=healthcare_shifts

# Optional: If using a database connection string
# DATABASE_URL=mysql://user:password@host:port/database
```

Replace the URLs with your actual Netlify frontend URL and database credentials.

### Vercel Configuration:
The `vercel.json` file is already configured for API deployment.

## Testing the Deployment

### 1. Test Backend API:
Visit your Vercel backend URL directly (e.g., `https://your-backend-app.vercel.app`)
You should see a JSON response like:
```json
{
  "message": "Healthcare Shift Tracker API is running!",
  "service": "API",
  "version": "1.0.0",
  "endpoints": [...],
  "timestamp": "..."
}
```

### 2. Test Database Health:
Visit: `https://your-backend-app.vercel.app/api/health/db`
You should see:
```json
{
  "status": "healthy",
  "database": "connected",
  "message": "Database connection is working properly"
}
```

### 3. Test Frontend:
1. Visit your Netlify frontend URL
2. Try to register a new user
3. Try to login with the created user

## Common Issues and Solutions

### Issue: "Response.json: Body has already been consumed"
**Solution:** Fixed in AuthContext with proper error handling.

### Issue: CORS errors in production
**Solution:** Make sure `FRONTEND_URL` is set correctly in Vercel environment variables.

### Issue: Backend showing HTML instead of JSON
**Solution:** 
1. Clear Vercel cache and redeploy
2. Ensure no `index.html` or other static files in backend directory
3. Verify the root endpoint returns JSON

### Issue: Database connection failed
**Solution:** 
1. Verify database credentials in Vercel environment variables
2. Ensure database accepts connections from Vercel IPs
3. Check if database is running and accessible

## Verification Checklist

- [ ] Frontend deployed to Netlify successfully
- [ ] Backend deployed to Vercel successfully  
- [ ] Backend root URL returns JSON (not HTML)
- [ ] Database health endpoint works
- [ ] Environment variables set correctly on both platforms
- [ ] User registration works from frontend
- [ ] User login works from frontend
- [ ] No CORS errors in browser console

## Support

If you continue to see the UI on the backend:
1. Check if there are any static files in the backend directory
2. Clear Vercel deployment cache
3. Redeploy the backend
4. Verify the Vercel function logs for any errors

The backend should only serve JSON responses for API endpoints, not any HTML UI.
