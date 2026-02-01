# TikTok Clone

A full-stack TikTok clone with video uploading, social features, and a TikTok-style vertical video feed.

## Features

- **User Authentication**: Register, login with JWT tokens
- **Video Upload**: Upload videos up to 100MB
- **Video Feed**: TikTok-style vertical scrolling feed
- **Social Features**: Like, comment, follow/unfollow users
- **User Profiles**: View user profiles and their videos
- **Responsive Design**: Mobile-first design optimized for mobile browsers

## Tech Stack

### Backend
- Node.js + Express
- Prisma ORM + SQLite
- JWT Authentication
- Multer for file uploads

### Frontend
- React + Vite
- React Router
- Axios for API calls
- CSS3 for styling

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. **Clone and navigate to the project**:
```bash
cd tiktok-clone
```

2. **Install backend dependencies**:
```bash
cd backend
npm install
```

3. **Setup database**:
```bash
npm run db:migrate
```

4. **Install frontend dependencies**:
```bash
cd ../frontend
npm install
```

### Running the Application

**Terminal 1 - Start Backend**:
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:3001

**Terminal 2 - Start Frontend**:
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:5173

Open http://localhost:5173 in your browser.

## Project Structure

```
tiktok-clone/
├── backend/
│   ├── prisma/           # Database schema and migrations
│   ├── routes/           # API routes (auth, videos, users)
│   ├── middleware/       # Authentication middleware
│   ├── uploads/          # Uploaded videos storage
│   ├── server.js         # Express server entry
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/   # React components
    │   ├── pages/        # Page components
    │   ├── services/     # API service functions
    │   ├── contexts/     # React contexts
    │   └── App.jsx       # Main app component
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Videos
- `GET /api/videos/feed` - Get video feed
- `POST /api/videos/upload` - Upload video
- `GET /api/videos/:id` - Get video details
- `POST /api/videos/:id/like` - Like/unlike video
- `GET /api/videos/:id/comments` - Get comments
- `POST /api/videos/:id/comments` - Add comment

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users/:username` - Get user profile
- `POST /api/users/:id/follow` - Follow/unfollow user
- `PUT /api/users/profile` - Update profile

## Deployment

### Netlify (Frontend)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy the `dist` folder to Netlify.

**Note**: You'll need to update the `VITE_API_URL` environment variable in Netlify to point to your backend server.

### Backend Deployment

For production deployment, you should deploy the backend to a service like:
- Railway (https://railway.app)
- Render (https://render.com)
- Heroku (https://heroku.com)
- AWS/GCP/Azure

Update the frontend `.env` file with your backend URL before building.

## Environment Variables

### Backend (.env)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-key"
PORT=3001
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

## Notes

- Videos are stored locally in the `uploads/` directory. For production, consider using cloud storage like AWS S3 or Cloudinary.
- SQLite is used for simplicity. For production, consider PostgreSQL or MySQL.
- The app uses JWT tokens stored in localStorage for authentication.

## License

MIT
