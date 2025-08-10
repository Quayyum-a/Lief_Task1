# Healthcare Shift Tracker - Backend API

This is the backend API server for the Healthcare Shift Tracker application.

## Backend Properties

- **Pure Backend**: Contains only server-side code and dependencies
- **Database Integration**: Direct MySQL database connectivity
- **RESTful API**: Clean REST endpoints for all operations
- **Environment Configuration**: Configurable via environment variables
- **CORS Enabled**: Supports frontend communication
- **Health Monitoring**: Built-in health check endpoints

## Database Accessibility

The backend provides full database access through:

- **Connection Pool**: Efficient MySQL connection management
- **Auto-initialization**: Creates database and tables automatically
- **Health Checks**: Monitor database connectivity
- **Error Handling**: Comprehensive database error management

## Environment Variables

Create a `.env` file in the backend directory with:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=healthcare_shifts

# Server Configuration
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

### Health & Monitoring
- `GET /` - Basic health check
- `GET /api/health/db` - Database connectivity check
- `GET /api/health/db-info` - Database information and statistics

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Shifts Management
- `GET /api/shifts` - Get all shifts (with optional filters)
- `POST /api/shifts` - Clock in/out operations

### Location Management
- `GET /api/location/perimeter` - Get location settings
- `POST /api/location/perimeter` - Update location settings

## Database Schema

### Users Table
- `id` (VARCHAR) - Primary key
- `username` (VARCHAR) - Unique username
- `password` (VARCHAR) - Password (should be hashed in production)
- `role` (ENUM) - 'manager' or 'care_worker'
- `created_at` (TIMESTAMP) - Creation timestamp

### Shifts Table
- `id` (VARCHAR) - Primary key
- `user_id` (VARCHAR) - Foreign key to users
- `username` (VARCHAR) - Username for reference
- `clock_in_time` (TIMESTAMP) - Clock in time
- `clock_in_latitude/longitude` (DECIMAL) - Clock in location
- `clock_in_note` (TEXT) - Optional clock in note
- `clock_out_time` (TIMESTAMP) - Clock out time (nullable)
- `clock_out_latitude/longitude` (DECIMAL) - Clock out location (nullable)
- `clock_out_note` (TEXT) - Optional clock out note
- `created_at/updated_at` (TIMESTAMP) - Timestamps

### Location Perimeter Table
- `id` (INT) - Auto-increment primary key
- `latitude/longitude` (DECIMAL) - Center coordinates
- `radius` (INT) - Radius in meters
- `created_at/updated_at` (TIMESTAMP) - Timestamps

## Running the Backend

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Database Check
```bash
npm run db:check
```

## Features

- **Auto Database Creation**: Creates database and tables if they don't exist
- **Connection Pooling**: Efficient database connection management
- **Error Handling**: Comprehensive error responses
- **CORS Support**: Configurable cross-origin resource sharing
- **Environment-based Configuration**: Flexible deployment options
- **Health Monitoring**: Real-time database and server status

## Dependencies

- **express**: Web framework
- **mysql2**: MySQL database client with promise support
- **cors**: Cross-origin resource sharing middleware
- **dotenv**: Environment variable management

All dependencies are backend-specific with no frontend libraries included.
