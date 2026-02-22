/* ========================================
   Download Route
   ======================================== */

const express = require('express');
const { downloadAudio, getMetadata } = require('../utils/ytdlp');

const router = express.Router();

/**
 * POST /api/download
 * Download audio from YouTube video
 */
router.post('/download', async (req, res, next) => {
    try {
        const { videoId } = req.body;

        // Validate videoId
        if (!videoId || videoId.trim().length === 0) {
            return res.status(400).json({
                error: 'videoId is required'
            });
        }

        console.log(`[Download] Request for video: ${videoId}`);

        // Get audio stream
        const stream = await downloadAudio(videoId);

        // Set response headers
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', `attachment; filename="${videoId}.mp3"`);

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
