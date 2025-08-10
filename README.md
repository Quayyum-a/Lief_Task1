# Healthcare Shift Tracker

A comprehensive shift tracking application for healthcare workers with location-based verification and management features.

## 🏗️ Project Structure

This project has been split into separate frontend and backend for deployment flexibility:

```
├── backend/           # Express.js API server (deploy to Vercel)
├── frontend/          # React SPA (deploy to Netlify)
├── app/              # Original Next.js app (legacy - for reference)
├── lib/              # Original components (legacy - for reference)
└── DEPLOYMENT.md     # Detailed deployment guide
```

## 🚀 Quick Start

### For Development (Local)

1. **Start Backend:**
```bash
cd backend
npm install
# Create .env file with database credentials
npm run dev
```

2. **Start Frontend:**
```bash
cd frontend
npm install
# Create .env file with VITE_API_URL=http://localhost:5000
npm run dev
```

### For Production Deployment

See `DEPLOYMENT.md` for detailed instructions on deploying to Netlify (frontend) and Vercel (backend).

## 📋 Features

### For Care Workers
- **Location-Based Clock In/Out**: Must be within designated work area
- **Shift History**: View past shifts and notes
- **Real-time Duration**: Track current shift duration
- **Notes**: Add optional notes when clocking in/out

### For Managers
- **Staff Overview**: See all currently active staff
- **Analytics Dashboard**: View shift statistics and metrics
- **Location Management**: Configure work area perimeter
- **Shift Reports**: Detailed staff performance data

## 🔧 Technology Stack

- **Frontend**: React 18, Vite, React Router
- **Backend**: Express.js, MySQL
- **Icons**: Lucide React
- **Deployment**: Netlify (frontend) + Vercel (backend)

## 📱 Database Options

- **PlanetScale** (Recommended for beginners)
- **Railway**
- **Supabase** (PostgreSQL alternative)
- **Traditional MySQL hosting**

## 🎓 Junior Developer Friendly

This project demonstrates:
- Clean separation of frontend/backend
- RESTful API design
- Environment variable configuration
- Error handling with fallbacks
- Responsive design
- Modern React patterns

## 🧪 Demo Accounts

After setting up demo data:
- **Manager**: `manager` / `password123`
- **Care Workers**: `alice`, `bob`, `carol` / `password123`

## 📖 Documentation

- `DEPLOYMENT.md` - Complete deployment guide
- `backend/` - Backend API documentation
- `frontend/` - Frontend component structure

## 🛠️ Development

The application includes fallback mechanisms to localStorage, making it work even without a database connection - perfect for development and learning.

## 🚀 Getting Started

1. Follow the deployment guide in `DEPLOYMENT.md`
2. Set up your database (PlanetScale recommended)
3. Deploy backend to Vercel
4. Deploy frontend to Netlify
5. Load demo data and start using!

---

**Built for learning and production use** - This project showcases modern web development practices suitable for junior developers while being production-ready.
