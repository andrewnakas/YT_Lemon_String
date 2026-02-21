/* ========================================
   Search Route
   ======================================== */

const express = require('express');
const { searchYouTube } = require('../utils/scraper');

const router = express.Router();

/**
 * GET /api/search
 * Search YouTube for videos
 */
router.get('/search', async (req, res, next) => {
    try {
        const { q, maxResults } = req.query;

        // Validate query
        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                error: 'Query parameter "q" is required'
            });
        }

        const query = q.trim();
        const max = parseInt(maxResults) || 20;

        // Perform search
        const results = await searchYouTube(query, max);

        res.json({
            query,
            results,
            count: results.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[Search] Error:', error);
        next(error);
    }
});

module.exports = router;
