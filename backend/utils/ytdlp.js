/* ========================================
   yt-dlp Wrapper for Audio Downloads
   ======================================== */

const YTDlpWrap = require('yt-dlp-wrap').default;
const path = require('path');
const fs = require('fs');

// Initialize yt-dlp
const ytDlpWrap = new YTDlpWrap();

/**
 * Download audio from YouTube video
 */
async function downloadAudio(videoId) {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
        console.log(`[yt-dlp] Downloading: ${videoUrl}`);

        // Download options
        const options = [
            videoUrl,
            '-f', 'bestaudio',
            '-x', // Extract audio
            '--audio-format', 'mp3',
            '--audio-quality', '0', // Best quality
            '-o', '-', // Output to stdout
            '--no-playlist',
            '--no-warnings',
            '--quiet'
        ];

        // Execute yt-dlp and return stream
        const stream = ytDlpWrap.execStream(options);

        return stream;

    } catch (error) {
        console.error('[yt-dlp] Error:', error.message);
        throw new Error(`Download failed: ${error.message}`);
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
        return false;
    }
}

module.exports = {
    downloadAudio,
    getMetadata,
    checkInstalled
};
