/* ========================================
   Queue Component
   ======================================== */

class QueueComponent {
    constructor() {
        this.elements = {
            queueList: $('#queueList'),
            queueView: $('#queueView')
        };

        this.queue = [];
        this.currentIndex = -1;

        // Don't init here - wait for app to call init() after storage is ready
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Listen for queue updates
        document.addEventListener('queueUpdated', (e) => {
            this.queue = e.detail.queue;
            this.currentIndex = e.detail.currentIndex;
            this.render();
        });

        // Listen for show queue event
        document.addEventListener('showQueue', () => {
            this.showQueueView();
        });
    }

    showQueueView() {
        // Switch to queue view
        $$('.view').forEach(view => view.classList.remove('active'));
        this.elements.queueView.classList.add('active');

        // Update mobile header
        const viewTitle = $('.view-title');
        if (viewTitle) {
            viewTitle.textContent = 'Queue';
        }
    }

    render() {
        clearChildren(this.elements.queueList);

        if (this.queue.length === 0) {
            const empty = createElement('p', {
                className: 'placeholder-text'
            }, ['Your queue is empty']);

            this.elements.queueList.appendChild(empty);
            return;
        }

        this.queue.forEach((song, index) => {
            const card = this.createQueueSongCard(song, index);
            this.elements.queueList.appendChild(card);
        });
    }

    createQueueSongCard(song, index) {
        const isPlaying = index === this.currentIndex;

        const card = createElement('div', {
            className: `song-card ${isPlaying ? 'playing' : ''}`,
            dataset: { songId: song.id, index: index }
        });

        // Index number
        const indexNum = createElement('div', {
            className: 'queue-index',
            style: 'width: 30px; text-align: center; color: var(--text-secondary);'
        }, [isPlaying ? '▶' : String(index + 1)]);

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

        // Assemble card
        card.appendChild(indexNum);
        card.appendChild(thumbnail);
        card.appendChild(info);

        // Click to play
        card.addEventListener('click', () => {
            musicPlayer.currentIndex = index;
            musicPlayer.play(song);
        });

        return card;
    }
}

// Component will be instantiated by app.js after storage is ready
let queueComponent;
