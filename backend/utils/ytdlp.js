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
    // First check if we already downloaded it
    if (fs.existsSync(YTDLP_PATH)) {
        console.log(`[yt-dlp] Using cached binary at: ${YTDLP_PATH}`);
        return YTDLP_PATH;
    }

    // Try to find system yt-dlp
    try {
        const ytdlpPath = execSync('which yt-dlp', { encoding: 'utf-8' }).trim();
        if (ytdlpPath && fs.existsSync(ytdlpPath)) {
            console.log(`[yt-dlp] Found system binary at: ${ytdlpPath}`);
            return ytdlpPath;
        }
    } catch (error) {
        console.log('[yt-dlp] System binary not found, downloading...');
    }

    // Download yt-dlp using yt-dlp-wrap
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
 */
async function downloadAudio(videoId) {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
        console.log(`[yt-dlp] Downloading: ${videoUrl}`);

        // Ensure yt-dlp is available
        const wrap = await getYtDlpWrap();

        // Download options with bot-bypass and SponsorBlock
        const options = [
            videoUrl,
            '-f', 'bestaudio',
            '-x', // Extract audio
            '--audio-format', 'mp3',
            '--audio-quality', '0', // Best quality
            '-o', '-', // Output to stdout
            '--no-playlist',
            '--sponsorblock-remove', 'all', // Remove sponsor segments, intros, outros

            // Bot detection bypass
            '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            '--referer', 'https://www.youtube.com/',
            '--add-header', 'Accept-Language:en-US,en;q=0.9',
            '--add-header', 'Sec-Fetch-Mode:navigate',
            '--extractor-args', 'youtube:player_client=android,web',
            '--extractor-retries', '3',
            '--no-check-certificate',

            '--no-warnings',
            '--quiet'
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
