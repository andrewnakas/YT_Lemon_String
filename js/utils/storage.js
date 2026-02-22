/* ========================================
   IndexedDB Storage Wrapper
   ======================================== */

class Storage {
    constructor() {
        this.db = null;
        this.dbName = CONFIG.DB_NAME;
        this.dbVersion = CONFIG.DB_VERSION;
        this.initPromise = null;
        this.isReady = false;
    }

    /**
     * Wait for storage to be ready
     */
    async ensureReady() {
        if (this.isReady) return;
        if (this.initPromise) {
            await this.initPromise;
            return;
        }
        // If init hasn't been called yet, call it
        await this.init();
    }

    /**
     * Initialize database
     */
    async init() {
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            if (!supportsIndexedDB()) {
                console.warn('IndexedDB not supported. Using fallback storage.');
                await this.initFallback();
                this.isReady = true;
                return;
            }

            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.dbVersion);

                request.onerror = () => {
                    console.error('IndexedDB error:', request.error);
                    reject(request.error);
                };

                request.onsuccess = () => {
                    this.db = request.result;
                    this.isReady = true;
                    console.log('IndexedDB initialized');
                    resolve();
                };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Songs store
                if (!db.objectStoreNames.contains('songs')) {
                    const songsStore = db.createObjectStore('songs', { keyPath: 'id' });
                    songsStore.createIndex('title', 'title', { unique: false });
                    songsStore.createIndex('artist', 'artist', { unique: false });
                    songsStore.createIndex('addedAt', 'addedAt', { unique: false });
                }

                // Playlists store
                if (!db.objectStoreNames.contains('playlists')) {
                    const playlistsStore = db.createObjectStore('playlists', { keyPath: 'id' });
                    playlistsStore.createIndex('name', 'name', { unique: false });
                    playlistsStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // Settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
            });
        })();

        return this.initPromise;
    }

    /**
     * Fallback to localStorage if IndexedDB not available
     */
    initFallback() {
        this.useFallback = true;
        console.log('Using localStorage fallback');
    }

    /**
     * Get all items from a store
     */
    async getAll(storeName) {
        await this.ensureReady();

        if (this.useFallback) {
            const data = localStorage.getItem(`${this.dbName}_${storeName}`);
            return data ? JSON.parse(data) : [];
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get item by ID
     */
    async get(storeName, id) {
        await this.ensureReady();

        if (this.useFallback) {
            const all = await this.getAll(storeName);
            return all.find(item => item.id === id);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Add or update item
     */
    async put(storeName, item) {
        if (this.useFallback) {
            const all = await this.getAll(storeName);
            const index = all.findIndex(i => i.id === item.id);

            if (index >= 0) {
                all[index] = item;
            } else {
                all.push(item);
            }

            localStorage.setItem(`${this.dbName}_${storeName}`, JSON.stringify(all));
            return item.id;
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(item);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Delete item by ID
     */
    async delete(storeName, id) {
        if (this.useFallback) {
            const all = await this.getAll(storeName);
            const filtered = all.filter(item => item.id !== id);
            localStorage.setItem(`${this.dbName}_${storeName}`, JSON.stringify(filtered));
            return;
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all items from store
     */
    async clear(storeName) {
        if (this.useFallback) {
            localStorage.removeItem(`${this.dbName}_${storeName}`);
            return;
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Count items in store
     */
    async count(storeName) {
        if (this.useFallback) {
            const all = await this.getAll(storeName);
            return all.length;
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Search songs by title or artist
     */
    async searchSongs(query) {
        const all = await this.getAll('songs');
        const lowerQuery = query.toLowerCase();

        return all.filter(song =>
            song.title.toLowerCase().includes(lowerQuery) ||
            song.artist.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Check if song exists in library
     */
    async hasSong(id) {
        const song = await this.get('songs', id);
        return !!song;
    }

    /**
     * Add song to library
     */
    async addSong(song) {
        const songData = {
            id: song.id,
            title: song.title,
            artist: song.artist,
            thumbnail: song.thumbnail,
            duration: song.duration || 0,
            addedAt: Date.now(),
            playCount: 0,
            lastPlayed: null
        };

        await this.put('songs', songData);
        return songData;
    }

    /**
     * Remove song from library
     */
    async removeSong(id) {
        await this.delete('songs', id);

        // Remove from all playlists
        const playlists = await this.getAll('playlists');
        for (const playlist of playlists) {
            if (playlist.songs.includes(id)) {
                playlist.songs = playlist.songs.filter(songId => songId !== id);
                playlist.updatedAt = Date.now();
                await this.put('playlists', playlist);
            }
        }
    }

    /**
     * Update play count
     */
    async updatePlayCount(id) {
        const song = await this.get('songs', id);
        if (song) {
            song.playCount = (song.playCount || 0) + 1;
            song.lastPlayed = Date.now();
            await this.put('songs', song);
        }
    }

    /**
     * Create playlist
     */
    async createPlaylist(name, description = '') {
        const playlist = {
            id: generateId(),
            name,
            description,
            songs: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await this.put('playlists', playlist);
        return playlist;
    }

    /**
     * Update playlist
     */
    async updatePlaylist(id, updates) {
        const playlist = await this.get('playlists', id);
        if (!playlist) throw new Error('Playlist not found');

        Object.assign(playlist, updates);
        playlist.updatedAt = Date.now();

        await this.put('playlists', playlist);
        return playlist;
    }

    /**
     * Delete playlist
     */
    async deletePlaylist(id) {
        await this.delete('playlists', id);
    }

    /**
     * Add song to playlist
     */
    async addSongToPlaylist(playlistId, songId) {
        const playlist = await this.get('playlists', playlistId);
        if (!playlist) throw new Error('Playlist not found');

        if (!playlist.songs.includes(songId)) {
            playlist.songs.push(songId);
            playlist.updatedAt = Date.now();
            await this.put('playlists', playlist);
        }

        return playlist;
    }

    /**
     * Remove song from playlist
     */
    async removeSongFromPlaylist(playlistId, songId) {
        const playlist = await this.get('playlists', playlistId);
        if (!playlist) throw new Error('Playlist not found');

        playlist.songs = playlist.songs.filter(id => id !== songId);
        playlist.updatedAt = Date.now();
        await this.put('playlists', playlist);

        return playlist;
    }

    /**
     * Get playlist with populated song data
     */
    async getPlaylistWithSongs(playlistId) {
        const playlist = await this.get('playlists', playlistId);
        if (!playlist) return null;

        const songs = await Promise.all(
            playlist.songs.map(songId => this.get('songs', songId))
        );

        return {
            ...playlist,
            songs: songs.filter(Boolean) // Filter out null songs
        };
    }

    /**
     * Get or set setting
     */
    async getSetting(key, defaultValue = null) {
        const setting = await this.get('settings', key);
        return setting ? setting.value : defaultValue;
    }

    async setSetting(key, value) {
        await this.put('settings', { key, value });
    }
}

// Create global storage instance
const storage = new Storage();
