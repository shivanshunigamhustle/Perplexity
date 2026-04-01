# Quick Deployment Checklist

## ✅ Backend (Render) - Setup Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Setup for production deployment"
git push origin main
```

### Step 2: Create Render Service
1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Select your GitHub repository
4. Choose `Backend` directory as root
5. Configure:
   - Name: `perplexity-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Region: Select closest to you

### Step 3: Add Environment Variables
Copy variables from `Backend/.env.example` and set values in Render:

- NODE_ENV=production
- PORT=3000
- MONGODB_URI=[your MongoDB URI]
- JWT_SECRET=[random string]
- GOOGLE_USER=[your Gmail]
- GOOGLE_CLIENT_ID=[Google Cloud Console]
- GOOGLE_CLIENT_SECRET=[Google Cloud Console]
- GOOGLE_REFRESH_TOKEN=[OAuth Playground]
- BACKEND_URL=`https://YOUR-RENDER-SERVICE-NAME.onrender.com`
- FRONTEND_URL=`https://YOUR-VERCEL-URL.vercel.app`
- All API Keys...

⚠️ **NEVER commit secrets to GitHub! Set them in Render dashboard only.**

### Step 4: Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Copy your Render URL (will be like: `https://perplexity-xxxxx.onrender.com`)

---

## ✅ Frontend (Vercel) - Setup Steps

### Step 1: Deploy to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Set Root Directory: `frontend`
5. Framework: `Vite`
6. Click "Deploy"

### Step 2: Add Environment Variables
After deployment:
1. Go to Project Settings → "Environment Variables"
2. Add: `VITE_API_URL=https://YOUR-RENDER-SERVICE-NAME.onrender.com`
3. Click "Save"

### Step 3: Redeploy with New Environment
1. Go to "Deployments"
2. Click the three dots on latest deployment
3. Click "Redeploy"

---

## 📍 Your Deployment URLs (Update After Deployment)

| Service | URL | Status |
|---------|-----|--------|
| Backend (Render) | `https://perplexity-v5uu.onrender.com` | ⏳ Waiting |
| Frontend (Vercel) | `https://perplexity-xi.vercel.app` | ⏳ Waiting |

---

## 🧪 Testing After Deployment

### 1. Test Backend Health
```bash
curl https://your-render-url/
# Should return: {"message":"Server is running"}
```

### 2. Test Registration
- Go to your Vercel URL
- Register with test email
- Check inbox for verification link

### 3. Verify Email
- Click link in email
- Should see: "✅ Email Verified Successfully!"

### 4. Test Login
- Use verified email to login
- Should receive auth token

---

## 🔧 Environment Variable Reference

### Backend (.env.example)
See `Backend/.env.example` for template. Fill in your actual values:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=[your MongoDB URI]
JWT_SECRET=[generate random string]
GOOGLE_USER=[your Gmail address]
GOOGLE_CLIENT_ID=[from Google Cloud]
GOOGLE_CLIENT_SECRET=[from Google Cloud]
GOOGLE_REFRESH_TOKEN=[from OAuth Playground]
BACKEND_URL=https://your-render-url.onrender.com
FRONTEND_URL=https://your-vercel-url.vercel.app
GOOGLE_API_KEY=[from Google Cloud]
MISTRAL_API_KEY=[from Mistral]
TAVILY_API_KEY=[from Tavily]
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-render-url.onrender.com
```

⚠️ **Store secrets in Render/Vercel dashboards, NOT in git!**

---

## ⚠️ Common Issues & Fixes

### "Email sending failed"
- Check GOOGLE_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN

### "CORS Error"
- Check FRONTEND_URL is in Render environment variables
- Verify it matches your Vercel URL exactly

### "401 Unauthorized" on login
- Check JWT_SECRET is same on backend
- Ensure cookies have `secure: true` for HTTPS

### "Verify link not working"
- Check BACKEND_URL and FRONTEND_URL are correct in backend env
- Email should have link like: `https://your-backend-url/api/auth/verify-email?token=...`

---

## 📝 Files Modified for Deployment

✅ Backend/.env.production - Production environment variables
✅ Frontend/.env.production - Production environment variables  
✅ Backend/src/app.js - Updated CORS with production URLs
✅ Backend/src/controllers/auth.controller.js - Cookie settings for production

---

## 🚀 Final Checklist Before Deploying

- [ ] All environment variables saved
- [ ] Backend `.env.production` created
- [ ] Frontend `.env.production` created
- [ ] CORS includes production URLs
- [ ] Git changes committed and pushed
- [ ] Database connection string verified
- [ ] Email OAuth credentials verified
- [ ] Render and Vercel accounts ready

Ready to deploy! 🎉
