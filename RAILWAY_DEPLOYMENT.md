# Railway Backend Deployment - Step by Step

## Step 1: Prepare Your Code

```bash
cd /Users/stormgeerling/tiktok-clone

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
*.db
uploads/*.mp4
uploads/*.mov
uploads/*.avi
uploads/avatars/*.jpg
uploads/avatars/*.png
uploads/avatars/*.jpeg
.DS_Store
EOF

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"
```

## Step 2: Push to GitHub

1. Go to https://github.com/new
2. Repository name: `tiktok-clone`
3. Click "Create repository"
4. Run these commands:

```bash
git remote add origin https://github.com/YOUR_USERNAME/tiktok-clone.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Click "Deploy from GitHub repo"
5. Select your `tiktok-clone` repository
6. Click "Add Variables" and add these:
   - `JWT_SECRET` = `super-secret-key-change-this-123`
   - `DATABASE_URL` = `file:./dev.db`
   - `PORT` = `3001`
7. Click "Deploy"
8. Wait 2-3 minutes for deployment

## Step 4: Get Your Backend URL

1. In Railway dashboard, click on your deployed service
2. Go to "Settings" tab
3. Click "Generate Domain"
4. Copy the URL (e.g., `https://tiktok-clone.up.railway.app`)

## Step 5: Update Frontend

```bash
cd /Users/stormgeerling/tiktok-clone/frontend

# Edit the .env file
# Change: VITE_API_URL=http://localhost:3001/api
# To: VITE_API_URL=https://your-railway-url/api

# Example:
echo 'VITE_API_URL=https://tiktok-clone.up.railway.app/api' > .env

# Rebuild
npm run build
```

## Step 6: Deploy Frontend to Netlify

1. Go to https://netlify.com
2. Drag and drop the `frontend/dist` folder
3. Or use Netlify CLI:

```bash
cd /Users/stormgeerling/tiktok-clone/frontend
npx netlify deploy --prod --dir=dist
```

## Step 7: Test Everything

1. Visit your Netlify frontend URL
2. Register a new account
3. Upload a video
4. Check if it appears in the feed

## Troubleshooting

**Videos not playing?**
- Check browser console for errors
- Ensure backend CORS is configured
- Verify API URL is correct in frontend

**Can't connect to backend?**
- Test backend directly: `curl https://your-url/api/health`
- Should return: `{"status":"OK"...}`

**Uploads failing?**
- Check Railway logs in dashboard
- Ensure JWT_SECRET is set correctly

## ⚠️ Important Limitations

**Free tier issues:**
- Videos stored in `/uploads` will disappear when Railway restarts (happens daily on free tier)
- Database (SQLite) will also reset

**For permanent storage**, you need to:
1. Add Cloudinary for video storage (free 25GB)
2. Switch to PostgreSQL database

Want me to set up Cloudinary integration now? (This will make uploads permanent)
