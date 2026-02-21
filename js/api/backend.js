/* ========================================
   Backend API Client
   ======================================== */

class BackendAPI {
    constructor() {
        this.baseURL = CONFIG.BACKEND_URL;
        this.isAvailable = null; // null = unknown, true = available, false = unavailable
    }

    /**
     * Check if backend is available
     */
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            this.isAvailable = response.ok;
            return this.isAvailable;
        } catch (error) {
            console.error('Backend health check failed:', error);
            this.isAvailable = false;
            return false;
        }
    }

    /**
     * Search YouTube for videos
     */
    async search(query) {
        if (this.isAvailable === false) {
            throw new Error(CONFIG.ERRORS.BACKEND_UNAVAILABLE);
        }

        try {
            const response = await fetch(
                `${this.baseURL}/api/search?q=${encodeURIComponent(query)}`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (!response.ok) {
                throw new Error(`Search failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Search error:', error);

            // Mark backend as unavailable if connection failed
            if (error.message.includes('Failed to fetch')) {
                this.isAvailable = false;
                throw new Error(CONFIG.ERRORS.BACKEND_UNAVAILABLE);
            }

            throw new Error(CONFIG.ERRORS.SEARCH_FAILED);
        }
    }

    /**
     * Download song as MP3
     */
    async download(videoId, title) {
        if (this.isAvailable === false) {
            throw new Error(CONFIG.ERRORS.BACKEND_UNAVAILABLE);
        }

        try {
            showLoading('Preparing download...');

            const response = await fetch(`${this.baseURL}/api/download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId })
            });

            if (!response.ok) {
                throw new Error(`Download failed: ${response.statusText}`);
            }

            // Get blob from response
            const blob = await response.blob();

            // Sanitize filename
            const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;

            // Download file
            downloadBlob(blob, filename);

            hideLoading();
            showToast(CONFIG.SUCCESS.DOWNLOAD_COMPLETE, 'success');

            return true;
        } catch (error) {
            console.error('Download error:', error);
            hideLoading();

            // Mark backend as unavailable if connection failed
            if (error.message.includes('Failed to fetch')) {
                this.isAvailable = false;
                throw new Error(CONFIG.ERRORS.BACKEND_UNAVAILABLE);
            }

            throw new Error(CONFIG.ERRORS.DOWNLOAD_FAILED);
        }
    }

    /**
     * Get video metadata
     */
    async getMetadata(videoId) {
        if (this.isAvailable === false) {
            throw new Error(CONFIG.ERRORS.BACKEND_UNAVAILABLE);
        }

        try {
            const response = await fetch(
                `${this.baseURL}/api/metadata?videoId=${videoId}`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (!response.ok) {
                throw new Error(`Metadata fetch failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Metadata error:', error);

            if (error.message.includes('Failed to fetch')) {
                this.isAvailable = false;
            }

            throw error;
        }
    }

    /**
     * Batch search (for autocomplete)
     */
    async searchSuggestions(query) {
        if (this.isAvailable === false || query.length < 2) {
            return [];
        }

        try {
            const response = await fetch(
                `${this.baseURL}/api/suggestions?q=${encodeURIComponent(query)}`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (!response.ok) {
                return [];
            }

            const data = await response.json();
            return data.suggestions || [];
        } catch (error) {
            console.error('Suggestions error:', error);
            return [];
        }
    }
}

// Create global API instance
const backendAPI = new BackendAPI();

// Check backend health on load
backendAPI.checkHealth().then(available => {
    if (!available) {
        console.warn('Backend server is unavailable. Some features will be disabled.');
        showToast('Backend server unavailable. Search and download features disabled.', 'warning', 5000);
    } else {
        console.log('Backend server is available');
    }
});
