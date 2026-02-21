/* ========================================
   Search Component
   ======================================== */

class SearchComponent {
    constructor() {
        this.elements = {
            searchInput: $('#searchInput'),
            searchButton: $('#searchButton'),
            searchResults: $('#searchResults')
        };

        this.currentQuery = '';
        this.results = [];

        this.init();
    }

    /**
     * Initialize search component
     */
    init() {
        this.attachEventListeners();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Search button click
        this.elements.searchButton?.addEventListener('click', () => {
            this.performSearch();
        });

        // Enter key on search input
        this.elements.searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Debounced search on input
        const debouncedSearch = debounce(() => {
            if (this.elements.searchInput.value.trim().length > 2) {
                this.performSearch();
            }
        }, CONFIG.SEARCH_DEBOUNCE_MS);

        this.elements.searchInput?.addEventListener('input', debouncedSearch);
    }

    /**
     * Perform search
     */
    async performSearch() {
        const query = this.elements.searchInput?.value.trim();

        if (!query) {
            showToast('Please enter a search term', 'warning');
            return;
        }

        if (query === this.currentQuery) {
            return; // Same query, don't search again
        }

        this.currentQuery = query;

        try {
            showLoading('Searching...');

            const results = await backendAPI.search(query);

            this.results = results;
            this.renderResults(results);

            hideLoading();
        } catch (error) {
            console.error('Search error:', error);
            hideLoading();
            showToast(error.message, 'error');

            // Show error state
            this.renderError(error.message);
        }
    }

    /**
     * Render search results
     */
    renderResults(results) {
        clearChildren(this.elements.searchResults);

        if (results.length === 0) {
            this.renderEmpty();
            return;
        }

        results.forEach(song => {
            const card = this.createSongCard(song);
            this.elements.searchResults.appendChild(card);
        });
    }

    /**
     * Create song card element
     */
    createSongCard(song) {
        const card = createElement('div', {
            className: 'song-card',
            dataset: { songId: song.id }
        });

        // Thumbnail
        const thumbnail = createElement('img', {
            className: 'song-card-thumbnail',
            src: song.thumbnail || 'https://via.placeholder.com/300x300/282828/b3b3b3.png?text=Music',
            alt: song.title,
            loading: 'lazy'
        });

        // Info
        const info = createElement('div', {
            className: 'song-card-info'
        });

        const title = createElement('div', {
            className: 'song-card-title'
        }, [sanitizeHTML(song.title)]);

        const artist = createElement('div', {
            className: 'song-card-artist'
        }, [sanitizeHTML(song.artist)]);

        info.appendChild(title);
        info.appendChild(artist);

        // Duration (if available)
        let duration = null;
        if (song.duration) {
            duration = createElement('div', {
                className: 'song-card-duration'
            }, [song.duration]);
        }

        // Actions
        const actions = createElement('div', {
            className: 'song-card-actions'
        });

        // Play button
        const playBtn = createElement('button', {
            className: 'song-card-btn',
            'aria-label': 'Play',
            title: 'Play',
            onclick: (e) => {
                e.stopPropagation();
                this.playSong(song);
            }
        }, ['▶']);

        // Add to library button
        const addBtn = createElement('button', {
            className: 'song-card-btn',
            'aria-label': 'Add to library',
            title: 'Add to library',
            onclick: async (e) => {
                e.stopPropagation();
                await this.addToLibrary(song, addBtn);
            }
        }, ['♥']);

        // Add to playlist button
        const playlistBtn = createElement('button', {
            className: 'song-card-btn',
            'aria-label': 'Add to playlist',
            title: 'Add to playlist',
            onclick: (e) => {
                e.stopPropagation();
                this.addToPlaylist(song);
            }
        }, ['+']);

        actions.appendChild(playBtn);
        actions.appendChild(addBtn);
        actions.appendChild(playlistBtn);

        // Assemble card
        card.appendChild(thumbnail);
        card.appendChild(info);
        if (duration) card.appendChild(duration);
        card.appendChild(actions);

        // Click on card to play
        card.addEventListener('click', () => this.playSong(song));

        // Check if already in library
        this.updateCardLikeButton(song.id, addBtn);

        return card;
    }

    /**
     * Play song
     */
    playSong(song) {
        // Play this song and set queue to search results
        musicPlayer.play(song, this.results);

        showToast(`Now playing: ${song.title}`, 'success', 2000);
    }

    /**
     * Add song to library
     */
    async addToLibrary(song, button) {
        try {
            const isInLibrary = await storage.hasSong(song.id);

            if (isInLibrary) {
                await storage.removeSong(song.id);
                button.classList.remove('active');
                showToast(CONFIG.SUCCESS.REMOVED_FROM_LIBRARY, 'success');
            } else {
                await storage.addSong(song);
                button.classList.add('active');
                showToast(CONFIG.SUCCESS.ADDED_TO_LIBRARY, 'success');
            }

            // Trigger library update event
            document.dispatchEvent(new CustomEvent('libraryUpdated'));
        } catch (error) {
            console.error('Error adding to library:', error);
            showToast('Failed to update library', 'error');
        }
    }

    /**
     * Add song to playlist
     */
    async addToPlaylist(song) {
        // First make sure song is in library
        const isInLibrary = await storage.hasSong(song.id);
        if (!isInLibrary) {
            await storage.addSong(song);
        }

        // Dispatch event for playlist selector
        document.dispatchEvent(new CustomEvent('showPlaylistSelector', {
            detail: { songId: song.id }
        }));
    }

    /**
     * Update like button state
     */
    async updateCardLikeButton(songId, button) {
        const isInLibrary = await storage.hasSong(songId);
        if (isInLibrary) {
            button.classList.add('active');
        }
    }

    /**
     * Render empty state
     */
    renderEmpty() {
        const empty = createElement('p', {
            className: 'placeholder-text'
        }, [`No results found for "${this.currentQuery}"`]);

        this.elements.searchResults.appendChild(empty);
    }

    /**
     * Render error state
     */
    renderError(message) {
        clearChildren(this.elements.searchResults);

        const error = createElement('div', {
            className: 'error-state'
        });

        const icon = createElement('div', {
            className: 'error-icon'
        }, ['⚠️']);

        const text = createElement('p', {
            className: 'error-text'
        }, [message]);

        const retryBtn = createElement('button', {
            className: 'btn-primary',
            onclick: () => this.performSearch()
        }, ['Retry']);

        error.appendChild(icon);
        error.appendChild(text);
        error.appendChild(retryBtn);

        this.elements.searchResults.appendChild(error);
    }

    /**
     * Clear search
     */
    clear() {
        this.currentQuery = '';
        this.results = [];
        this.elements.searchInput.value = '';
        clearChildren(this.elements.searchResults);

        const placeholder = createElement('p', {
            className: 'placeholder-text'
        }, ['Search for your favorite music on YouTube']);

        this.elements.searchResults.appendChild(placeholder);
    }
}

// Create global search component instance
const searchComponent = new SearchComponent();
