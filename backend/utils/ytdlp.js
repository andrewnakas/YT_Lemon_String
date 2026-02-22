/* ========================================
   yt-dlp Wrapper for Audio Downloads
   ======================================== */

const YTDlpWrap = require('yt-dlp-wrap').default;
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Download directory for yt-dlp binary
const YTDLP_DIR = path.join(__dirname, '../../.ytdlp');
const YTDLP_PATH = path.join(YTDLP_DIR, 'yt-dlp');

// Ensure download directory exists
if (!fs.existsSync(YTDLP_DIR)) {
    fs.mkdirSync(YTDLP_DIR, { recursive: true });
}

// Find or download yt-dlp binary
async function ensureYtDlp() {
    // In desktop mode, prefer system yt-dlp (no bot detection on residential IPs!)
    const isDesktop = process.env.NODE_ENV === 'desktop';

    // Try to find system yt-dlp first (especially important for desktop)
    try {
        const ytdlpPath = execSync('which yt-dlp', { encoding: 'utf-8' }).trim();
        if (ytdlpPath && fs.existsSync(ytdlpPath)) {
            console.log(`[yt-dlp] Found system binary at: ${ytdlpPath}`);
            if (isDesktop) {
                console.log('[yt-dlp] ✅ Using local yt-dlp (no bot detection!)');
            }
            return ytdlpPath;
        }
    } catch (error) {
        console.log('[yt-dlp] System binary not found');
    }

    // Check if we already downloaded it
    if (fs.existsSync(YTDLP_PATH)) {
        console.log(`[yt-dlp] Using cached binary at: ${YTDLP_PATH}`);
        return YTDLP_PATH;
    }

    // If in desktop mode and no system yt-dlp, show helpful message
    if (isDesktop) {
        console.log('[yt-dlp] ⚠️  System yt-dlp not found');
        console.log('[yt-dlp] Install it for best results:');
        console.log('[yt-dlp]   Mac: brew install yt-dlp');
        console.log('[yt-dlp]   Linux: pip3 install yt-dlp');
        console.log('[yt-dlp]   Windows: pip3 install yt-dlp');
        console.log('[yt-dlp] Downloading fallback binary...');
    }

    // Download yt-dlp using yt-dlp-wrap (fallback)
    try {
        console.log('[yt-dlp] Downloading binary...');
        await YTDlpWrap.downloadFromGithub(YTDLP_PATH);

        // Make executable
        fs.chmodSync(YTDLP_PATH, '755');

        console.log(`[yt-dlp] Downloaded successfully to: ${YTDLP_PATH}`);
        return YTDLP_PATH;
    } catch (error) {
        console.error('[yt-dlp] Failed to download:', error.message);
        throw new Error('yt-dlp binary not available');
    }
}

// Initialize - will be set on first use
let ytDlpWrap = null;
let initPromise = null;

// Get or initialize yt-dlp wrapper
async function getYtDlpWrap() {
    if (ytDlpWrap) return ytDlpWrap;

    if (!initPromise) {
        initPromise = ensureYtDlp().then(binaryPath => {
            ytDlpWrap = new YTDlpWrap(binaryPath);
            return ytDlpWrap;
        });
    }

    return initPromise;
}

/**
 * Download audio from YouTube video
 * @param {string} videoId - YouTube video ID
 * @param {string} outputPath - Optional file path to save (defaults to stdout stream)
 */
async function downloadAudio(videoId, outputPath = null) {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
        console.log(`[yt-dlp] Downloading: ${videoUrl}`);
        if (outputPath) {
            console.log(`[yt-dlp] Output to file: ${outputPath}`);
        }

        // Ensure yt-dlp is available
        const wrap = await getYtDlpWrap();

        // Download options - simplified and more compatible
        const options = [
            videoUrl,
            '-f', 'bestaudio/best', // Try best audio, fallback to best quality
            '-x', // Extract audio
            '--audio-format', 'mp3',
            '--audio-quality', '0', // Best quality
            '-o', outputPath || '-', // Output to file or stdout
            '--no-playlist',

            // Remove ads and sponsors
            '--sponsorblock-remove', 'sponsor,intro,outro,selfpromo,interaction',

            // Compatibility and reliability
            '--prefer-free-formats',
            '--no-check-certificate',
            '--geo-bypass',

            // Less aggressive options that work better
            '--retries', '5',
            '--fragment-retries', '5',

            // Only show errors
            '--no-warnings'
        ];

        console.log(`[yt-dlp] Executing with options:`, options.slice(1).join(' '));

        // Execute yt-dlp and return stream
        const stream = wrap.execStream(options);

        // Handle stream errors
        stream.on('error', (err) => {
            console.error('[yt-dlp] Stream error:', err);
        });

        return stream;

    } catch (error) {
        console.error('[yt-dlp] Error:', error);
        throw new Error(`Download failed: ${error.message || 'Unknown error'}`);
    }
}

/**
 * Get video metadata
 */
async function getMetadata(videoId) {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
        console.log(`[yt-dlp] Getting metadata: ${videoUrl}`);

        const wrap = await getYtDlpWrap();
        const metadata = await wrap.getVideoInfo(videoUrl);

        return {
            id: metadata.id,
            title: metadata.title,
            artist: metadata.uploader || metadata.channel,
            thumbnail: metadata.thumbnail,
            duration: metadata.duration,
            description: metadata.description
        };

    } catch (error) {
        console.error('[yt-dlp] Metadata error:', error.message);
        throw new Error(`Failed to get metadata: ${error.message}`);
    }
}

/**
 * Check if yt-dlp is installed or can be downloaded
 */
async function checkInstalled() {
    try {
        const wrap = await getYtDlpWrap();
        const version = await wrap.getVersion();
        console.log(`[yt-dlp] Version: ${version}`);
        return true;
    } catch (error) {
        console.error('[yt-dlp] Not available:', error.message);
        return false;
    }
}

module.exports = {
    downloadAudio,
    getMetadata,
    checkInstalled
};
