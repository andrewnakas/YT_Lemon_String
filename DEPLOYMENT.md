# 🚀 Deployment Guide - YT Lemon String

## ✅ Frontend Deployed to GitHub Pages

Your repository is now on GitHub! To enable GitHub Pages:

### Enable GitHub Pages (Manual Step Required)

1. **Visit:** https://github.com/andrewnakas/YT_Lemon_String/settings/pages

2. **Configure:**
   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/ (root)`
   - Click **Save**

3. **Wait:** GitHub Pages will build (takes 1-2 minutes)

4. **Your Frontend URL:** https://andrewnakas.github.io/YT_Lemon_String/

---

## 🔧 Backend Deployment to Render

### Option 1: One-Click Deploy (Easiest)

1. **Click this button:**

   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/andrewnakas/YT_Lemon_String)

2. **Sign in** to Render (or create free account)

3. **Review settings:**
   - Service name: `yt-lemon-backend`
   - Build command: Auto-detected from `render.yaml`
   - Start command: Auto-detected from `render.yaml`

4. **Click "Create Web Service"**

5. **Wait ~5 minutes** for first deployment

6. **Copy your backend URL** (e.g., `https://yt-lemon-backend.onrender.com`)

### Option 2: Manual Render Deployment

1. **Go to:** https://render.com/

2. **Sign up/Login** with GitHub

3. **Click:** New → Web Service

4. **Connect Repository:**
   - Click "Connect account" if needed
   - Select `andrewnakas/YT_Lemon_String`

5. **Configure Service:**
   ```
   Name: yt-lemon-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && pip install yt-dlp
   Start Command: npm start
   Instance Type: Free
   ```

6. **Environment Variables:**
   ```
   NODE_ENV=production
   FRONTEND_URL=https://andrewnakas.github.io
   ```

7. **Click "Create Web Service"**

8. **Wait for deployment** (first deploy: ~5 minutes)

9. **Copy your backend URL**

---

## 🔗 Connect Frontend to Backend

Once your backend is deployed:

1. **Get your backend URL** from Render dashboard
   - Example: `https://yt-lemon-backend.onrender.com`

2. **Update frontend config:**

   Edit `/js/config.js` line 11:
   ```javascript
   BACKEND_URL: 'https://yt-lemon-backend.onrender.com',  // Replace with your URL
   ```

3. **Commit and push:**
   ```bash
   git add js/config.js
   git commit -m "Configure backend URL"
   git push
   ```

4. **Wait ~1 minute** for GitHub Pages to rebuild

---

## ✅ Verify Deployment

### Test Frontend

1. Visit: https://andrewnakas.github.io/YT_Lemon_String/
2. You should see the music player interface
3. Try navigating between Search, Library, and Playlists

### Test Backend

1. Visit: `https://your-backend.onrender.com/health`
2. Should see: `{"status":"ok", ...}`

### Test Search

1. Open the app
2. Search for a song (e.g., "Bohemian Rhapsody")
3. Results should appear within 5-10 seconds
4. Click to play

**Note:** First backend request may take 30-60 seconds (Render free tier cold start)

---

## 🐛 Troubleshooting

### Frontend Issues

**App not loading:**
- Check GitHub Pages is enabled
- Wait 2-3 minutes after enabling
- Check browser console for errors

**Blank page:**
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Check console for JavaScript errors

### Backend Issues

**Search not working:**
1. Check backend health: `https://your-backend.onrender.com/health`
2. Check backend logs in Render dashboard
3. Verify `BACKEND_URL` in `js/config.js` is correct

**Backend timeout:**
- Render free tier sleeps after inactivity
- First request takes 30-60 seconds to wake up
- Subsequent requests are fast

**Puppeteer errors:**
- Render automatically installs Chrome dependencies
- If errors persist, check Render build logs

**yt-dlp not found:**
- Check build logs show `pip install yt-dlp` succeeded
- Render should have Python pre-installed

---

## 📊 Monitoring

### Render Dashboard

Visit: https://dashboard.render.com/

- View logs
- Monitor uptime
- Check build status
- Restart service if needed

### GitHub Pages

Visit: https://github.com/andrewnakas/YT_Lemon_String/deployments

- View deployment history
- Check build status

---

## 🔄 Making Updates

### Update Frontend

```bash
# Make changes to HTML/CSS/JS
git add .
git commit -m "Your update message"
git push

# GitHub Pages auto-rebuilds in ~1 minute
```

### Update Backend

```bash
# Make changes to backend/
git add .
git commit -m "Your update message"
git push

# Render auto-deploys in ~2-3 minutes
```

---

## 💰 Costs

### GitHub Pages
- **Free** ✅
- 100GB bandwidth/month
- Unlimited for public repositories

### Render Free Tier
- **Free** ✅
- 750 hours/month
- Auto-sleep after inactivity
- 30-60 second cold start
- 512MB RAM

**No credit card required!**

---

## 🎯 Next Steps

1. ✅ Enable GitHub Pages
2. ✅ Deploy backend to Render
3. ✅ Update `BACKEND_URL` in config
4. 🎵 Start using your music player!

### Optional Improvements

- Replace placeholder icons with custom design
- Add your own logo
- Customize colors in `css/variables.css`
- Add more features!

---

## 📞 Need Help?

- **Backend not deploying?** Check [Render Docs](https://render.com/docs)
- **GitHub Pages issues?** Check [GitHub Docs](https://docs.github.com/en/pages)
- **App bugs?** Open an issue on GitHub

---

**Your app is ready to deploy! 🎉**
