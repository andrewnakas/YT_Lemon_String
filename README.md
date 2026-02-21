# 🍋 YT Lemon String - YouTube Music Player

A Spotify-like music player that uses YouTube as its backend. Search, play, save, and download your favorite music with a beautiful, mobile-optimized interface.

![YT Lemon String](https://via.placeholder.com/1200x600/121212/1db954?text=YT+Lemon+String)

## ✨ Features

- 🔍 **Search** - Find any song or artist on YouTube (no API key needed!)
- ▶️ **Play** - Stream music with a Spotify-inspired player interface
- 📚 **Library** - Save your favorite songs for quick access
- 📝 **Playlists** - Create and organize custom playlists
- ⬇️ **Download** - Download songs as MP3 files to your device
- 📱 **Mobile-First** - Fully responsive, works great on all devices
- 🔌 **Offline Mode** - Progressive Web App with offline support
- 🎵 **Background Playback** - Lock screen controls with Media Session API
- 🌙 **Dark Theme** - Beautiful dark mode interface

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (for backend)
- Git
- A modern web browser

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/YT_Lemon_String.git
cd YT_Lemon_String/YT_Lemon_String
```

### 2. Setup Frontend (GitHub Pages)

The frontend is ready to deploy to GitHub Pages:

1. Push the repository to GitHub
2. Go to **Settings** → **Pages**
3. Select **main** branch and **/ (root)** folder
4. Click **Save**
5. Your app will be live at `https://yourusername.github.io/YT_Lemon_String/`

### 3. Setup Backend (Required for Search & Downloads)

The backend handles YouTube scraping and downloads.

#### Local Development

```bash
cd backend
npm install
npm start
```

The server will run on `http://localhost:3000`

#### Deploy to Render (Recommended)

1. Create account at [Render.com](https://render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `yt-lemon-backend`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Add `PORT=10000` (or leave default)
5. Click **Create Web Service**
6. Wait for deployment (first deploy takes ~5 minutes)
7. Copy your backend URL (e.g., `https://yt-lemon-backend.onrender.com`)

#### Deploy to Railway

1. Create account at [Railway.app](https://railway.app)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **Deploy**
6. Copy your backend URL

### 4. Configure Backend URL

Update the frontend to use your backend:

Edit `js/config.js`:

```javascript
const CONFIG = {
    BACKEND_URL: 'https://your-backend.onrender.com', // Replace with your backend URL
    // ... rest of config
};
```

Commit and push changes to update GitHub Pages.

### 5. Install yt-dlp on Backend

SSH into your backend server or use the platform's console:

```bash
pip install yt-dlp
# or
npm run install-ytdlp
```

Most platforms (Render, Railway) include Python by default.

## 📁 Project Structure

```
YT_Lemon_String/
├── index.html              # Main app
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline support
│
├── css/
│   ├── variables.css       # Design tokens
│   ├── styles.css          # Core styles
│   ├── components.css      # Component styles
│   └── mobile.css          # Mobile styles
│
├── js/
│   ├── config.js           # App configuration
│   ├── app.js              # Main app logic
│   ├── api/
│   │   └── backend.js      # Backend API client
│   ├── components/
│   │   ├── player.js       # Music player
│   │   ├── search.js       # Search
│   │   ├── library.js      # Library
│   │   ├── playlist.js     # Playlists
│   │   └── queue.js        # Queue
│   └── utils/
│       ├── storage.js      # IndexedDB wrapper
│       ├── helpers.js      # Utility functions
│       └── dom.js          # DOM helpers
│
├── backend/                # Node.js backend
│   ├── server.js           # Express server
│   ├── package.json
│   ├── routes/
│   │   ├── search.js       # Search endpoint
│   │   └── download.js     # Download endpoint
│   └── utils/
│       ├── scraper.js      # Puppeteer scraper
│       └── ytdlp.js        # yt-dlp wrapper
│
└── assets/
    ├── icons/              # PWA icons
    └── images/             # Images
```

## 🎵 How to Use

### Search for Music

1. Click on the **Search** tab
2. Type artist name or song title
3. Press Enter or click **Search**
4. Click any result to play

### Build Your Library

- Click the ♥ button on any song to add to your library
- View your library in the **Your Library** tab
- Songs are saved locally in your browser

### Create Playlists

1. Go to **Playlists** tab
2. Click **+ Create Playlist**
3. Enter name and description
4. Add songs by clicking the + button on any song

### Download Songs

- Click the ⬇ button in the player
- Song will download as MP3
- Works on desktop and mobile

### Keyboard Shortcuts

- **Space**: Play/Pause
- **→**: Next song
- **←**: Previous song

## 🛠️ Development

### Frontend Development

The frontend is vanilla HTML/CSS/JavaScript - no build step required!

1. Open `index.html` in your browser
2. Make changes
3. Refresh to see updates

### Backend Development

```bash
cd backend
npm install
npm run dev  # Starts with nodemon for auto-reload
```

### Backend API Endpoints

**Health Check**
```
GET /health
```

**Search YouTube**
```
GET /api/search?q=query&maxResults=20
```

**Download Audio**
```
POST /api/download
Body: { "videoId": "dQw4w9WgXcQ" }
```

**Get Metadata**
```
GET /api/metadata?videoId=dQw4w9WgXcQ
```

## 🚢 Deployment Guides

### Frontend (GitHub Pages)

Already covered in Quick Start. Your app will be at:
```
https://yourusername.github.io/repository-name/
```

### Backend Options

#### Render (Free Tier)

- ✅ Free tier available
- ✅ Auto-sleep after inactivity (wakes on request)
- ✅ Easy deployment from GitHub
- ✅ HTTPS included
- ⏱️ ~30 second cold start

#### Railway (Free Trial)

- ✅ $5/month free credit
- ✅ No auto-sleep
- ✅ Fast deployments
- ✅ Easy GitHub integration

#### Heroku

- ❌ No longer has free tier
- Use Render or Railway instead

## 📝 Configuration

### Frontend Config (`js/config.js`)

```javascript
const CONFIG = {
    BACKEND_URL: 'http://localhost:3000',  // Your backend URL
    DB_NAME: 'YTLemonString',
    DB_VERSION: 1,
    SEARCH_DEBOUNCE_MS: 300,
    DEFAULT_VOLUME: 70,
    // ... more settings
};
```

### Backend Config (`.env`)

```bash
PORT=3000
FRONTEND_URL=https://yourusername.github.io
NODE_ENV=production
```

## 🔒 Important Notes

### YouTube Terms of Service

- Web scraping may violate YouTube's Terms of Service
- Use this project for personal use and educational purposes only
- Downloads are the user's responsibility
- The app uses YouTube's iframe API for playback (compliant)

### CORS

The backend enables CORS for your frontend URL. Update `FRONTEND_URL` in production.

### Rate Limiting

Consider adding rate limiting to prevent abuse:

```bash
npm install express-rate-limit
```

## 🐛 Troubleshooting

### Backend Not Connecting

1. Check backend URL in `js/config.js`
2. Ensure backend is running (`npm start`)
3. Check browser console for CORS errors
4. Verify backend health: `curl https://your-backend.com/health`

### Search Not Working

1. Check backend logs
2. Puppeteer may need additional Chrome dependencies on Linux
3. Try running backend locally first

### Puppeteer Issues on Linux

Install Chrome dependencies:

```bash
sudo apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils
```

### yt-dlp Not Found

Install yt-dlp:

```bash
pip install yt-dlp
# or
pip3 install yt-dlp
```

### Downloads Not Working

1. Ensure yt-dlp is installed
2. Check backend logs
3. Try downloading a different video
4. Verify internet connection

## 📱 PWA Installation

### Android

1. Open the app in Chrome
2. Tap the menu (3 dots)
3. Tap "Add to Home screen"
4. Tap "Install"

### iOS

1. Open the app in Safari
2. Tap the Share button
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"

### Desktop

1. Look for install icon in address bar
2. Click to install
3. App will open in its own window

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- YouTube for the content platform
- Puppeteer team for web scraping capabilities
- yt-dlp developers for download functionality
- Spotify for design inspiration

## 🔗 Links

- [GitHub Repository](https://github.com/yourusername/YT_Lemon_String)
- [Report Issues](https://github.com/yourusername/YT_Lemon_String/issues)
- [Render Hosting](https://render.com)
- [Railway Hosting](https://railway.app)

## 📞 Support

Having issues? [Create an issue](https://github.com/yourusername/YT_Lemon_String/issues) on GitHub.

---

Made with 🍋 and ❤️
