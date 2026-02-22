/* ========================================
   Download Route
   ======================================== */

const express = require('express');
const { downloadAudio, getMetadata } = require('../utils/ytdlp');
const path = require('path');
const os = require('os');
const fs = require('fs');

const router = express.Router();

// Possible Apple Music auto-import folders (try multiple locations)
const APPLE_MUSIC_PATHS = [
    path.join(os.homedir(), 'Music/Music/Media/Automatically Add to Music.localized'),
    path.join(os.homedir(), 'Music/Music/Media.localized/Automatically Add to Music.localized'),
    path.join(os.homedir(), 'Music/iTunes/iTunes Media/Automatically Add to iTunes.localized'),
    path.join(os.homedir(), 'Music/iTunes/iTunes Media/Automatically Add to iTunes')
];

// Default download folder
const DOWNLOADS_FOLDER = path.join(os.homedir(), 'Downloads');

/**
 * Find or create Apple Music auto-import folder
 */
function getDownloadFolder() {
    // Check for custom download path from environment variable
    const customPath = process.env.DOWNLOAD_PATH;
    if (customPath && fs.existsSync(customPath)) {
        console.log(`[Download] Using custom download folder: ${customPath}`);
        return { path: customPath, type: 'custom' };
    }

    // Try to find existing Apple Music folder
    for (const musicPath of APPLE_MUSIC_PATHS) {
        if (fs.existsSync(musicPath)) {
            console.log(`[Download] Found Apple Music folder: ${musicPath}`);
            return { path: musicPath, type: 'apple-music' };
        }
    }

    // Try to create the primary Apple Music folder
    const primaryPath = APPLE_MUSIC_PATHS[0];
    try {
        const musicDir = path.dirname(primaryPath);
        if (fs.existsSync(musicDir)) {
            fs.mkdirSync(primaryPath, { recursive: true });
            console.log(`[Download] Created Apple Music folder: ${primaryPath}`);
            return { path: primaryPath, type: 'apple-music' };
        }
    } catch (error) {
        console.log(`[Download] Could not create Apple Music folder: ${error.message}`);
    }

    // Fall back to Downloads folder
    console.log(`[Download] Using Downloads folder: ${DOWNLOADS_FOLDER}`);
    return { path: DOWNLOADS_FOLDER, type: 'downloads' };
}

/**
 * POST /api/download
 * Download audio from YouTube video
 */
router.post('/download', async (req, res, next) => {
    try {
        const { videoId, title } = req.body;

        // Validate videoId
        if (!videoId || videoId.trim().length === 0) {
            return res.status(400).json({
                error: 'videoId is required'
            });
        }

        console.log(`[Download] Request for video: ${videoId}`);

        const isDesktop = process.env.NODE_ENV === 'desktop';

        // Desktop mode: Save to local folder
        if (isDesktop) {
            const downloadFolder = getDownloadFolder();

            // Sanitize filename
            const sanitizedTitle = (title || videoId)
                .replace(/[<>:"/\\|?*]/g, '')
                .substring(0, 200);
            const filename = `${sanitizedTitle}.mp3`;
            const outputPath = path.join(downloadFolder.path, filename);

            console.log(`[Download] Saving to: ${outputPath}`);

            // Download to file
            const stream = await downloadAudio(videoId, outputPath);

            // Wait for download to complete
            await new Promise((resolve, reject) => {
                stream.on('close', resolve);
                stream.on('error', reject);
            });

            console.log(`[Download] Saved successfully!`);

            const message = downloadFolder.type === 'apple-music'
                ? 'Downloaded! Apple Music will import automatically.'
                : `Downloaded to ${path.basename(downloadFolder.path)} folder!`;

            return res.json({
                success: true,
                message,
                path: outputPath,
                folder: downloadFolder.type
            });
        }

        // Web mode or fallback: Stream to client
        const stream = await downloadAudio(videoId);

        // Set response headers
        res.setHeader('Content-Type', 'audio/mpeg');
        const sanitizedTitle = (title || videoId).replace(/[<>:"/\\|?*]/g, '');
        res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.mp3"`);

        // Pipe stream to response
        stream.pipe(res);

        stream.on('error', (error) => {
            console.error('[Download] Stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Download failed' });
            }
        });

    } catch (error) {
        console.error('[Download] Error:', error);

        // Return detailed error to client
        if (!res.headersSent) {
            res.status(500).json({
                error: error.message || 'Download failed',
                details: error.toString()
            });
        }
    }
});

/**
 * GET /api/metadata
 * Get video metadata
 */
router.get('/metadata', async (req, res, next) => {
    try {
        const { videoId } = req.query;

        if (!videoId) {
            return res.status(400).json({
                error: 'videoId is required'
            });
        }

        const metadata = await getMetadata(videoId);

        res.json({
            metadata,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[Metadata] Error:', error);
        next(error);
    }
});

module.exports = router;
