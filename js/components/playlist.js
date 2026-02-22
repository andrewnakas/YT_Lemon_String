/* ========================================
   Playlist Component
   ======================================== */

class PlaylistComponent {
    constructor() {
        this.elements = {
            playlistsGrid: $('#playlistsGrid'),
            createBtn: $('#createPlaylistBtn'),
            modal: $('#createPlaylistModal'),
            modalClose: $('#modalClose'),
            modalCancel: $('#modalCancel'),
            modalCreate: $('#modalCreate'),
            nameInput: $('#playlistNameInput'),
            descInput: $('#playlistDescInput')
        };

        this.playlists = [];
        // Don't init here - wait for app to call init() after storage is ready
    }

    async init() {
        await this.loadPlaylists();
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.elements.createBtn?.addEventListener('click', () => this.showCreateModal());
        this.elements.modalClose?.addEventListener('click', () => this.hideCreateModal());
        this.elements.modalCancel?.addEventListener('click', () => this.hideCreateModal());
        this.elements.modalCreate?.addEventListener('click', () => this.createPlaylist());

        // Close modal on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && hasClass(this.elements.modal, 'active')) {
                this.hideCreateModal();
            }
        });
    }

    async loadPlaylists() {
        try {
            this.playlists = await storage.getAll('playlists');
            this.render();
        } catch (error) {
            console.error('Error loading playlists:', error);
        }
    }

    render() {
        clearChildren(this.elements.playlistsGrid);

        if (this.playlists.length === 0) {
            const empty = createElement('p', {
                className: 'placeholder-text'
            }, ['Create your first playlist to get started']);

            this.elements.playlistsGrid.appendChild(empty);
            return;
        }

        this.playlists.forEach(playlist => {
            const card = this.createPlaylistCard(playlist);
            this.elements.playlistsGrid.appendChild(card);
        });
    }

    createPlaylistCard(playlist) {
        const card = createElement('div', {
            className: 'playlist-card'
        });

        const cover = createElement('div', {
            className: 'playlist-card-cover'
        }, ['📝']);

        const title = createElement('div', {
            className: 'playlist-card-title'
        }, [sanitizeHTML(playlist.name)]);

        const info = createElement('div', {
            className: 'playlist-card-info'
        }, [`${playlist.songs.length} songs`]);

        card.appendChild(cover);
        card.appendChild(title);
        card.appendChild(info);

        card.addEventListener('click', () => this.openPlaylist(playlist.id));

        return card;
    }

    async openPlaylist(playlistId) {
        const playlistWithSongs = await storage.getPlaylistWithSongs(playlistId);

        if (playlistWithSongs && playlistWithSongs.songs.length > 0) {
            musicPlayer.play(playlistWithSongs.songs[0], playlistWithSongs.songs);
        } else {
            showToast('Playlist is empty', 'warning');
        }
    }

    showCreateModal() {
        this.elements.nameInput.value = '';
        this.elements.descInput.value = '';
        showModal('#createPlaylistModal');
    }

    hideCreateModal() {
        hideModal('#createPlaylistModal');
    }

    async createPlaylist() {
        const name = this.elements.nameInput.value.trim();

        if (!name) {
            showToast('Please enter a playlist name', 'warning');
            return;
        }

        const description = this.elements.descInput.value.trim();

        try {
            await storage.createPlaylist(name, description);
            showToast(CONFIG.SUCCESS.PLAYLIST_CREATED, 'success');
            this.hideCreateModal();
            await this.loadPlaylists();
        } catch (error) {
            console.error('Error creating playlist:', error);
            showToast('Failed to create playlist', 'error');
        }
    }
}

// Component will be instantiated by app.js after storage is ready
let playlistComponent;
