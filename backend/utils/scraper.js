/* ========================================
   YouTube Scraper using Axios + Cheerio (No Browser Needed!)
   ======================================== */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Search YouTube for videos - lightweight, no Puppeteer!
 */
async function searchYouTube(query, maxResults = 20) {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[Scraper] Searching: ${query} (attempt ${attempt}/${maxRetries})`);

            // Fetch YouTube search page
            const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                },
                timeout: 30000, // Increased to 30 seconds
                maxRedirects: 5
            });

        // Extract video data from YouTube's initial data
        const html = response.data;

        // YouTube embeds data in a script tag
        const initialDataMatch = html.match(/var ytInitialData = ({.+?});/);

        if (!initialDataMatch) {
            throw new Error('Could not find YouTube data in page');
        }

        const data = JSON.parse(initialDataMatch[1]);

        // Navigate to video results
        const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

        const videos = [];

        for (const section of contents) {
            const items = section?.itemSectionRenderer?.contents || [];

            for (const item of items) {
                if (videos.length >= maxResults) break;

                const videoRenderer = item.videoRenderer;
                if (!videoRenderer) continue;

                try {
                    const videoId = videoRenderer.videoId;
                    const title = videoRenderer.title?.runs?.[0]?.text || videoRenderer.title?.simpleText;
                    const artist = videoRenderer.ownerText?.runs?.[0]?.text || videoRenderer.shortBylineText?.runs?.[0]?.text;

                    // Get thumbnail
                    const thumbnails = videoRenderer.thumbnail?.thumbnails || [];
                    const thumbnail = thumbnails[thumbnails.length - 1]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

                    // Get duration
                    const lengthText = videoRenderer.lengthText?.simpleText || '';

                    if (videoId && title && artist) {
                        videos.push({
                            id: videoId,
                            title: title,
                            artist: artist,
                            thumbnail: thumbnail.startsWith('//') ? 'https:' + thumbnail : thumbnail,
                            duration: lengthText
                        });
                    }
                } catch (err) {
                    console.error('[Scraper] Error parsing video:', err.message);
                }
            }

            if (videos.length >= maxResults) break;
        }

            console.log(`[Scraper] Found ${videos.length} results`);
            return videos;

        } catch (error) {
            lastError = error;
            console.error(`[Scraper] Attempt ${attempt} failed:`, error.message);

            if (attempt < maxRetries) {
                const delay = attempt * 2000; // 2s, 4s backoff
                console.log(`[Scraper] Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // All retries failed
    console.error('[Scraper] All retry attempts failed');
    throw new Error(`Scraping failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
}

module.exports = { searchYouTube };
