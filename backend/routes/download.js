/* ========================================
   Download Route
   ======================================== */

const express = require('express');
const { downloadAudio, getMetadata } = require('../utils/ytdlp');
const path = require('path');
const os = require('os');
const fs = require('fs');

const router = express.Router();

// Apple Music auto-import folder
const APPLE_MUSIC_AUTO_ADD = path.join(
    os.homedir(),
    'Music/Music/Media/Automatically Add to Music.localized'
);

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

        // Desktop mode: Save to Apple Music auto-import folder
        if (isDesktop) {
            // Check if Apple Music folder exists
            const appleMusicExists = fs.existsSync(APPLE_MUSIC_AUTO_ADD);

            if (appleMusicExists) {
                console.log('[Download] Saving to Apple Music auto-import folder');

                // Sanitize filename
                const sanitizedTitle = (title || videoId)
                    .replace(/[<>:"/\\|?*]/g, '')
                    .substring(0, 200);
                const filename = `${sanitizedTitle}.mp3`;
                const outputPath = path.join(APPLE_MUSIC_AUTO_ADD, filename);

                // Download to file
                const stream = await downloadAudio(videoId, outputPath);

                // Wait for download to complete
                await new Promise((resolve, reject) => {
                    stream.on('close', resolve);
                    stream.on('error', reject);
                });

                console.log(`[Download] Saved to: ${outputPath}`);
                console.log('[Download] Apple Music will auto-import this file');

                return res.json({
                    success: true,
                    message: 'Downloaded! Apple Music will import automatically.',
                    path: outputPath
                });
            } else {
                console.warn('[Download] Apple Music folder not found, streaming to browser instead');
            }
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
