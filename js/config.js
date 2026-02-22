/* ========================================
   Application Configuration
   ======================================== */

const CONFIG = {
    // Backend API URL (auto-detect Electron vs Web)
    BACKEND_URL: (typeof window !== 'undefined' && window.electronAPI)
        ? 'http://localhost:3456'
        : 'https://yt-lemon-string.onrender.com',

    // App Info
    APP_NAME: 'YT Lemon String',
    APP_VERSION: '1.0.0',

    // Storage Keys
    STORAGE_KEYS: {
        SONGS: 'ytls_songs',
        PLAYLISTS: 'ytls_playlists',
        SETTINGS: 'ytls_settings',
        QUEUE: 'ytls_queue',
        CURRENT_SONG: 'ytls_current_song'
    },

    // Database Info
    DB_NAME: 'YTLemonString',
    DB_VERSION: 1,

    // Search Settings
    SEARCH_DEBOUNCE_MS: 300,
    MAX_SEARCH_RESULTS: 20,

    // Player Settings
    DEFAULT_VOLUME: 70,
    UPDATE_INTERVAL_MS: 100, // How often to update progress bar

    // Queue Settings
    MAX_QUEUE_SIZE: 500,

    // UI Settings
    ANIMATION_DURATION_MS: 250,
    TOAST_DURATION_MS: 3000,

    // Feature Flags
    FEATURES: {
        OFFLINE_MODE: true,
        BACKGROUND_PLAYBACK: true,
        MEDIA_SESSION: true,
        INSTALL_PROMPT: true
    },

    // YouTube iframe API
    YOUTUBE_PLAYER_ID: 'youtubePlayer',

    // Error Messages
    ERRORS: {
        NETWORK: 'Network error. Please check your connection.',
        BACKEND_UNAVAILABLE: 'Backend server is unavailable. Search and download features disabled.',
        SEARCH_FAILED: 'Search failed. Please try again.',
        DOWNLOAD_FAILED: 'Download failed. Please try again.',
        STORAGE_FULL: 'Storage is full. Please remove some items.',
        PLAYBACK_ERROR: 'Playback error. Skipping to next song.'
    },

    // Success Messages
    SUCCESS: {
        ADDED_TO_LIBRARY: 'Added to library',
        REMOVED_FROM_LIBRARY: 'Removed from library',
        PLAYLIST_CREATED: 'Playlist created',
        PLAYLIST_DELETED: 'Playlist deleted',
        DOWNLOAD_COMPLETE: 'Download complete'
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.STORAGE_KEYS);
Object.freeze(CONFIG.FEATURES);
Object.freeze(CONFIG.ERRORS);
Object.freeze(CONFIG.SUCCESS);
