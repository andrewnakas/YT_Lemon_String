/* ========================================
   Library Component
   ======================================== */

class LibraryComponent {
    constructor() {
        this.elements = {
            libraryGrid: $('#libraryGrid')
        };

        this.songs = [];
        // Don't init here - wait for app to call init() after storage is ready
    }

    async init() {
        await this.loadLibrary();
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Listen for library updates
        document.addEventListener('libraryUpdated', () => this.loadLibrary());
    }

    async loadLibrary() {
        try {
            this.songs = await storage.getAll('songs');
            this.render();
        } catch (error) {
            console.error('Error loading library:', error);
        }
    }

    render() {
        clearChildren(this.elements.libraryGrid);

        if (this.songs.length === 0) {
            const empty = createElement('p', {
                className: 'placeholder-text'
            }, ['Your saved songs will appear here']);

            this.elements.libraryGrid.appendChild(empty);
            return;
        }

        // Sort by most recently added
        const sorted = this.songs.sort((a, b) => b.addedAt - a.addedAt);

        sorted.forEach(song => {
            const card = this.createLibrarySongCard(song);
            this.elements.libraryGrid.appendChild(card);
        });
    }

    createLibrarySongCard(song) {
        const card = createElement('div', {
            className: 'playlist-card'
        });

        const cover = createElement('img', {
            className: 'song-card-thumbnail',
            src: song.thumbnail || 'https://via.placeholder.com/300x300/282828/b3b3b3.png?text=Music',
            alt: song.title,
            loading: 'lazy',
            style: 'width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px;'
        });

        const title = createElement('div', {
            className: 'playlist-card-title'
        }, [sanitizeHTML(song.title)]);

        const info = createElement('div', {
            className: 'playlist-card-info'
        }, [sanitizeHTML(song.artist)]);

        card.appendChild(cover);
        card.appendChild(title);
        card.appendChild(info);

        card.addEventListener('click', () => {
            window.musicPlayer.play(song, this.songs);
        });

        return card;
    }
}

// Component will be instantiated by app.js after storage is ready
let libraryComponent;
