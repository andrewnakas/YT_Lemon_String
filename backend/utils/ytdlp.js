/* ========================================
   yt-dlp Wrapper for Audio Downloads
   ======================================== */

const YTDlpWrap = require('yt-dlp-wrap').default;
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Find yt-dlp binary
function findYtDlpPath() {
    // First try 'which' command (will find it in virtualenv or system PATH)
    try {
        const ytdlpPath = execSync('which yt-dlp', { encoding: 'utf-8' }).trim();
        if (ytdlpPath && fs.existsSync(ytdlpPath)) {
            console.log(`[yt-dlp] Found binary via 'which': ${ytdlpPath}`);
            return ytdlpPath;
        }
    } catch (error) {
        console.log('[yt-dlp] Binary not found via "which", trying common paths...');
    }

    // Common paths where yt-dlp might be installed
    const commonPaths = [
        '/opt/render/project/.venv/bin/yt-dlp',  // Poetry virtualenv
        '/opt/render/.local/bin/yt-dlp',         // User install
        '/usr/local/bin/yt-dlp',                 // System install
        '/usr/bin/yt-dlp',                       // System install
        'yt-dlp'                                  // Let yt-dlp-wrap find it in PATH
    ];

    // Try common paths
    for (const checkPath of commonPaths) {
        if (checkPath === 'yt-dlp') {
            console.log(`[yt-dlp] Trying default: ${checkPath}`);
            return checkPath;
        }
        if (fs.existsSync(checkPath)) {
            console.log(`[yt-dlp] Found binary at: ${checkPath}`);
            return checkPath;
        } else {
            console.log(`[yt-dlp] Not found at: ${checkPath}`);
        }
    }

    console.error('[yt-dlp] Binary not found in any common location');
    console.error('[yt-dlp] Checked paths:', commonPaths);
    return null;
}

// Initialize yt-dlp with binary path
const ytdlpBinary = findYtDlpPath();
const ytDlpWrap = ytdlpBinary ? new YTDlpWrap(ytdlpBinary) : new YTDlpWrap();

/**
 * Download audio from YouTube video
 */
async function downloadAudio(videoId) {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
        console.log(`[yt-dlp] Downloading: ${videoUrl}`);

        if (!ytdlpBinary) {
            throw new Error('yt-dlp binary not found. Please install with: pip3 install yt-dlp');
        }

        // Download options with SponsorBlock to remove ads/sponsors
        const options = [
            videoUrl,
            '-f', 'bestaudio',
            '-x', // Extract audio
            '--audio-format', 'mp3',
            '--audio-quality', '0', // Best quality
            '-o', '-', // Output to stdout
            '--no-playlist',
            '--sponsorblock-remove', 'all', // Remove sponsor segments, intros, outros
            '--no-warnings',
            '--quiet',
            '--no-check-certificate'
        ];

        console.log(`[yt-dlp] Executing with options:`, options.slice(1).join(' '));

        // Execute yt-dlp and return stream
        const stream = ytDlpWrap.execStream(options);

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

        const metadata = await ytDlpWrap.getVideoInfo(videoUrl);

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
 * Check if yt-dlp is installed
 */
async function checkInstalled() {
    try {
        if (!ytdlpBinary) {
            console.error('[yt-dlp] Binary path not found');
            return false;
        }

        const version = await ytDlpWrap.getVersion();
        console.log(`[yt-dlp] Version: ${version}`);
        console.log(`[yt-dlp] Binary path: ${ytdlpBinary}`);
        return true;
    } catch (error) {
        console.error('[yt-dlp] Not installed or not accessible:', error.message);
        console.error('[yt-dlp] Run: pip3 install yt-dlp');
        return false;
    }
}

module.exports = {
    downloadAudio,
    getMetadata,
    checkInstalled
};
