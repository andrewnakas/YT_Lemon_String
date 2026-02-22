# YT Lemon String - Desktop App

A beautiful Spotify-like music player that uses YouTube as its backend. Runs completely on your computer - no cloud server needed!

## Features

✅ **No Bot Detection** - Downloads work perfectly on your local machine
✅ **Beautiful GUI** - Same Spotify-like interface
✅ **Search YouTube** - Find any song
✅ **Download MP3s** - With ad/sponsor removal via SponsorBlock
✅ **Create Playlists** - Organize your music
✅ **Offline Library** - Save songs locally
✅ **Cross-Platform** - Works on Mac, Windows, and Linux

## Prerequisites

### Required:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **yt-dlp** - For downloading songs

### Install yt-dlp:

**Mac:**
```bash
brew install yt-dlp
```

**Linux:**
```bash
pip3 install yt-dlp
```

**Windows:**
```bash
pip3 install yt-dlp
```

Or download from: https://github.com/yt-dlp/yt-dlp/releases

## Setup

1. **Clone the repository:**
```bash
git clone https://github.com/andrewnakas/YT_Lemon_String.git
cd YT_Lemon_String
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
cd ..
```

3. **Install Electron dependencies:**
```bash
cd electron
npm install
cd ..
```

4. **Verify yt-dlp is installed:**
```bash
yt-dlp --version
```

## Running the App

### Development Mode:

```bash
cd electron
npm start
```

This will:
1. Start the local backend server
2. Open the desktop app with the GUI
3. Enable DevTools for debugging

### Building Standalone App:

**Mac:**
```bash
cd electron
npm run build:mac
```

**Windows:**
```bash
cd electron
npm run build:win
```

**Linux:**
```bash
cd electron
npm run build:linux
```

The built app will be in `electron/dist/`

## How It Works

1. **Backend Server** - Runs locally on port 3456
   - Scrapes YouTube for search results
   - Handles download requests using local yt-dlp

2. **Electron App** - Desktop GUI
   - Displays the Spotify-like interface
   - Communicates with local backend
   - No cloud server needed!

3. **yt-dlp Integration**
   - Uses your local yt-dlp installation
   - Downloads work perfectly (no bot detection on residential IPs)
   - Automatically removes ads/sponsors with SponsorBlock

## Usage

1. **Search** - Type artist or song name in the search bar
2. **Play** - Click any song to start playing
3. **Download** - Click the ⬇ button to save as MP3
4. **Add to Library** - Click the + button to save to your collection
5. **Create Playlists** - Organize songs into custom playlists

## Troubleshooting

### "yt-dlp not found"
- Make sure yt-dlp is installed: `yt-dlp --version`
- Add yt-dlp to your PATH
- Restart the app after installing

### Downloads fail with "bot detection"
- This shouldn't happen on desktop! The error occurs on cloud servers
- Make sure you're using local yt-dlp (not downloading the binary)
- Check if yt-dlp is up to date: `pip3 install --upgrade yt-dlp`

### App won't start
- Check Node.js version: `node --version` (needs v18+)
- Run `npm install` in both `backend/` and `electron/`
- Check console for error messages

### Backend server errors
- Port 3456 might be in use, kill any existing processes
- Check backend logs in the terminal

## Distribution

To share the app with others:

1. Build the app for your platform (see "Building Standalone App" above)
2. Share the installer from `electron/dist/`
3. Users just need to install yt-dlp separately

## Tech Stack

- **Electron** - Desktop app framework
- **Express** - Local backend server
- **yt-dlp** - YouTube downloader
- **Vanilla JS** - No frameworks, fast and lightweight
- **IndexedDB** - Local storage for library

## Web Version

The web version is also available at: https://andrewnakas.github.io/YT_Lemon_String/

**Note:** Downloads don't work in the web version due to YouTube bot detection on cloud servers. Use the desktop app for downloads!

## License

MIT
