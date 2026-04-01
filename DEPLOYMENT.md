# Deployment Guide - Render & Vercel

## Prerequisites
- Render account (render.com)
- Vercel account (vercel.com)
- GitHub repository (connected to both services)

---

## Backend Deployment (Render.com)

### 1. Create Web Service on Render

1. Go to [render.com](https://render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Fill in the details:
   - **Name**: `perplexity-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Region**: Choose closest to your users

### 2. Set Environment Variables on Render

Go to **Environment** tab and add these variables (see `Backend/.env.example` for reference):

```
NODE_ENV=production
PORT=3000
MONGODB_URI=[your MongoDB connection string]
JWT_SECRET=[generate a random string]

GOOGLE_USER=[your Gmail address]
GOOGLE_CLIENT_ID=[from Google Cloud Console]
GOOGLE_CLIENT_SECRET=[from Google Cloud Console]
GOOGLE_REFRESH_TOKEN=[from Google OAuth playground]

BACKEND_URL=https://your-render-service-name.onrender.com
FRONTEND_URL=https://your-vercel-project.vercel.app

GOOGLE_API_KEY=[your Gemini API key]
MISTRAL_API_KEY=[your Mistral API key]
TAVILY_API_KEY=[your Tavily API key]
```

⚠️ **DO NOT COMMIT SECRETS TO GITHUB!** Set these in Render dashboard only.

### 3. Update Backend package.json

Ensure your `package.json` has these scripts:

```json
"scripts": {
  "dev": "npx nodemon server.js",
  "start": "node server.js"
}
```

---

## Frontend Deployment (Vercel)

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repository
4. Select the `frontend` folder as root directory
5. Framework: **Vite**

### 2. Set Environment Variables

In Vercel project settings → **Environment Variables**, add:

```
VITE_API_URL=https://perplexity-v5uu.onrender.com
```

⚠️ **Replace with your actual Render backend URL!**

### 3. Build Settings

- **Build Command**: `npm run build`
- **Output Directory**: `dist`

---

## Updating URLs After Deployment

Once your services are deployed:

1. **Get your Render URL**: Will be shown in Render dashboard (e.g., `https://your-service-name.onrender.com`)
2. **Get your Vercel URL**: Will be shown in Vercel dashboard (e.g., `https://your-project.vercel.app`)

### Update these files:

**Backend/.env.production**:
```
BACKEND_URL=https://your-render-url.onrender.com
FRONTEND_URL=https://your-vercel-url.vercel.app
```

**Frontend/.env.production**:
```
VITE_API_URL=https://your-render-url.onrender.com
```

---

## CORS Configuration

Backend CORS is already configured to accept:
- `http://localhost:5173` (development)
- `http://localhost:3000` (development)
- `https://your-vercel-url.vercel.app` (production)
- `https://perplexity-v5uu.onrender.com` (production)

**Edit [Backend/src/app.js](Backend/src/app.js)** if you need to update production URLs:

```javascript
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://perplexity-v5uu.onrender.com",
        "https://perplexity-xi.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));
```

---

## Deployment Checklist

### Backend (Render)
- [ ] `.env.production` contains all required variables
- [ ] `package.json` has `"start"` script
- [ ] CORS includes your Vercel URL
- [ ] Email service configured with OAuth2 credentials
- [ ] MongoDB connection string is correct

### Frontend (Vercel)
- [ ] `.env.production` or `.env` has correct `VITE_API_URL`
- [ ] Build command is `npm run build`
- [ ] `vite.config.js` is configured correctly
- [ ] API calls use `import.meta.env.VITE_API_URL`

---

## Testing Deployment

1. **Test Backend API**:
   ```bash
   curl https://your-render-url.onrender.com/
   ```

2. **Test Registration**:
   - Go to your Vercel URL
   - Register with a new account
   - Check email for verification link
   - Verify and try logging in

3. **Check Logs**:
   - **Render**: View logs in Render dashboard
   - **Vercel**: View logs in Vercel dashboard

---

## Troubleshooting

### CORS Errors
- Ensure Vercel URL is in backend CORS origins
- Check `credentials: true` is set

### Email Not Sending
- Verify Gmail OAuth credentials in Render environment
- Check BACKEND_URL matches your Render service URL

### 401 Unauthorized
- Ensure cookies are being sent (check `withCredentials: true` in frontend API calls)
- Verify JWT_SECRET is the same in all environments

### Verification Link Not Working
- Check BACKEND_URL and FRONTEND_URL in backend environment
- Email link should be: `https://backend-url/api/auth/verify-email?token=...`

---

## Redeploying

After making changes:

**Render**: Commits to main branch auto-deploy
**Vercel**: Commits to main branch auto-deploy

To manually redeploy:
- **Render**: Click **Manual Deploy** → **Deploy latest commit**
- **Vercel**: Click **Redeploy** in dashboard
