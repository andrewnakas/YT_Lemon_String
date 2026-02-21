# ⚡ Quick Start - 3 Steps to Deploy

## ✅ Step 1: Enable GitHub Pages (30 seconds)

1. Click here: https://github.com/andrewnakas/YT_Lemon_String/settings/pages
2. Set **Source** to `main` branch, `/ (root)` folder
3. Click **Save**

✅ **Frontend will be live at:** https://andrewnakas.github.io/YT_Lemon_String/

---

## ✅ Step 2: Deploy Backend to Render (5 minutes)

### **One-Click Deploy:**

1. Click: [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/andrewnakas/YT_Lemon_String)

2. Sign in/up (free, no credit card)

3. Click **"Create Web Service"**

4. Wait ~5 minutes for deployment

5. **Copy your backend URL** from Render dashboard

---

## ✅ Step 3: Connect Frontend to Backend (1 minute)

Once backend is deployed:

1. **Edit `/js/config.js`** on GitHub:
   - Go to: https://github.com/andrewnakas/YT_Lemon_String/blob/main/js/config.js
   - Click the pencil icon ✏️
   - Line 11: Change `BACKEND_URL: 'http://localhost:3000'`
   - To: `BACKEND_URL: 'https://YOUR-BACKEND-URL.onrender.com'`
   - Click **"Commit changes"**

2. **Wait ~1 minute** for GitHub Pages to update

---

## 🎉 Done! Test Your App

1. Visit: https://andrewnakas.github.io/YT_Lemon_String/

2. Search for a song (e.g., "Bohemian Rhapsody")

3. Click to play!

**Note:** First search may take 30-60 seconds (backend waking up)

---

## 📝 What Was Deployed?

✅ **Icons** - Using online placeholders (works fine)
✅ **Frontend** - Pushed to GitHub (ready for Pages)
✅ **Backend** - Ready to deploy to Render

---

## 🚨 Quick Troubleshooting

**Search not working?**
- Did you update `BACKEND_URL` in config?
- Wait 60 seconds for backend to wake up
- Check: `https://your-backend.onrender.com/health`

**App not loading?**
- Did you enable GitHub Pages?
- Wait 2 minutes after enabling
- Hard refresh: `Cmd+Shift+R`

---

**Total Setup Time: ~7 minutes** ⏱️

See `DEPLOYMENT.md` for detailed instructions!
