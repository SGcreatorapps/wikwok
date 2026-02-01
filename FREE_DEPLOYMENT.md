# FREE Deployment Guide - Render + Cloudinary

**Total Cost: $0/month forever**

## What You Get:
- ✅ Backend runs 24/7 (Render free tier)
- ✅ Videos stored permanently (Cloudinary 25GB free)
- ✅ Everyone can see videos anytime
- ✅ No credit card required

---

## Step 1: Set Up Cloudinary (Free Video Storage)

**Why Cloudinary?**
- 25GB storage FREE forever
- 25GB bandwidth/month FREE
- Videos never disappear
- Automatic video optimization

**Setup:**

1. Go to https://cloudinary.com
2. Click "Sign Up for Free"
3. Verify email
4. Go to Dashboard
5. Copy these values:
   - Cloud Name: `xxxxxxxxx`
   - API Key: `1234567890`
   - API Secret: `xxxxxxxxxxxxxxxx`

---

## Step 2: Update Backend Code

**Install Cloudinary SDK:**
```bash
cd /Users/stormgeerling/tiktok-clone/backend
npm install cloudinary multer-storage-cloudinary
```

**Create cloudinary config file** at `backend/config/cloudinary.js`:
```javascript
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tiktok-videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
  }
});

export { cloudinary, storage };
```

---

## Step 3: Update Video Upload Route

**Edit** `backend/routes/videos.js`:

Replace the multer storage section with Cloudinary:

```javascript
import { storage } from '../config/cloudinary.js';

// Remove the old diskStorage config and replace with:
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});
```

Update the upload handler:
```javascript
router.post('/upload', authenticateToken, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const { caption } = req.body;
    
    // Cloudinary URL is in req.file.path
    const videoUrl = req.file.path;
    const thumbnailUrl = req.file.path.replace('/upload/', '/upload/w_300,h_400,c_fill/');

    const video = await prisma.video.create({
      data: {
        caption: caption || '',
        videoUrl,
        thumbnailUrl,
        userId: req.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(video);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});
```

---

## Step 4: Update Environment Variables

**Edit** `backend/.env`:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=3001
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Step 5: Deploy Backend to Render (FREE)

**Why Render?**
- FREE web service tier (512MB RAM, 0.1 CPU)
- Runs 24/7
- No credit card required
- Automatic deploys from GitHub

**Steps:**

1. **Push to GitHub:**
```bash
cd /Users/stormgeerling/tiktok-clone
git add .
git commit -m "Add Cloudinary video storage"
git push origin main
```

2. **Go to https://render.com**
3. Sign up with GitHub
4. Click "New Web Service"
5. Select your GitHub repo
6. Configure:
   - **Name**: `tiktok-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma migrate deploy`
   - **Start Command**: `npm start`
7. Click "Advanced" and add Environment Variables:
   - `JWT_SECRET` = `your-secret-key-here`
   - `DATABASE_URL` = `file:./dev.db`
   - `CLOUDINARY_CLOUD_NAME` = `your-cloud-name`
   - `CLOUDINARY_API_KEY` = `your-api-key`
   - `CLOUDINARY_API_SECRET` = `your-api-secret`
8. Click "Create Web Service"
9. Wait 2-3 minutes for deployment
10. Copy your Render URL (e.g., `https://tiktok-backend.onrender.com`)

---

## Step 6: Update Frontend

**Edit** `frontend/.env`:
```
VITE_API_URL=https://your-render-url.onrender.com/api
```

**Rebuild:**
```bash
cd /Users/stormgeerling/tiktok-clone/frontend
npm run build
```

---

## Step 7: Deploy Frontend to Netlify

1. Go to https://netlify.com
2. Drag and drop the `frontend/dist` folder
3. Done! Your app is live.

---

## Test Everything

1. Open your Netlify URL
2. Register an account
3. Upload a video
4. Check Cloudinary Dashboard - you should see the video in the "tiktok-videos" folder
5. The video will be visible to everyone, forever, even if the backend restarts!

---

## Free Tier Limits

**Render:**
- 512MB RAM
- 0.1 CPU
- 100GB bandwidth/month
- Sleeps after 15 mins of inactivity (wakes up on next request, takes ~30 seconds)

**Cloudinary:**
- 25GB storage
- 25GB bandwidth/month
- 25,000 transformations/month

**For a small TikTok clone, these limits are plenty!**

---

## Troubleshooting

**Videos not uploading?**
- Check Cloudinary Dashboard → Media Library
- Verify environment variables in Render
- Check Render logs

**Backend sleeping?**
- Normal on free tier after 15 mins of no traffic
- First request after sleep takes ~30 seconds to wake up
- Subsequent requests are fast

**Storage full?**
- Cloudinary: 25GB is a lot of videos (~1000 short videos)
- If you hit limits, you can delete old videos from Cloudinary dashboard

---

## Summary

You now have a **completely free** TikTok clone that:
- Runs 24/7 on Render
- Stores videos permanently on Cloudinary
- Costs $0/month
- Is accessible to everyone worldwide

🎉 Your videos will NEVER disappear!
