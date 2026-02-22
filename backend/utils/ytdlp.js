/* ========================================
   yt-dlp Wrapper for Audio Downloads
   ======================================== */

const YTDlpWrap = require('yt-dlp-wrap').default;
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Find yt-dlp binary
function findYtDlpPath() {
    try {
        // Try to find yt-dlp in PATH
        const ytdlpPath = execSync('which yt-dlp', { encoding: 'utf-8' }).trim();
        console.log(`[yt-dlp] Found binary at: ${ytdlpPath}`);
        return ytdlpPath;
    } catch (error) {
        console.error('[yt-dlp] Binary not found in PATH');
        return null;
    }
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
        const version = await ytDlpWrap.getVersion();
        console.log(`[yt-dlp] Version: ${version}`);
        return true;
    } catch (error) {
        console.error('[yt-dlp] Not installed or not accessible');
        console.error('[yt-dlp] Run: pip3 install yt-dlp');
        return false;
    }
}

module.exports = {
    downloadAudio,
    getMetadata,
    checkInstalled
};
