# Healthcare Shift Tracker

A Next.js application for tracking healthcare worker shifts with location-based verification, now powered by Supabase.

## Features

- **User Authentication**: Secure login/register for managers and care workers
- **Shift Management**: Clock in/out with location tracking
- **Manager Dashboard**: View and manage all staff shifts
- **Location Verification**: Ensure workers are at correct locations
- **Real-time Updates**: Live shift status tracking

## Tech Stack

- **Frontend**: Next.js 14, React 18
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS3 with responsive design
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd healthcare-shift-tracker
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Add to your environment or .env.local
SUPABASE_KEY=your_supabase_anon_key
```

4. Set up database tables in Supabase Studio

Run these SQL commands in your Supabase project's SQL Editor:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'care_worker')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create shifts table  
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

-- Create location_perimeter table
CREATE TABLE IF NOT EXISTS location_perimeter (
  id SERIAL PRIMARY KEY,
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  radius INTEGER NOT NULL DEFAULT 2000,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

5. Run the development server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Add environment variables:
   - `SUPABASE_KEY`: Your Supabase anon key
3. Deploy

## API Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration  
- `GET /api/shifts` - Get shifts (with optional userId and activeOnly params)
- `POST /api/shifts` - Clock in/out operations
- `GET /api/location/perimeter` - Get location perimeter settings
- `POST /api/location/perimeter` - Update location perimeter

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── manager/          # Manager dashboard
│   └── register/         # Registration page
├── lib/                   # Shared utilities
│   ├── components/       # React components
│   ├── contexts/        # React contexts
│   └── supabase.js      # Supabase configuration
└── public/               # Static assets
```

## License

MIT License
