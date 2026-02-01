# Local Backend Hosting Guide

Perfect for testing! Here's how to run the backend on your computer.

## Option 1: Basic Local Hosting (Local Only)

**Step 1: Start the backend**
```bash
cd /Users/stormgeerling/tiktok-clone/backend
npm run dev
```

Your backend will run at: `http://localhost:3001`

**Step 2: Update frontend**
Edit `/Users/stormgeerling/tiktok-clone/frontend/.env`:
```
VITE_API_URL=http://localhost:3001/api
```

**Step 3: Start frontend**
```bash
cd /Users/stormgeerling/tiktok-clone/frontend
npm run dev
```

Open http://localhost:5173 in your browser.

**Limitation**: Only works on YOUR computer. Others can't access it.

---

## Option 2: Share With Others (Temporary Public URL)

Use **ngrok** to create a public URL that tunnels to your local computer.

**Step 1: Install ngrok**
```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com/download
```

**Step 2: Start your backend**
```bash
cd /Users/stormgeerling/tiktok-clone/backend
npm run dev
```

**Step 3: Expose to internet**
```bash
ngrok http 3001
```

You'll see something like:
```
Forwarding  https://abc123-def.ngrok-free.app -> http://localhost:3001
```

**Step 4: Update frontend .env**
```
VITE_API_URL=https://abc123-def.ngrok-free.app/api
```

**Step 5: Rebuild and deploy**
```bash
cd /Users/stormgeerling/tiktok-clone/frontend
npm run build
```

Now deploy the `dist` folder to Netlify. The app will connect to YOUR computer!

**⚠️ Warning**: 
- Your computer must stay ON
- ngrok URL changes every time you restart ngrok (free tier)
- Anyone with the URL can access your backend

---

## Option 3: Local Network (Same WiFi Only)

Access from your phone/other devices on the same network.

**Step 1: Find your computer's IP address**
```bash
# macOS
ipconfig getifaddr en0

# Will output something like: 192.168.1.105
```

**Step 2: Start backend with host flag**
```bash
cd /Users/stormgeerling/tiktok-clone/backend
npm start
```

The server is already configured to accept connections from any IP.

**Step 3: Update frontend .env**
```
VITE_API_URL=http://192.168.1.105:3001/api
```

**Step 4: Rebuild and deploy to Netlify**
```bash
cd /Users/stormgeerling/tiktok-clone/frontend
npm run build
```

**Step 5: Access from your phone**
- Connect phone to same WiFi
- Open the Netlify URL on your phone
- It will connect to your computer!

**⚠️ Warning**:
- Only works when devices are on same WiFi
- Your computer's IP may change when you reconnect to WiFi
- Computer must stay on

---

## Quick Commands Summary

```bash
# Terminal 1 - Backend
cd tiktok-clone/backend
npm run dev

# Terminal 2 - ngrok (optional)
ngrok http 3001

# Terminal 3 - Build frontend
cd tiktok-clone/frontend
npm run build
```

---

## Making Your Computer's IP Static (macOS)

To avoid IP changing every time:

1. System Preferences → Network
2. Click your WiFi → Advanced
3. TCP/IP tab
4. Configure IPv4: **Manually**
5. Set IP: 192.168.1.200 (or any number 2-254)
6. Router: 192.168.1.1 (your router's IP)

Now your computer always has the same IP on your network.

---

## Which Option Should You Choose?

- **Just testing alone?** → Option 1 (localhost only)
- **Show friends temporarily?** → Option 2 (ngrok)
- **Use on your phone at home?** → Option 3 (local network)

All options are FREE and your data stays on your computer!
