/* ========================================
   Backend Server for YT Lemon String
   ======================================== */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const searchRoute = require('./routes/search');
const downloadRoute = require('./routes/download');
const { checkInstalled } = require('./utils/ytdlp');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_DESKTOP = process.env.NODE_ENV === 'desktop';

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files in desktop mode
if (IS_DESKTOP) {
    const frontendPath = path.join(__dirname, '..');
    console.log('[Desktop Mode] Serving static files from:', frontendPath);
    app.use(express.static(frontendPath));
}

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API Routes
app.use('/api', searchRoute);
app.use('/api', downloadRoute);

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('[Error]', error);

    res.status(error.status || 500).json({
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path
    });
});

// Start server
app.listen(PORT, async () => {
    console.log('=================================');
    console.log('YT Lemon String Backend Server');
    console.log('=================================');
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Search API: http://localhost:${PORT}/api/search?q=query`);
    console.log(`Download API: http://localhost:${PORT}/api/download`);
    console.log('✅ Using lightweight scraper (no browser needed!)');

    // Check yt-dlp installation
    const ytdlpInstalled = await checkInstalled();
    if (ytdlpInstalled) {
        console.log('✅ yt-dlp is installed (downloads enabled with ad removal)');
    } else {
        console.log('❌ yt-dlp NOT installed (downloads will fail)');
        console.log('   Run: pip3 install yt-dlp');
    }

    console.log('=================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
