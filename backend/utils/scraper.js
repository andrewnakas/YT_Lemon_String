/* ========================================
   YouTube Scraper using Puppeteer
   ======================================== */

const puppeteer = require('puppeteer');

/**
 * Search YouTube for videos
 */
async function searchYouTube(query, maxResults = 20) {
    let browser = null;

    try {
        // Launch browser with headless mode
        // Don't specify executablePath - let Puppeteer use its bundled Chromium
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--disable-software-rasterizer',
                '--disable-dev-tools',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--window-size=1920x1080'
            ]
        });

        const page = await browser.newPage();

        // Set viewport and user agent
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        // Navigate to YouTube search
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        console.log(`[Scraper] Searching: ${searchUrl}`);

        await page.goto(searchUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for results to load
        await page.waitForSelector('ytd-video-renderer', { timeout: 10000 });

        // Extract video data
        const results = await page.evaluate((maxResults) => {
            const videos = [];
            const elements = document.querySelectorAll('ytd-video-renderer');

            for (let i = 0; i < Math.min(elements.length, maxResults); i++) {
                const el = elements[i];

                try {
                    // Title and video ID
                    const titleEl = el.querySelector('#video-title');
                    const videoId = titleEl?.getAttribute('href')?.split('v=')[1]?.split('&')[0];
                    const title = titleEl?.getAttribute('title') || titleEl?.textContent?.trim();

                    // Channel (artist)
                    const channelEl = el.querySelector('#channel-name a') ||
                                    el.querySelector('yt-formatted-string.ytd-channel-name a');
                    const artist = channelEl?.textContent?.trim();

                    // Thumbnail
                    const thumbnailEl = el.querySelector('img');
                    let thumbnail = thumbnailEl?.src;

                    // Sometimes thumbnail is in data-thumb attribute
                    if (!thumbnail || thumbnail.includes('data:image')) {
                        thumbnail = thumbnailEl?.getAttribute('data-thumb') ||
                                  thumbnailEl?.getAttribute('src') ||
                                  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                    }

                    // Duration
                    const durationEl = el.querySelector('ytd-thumbnail-overlay-time-status-renderer span') ||
                                     el.querySelector('#time-status span');
                    const duration = durationEl?.textContent?.trim();

                    // Only add if we have required data
                    if (videoId && title && artist) {
                        videos.push({
                            id: videoId,
                            title: title,
                            artist: artist,
                            thumbnail: thumbnail,
                            duration: duration || ''
                        });
                    }
                } catch (err) {
                    console.error('Error parsing video element:', err);
                }
            }

            return videos;
        }, maxResults);

        await browser.close();

        console.log(`[Scraper] Found ${results.length} results`);
        return results;

    } catch (error) {
        console.error('[Scraper] Error:', error.message);
        console.error('[Scraper] Full error:', error);

        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('[Scraper] Error closing browser:', closeError);
            }
        }

        throw new Error(`Scraping failed: ${error.message}`);
    }
}

module.exports = { searchYouTube };
