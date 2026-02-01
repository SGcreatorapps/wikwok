# Backend Deployment Guide

Your backend needs to be deployed separately from the frontend. Here are your options:

## Option 1: Railway (Recommended - Easiest)

Railway offers free hosting with automatic deployments from GitHub.

1. **Push your code to GitHub**:
```bash
cd /Users/stormgeerling/tiktok-clone
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/tiktok-clone.git
git push -u origin main
```

2. **Deploy to Railway**:
   - Go to https://railway.app
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your tiktok-clone repo
   - Select the backend directory
   - Add environment variables in Railway dashboard:
     - `JWT_SECRET` = your-secret-key-here
     - `DATABASE_URL` = file:./dev.db
     - `PORT` = 3001
   - Deploy!

3. **Get your backend URL** (e.g., `https://tiktok-clone.up.railway.app`)

4. **Update frontend**:
   - Edit `frontend/.env`: `VITE_API_URL=https://your-railway-url/api`
   - Rebuild: `cd frontend && npm run build`
   - Redeploy frontend to Netlify

## Option 2: Render (Free Tier)

1. Go to https://render.com
2. Sign up and click "New Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma migrate deploy`
   - **Start Command**: `npm start`
5. Add environment variables:
   - `JWT_SECRET` = your-secret-key
   - `DATABASE_URL` = file:./dev.db
6. Deploy

## Option 3: Heroku

1. Install Heroku CLI: `brew install heroku`
2. Login: `heroku login`
3. Create app:
```bash
cd backend
heroku create your-tiktok-backend
```
4. Set env vars:
```bash
heroku config:set JWT_SECRET=your-secret-key
heroku config:set DATABASE_URL=file:./dev.db
```
5. Deploy:
```bash
git subtree push --prefix backend heroku main
```

## Important Notes

⚠️ **File Uploads**: 
- The backend stores videos locally in `/uploads` folder
- Free hosting platforms have ephemeral storage (files disappear on restart)
- For production, you need cloud storage like:
  - **Cloudinary** (recommended - free tier available)
  - **AWS S3**
  - **Supabase Storage**

⚠️ **Database**:
- Currently using SQLite (local file)
- For production, switch to PostgreSQL
- Railway/Render offer free PostgreSQL databases

## Quick Test

After deploying backend, test it:
```bash
curl https://your-backend-url/api/health
```

Should return: `{"status":"OK","message":"TikTok Clone API is running!"}`

## Update Frontend

Once backend is live:
1. Edit `frontend/.env`
2. Change `VITE_API_URL` to your deployed backend URL
3. Rebuild and redeploy frontend

Your app will then be fully live! 🚀
