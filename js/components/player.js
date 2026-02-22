/* ========================================
   Music Player Component
   ======================================== */

class MusicPlayer {
    constructor() {
        this.player = null;
        this.queue = [];
        this.currentIndex = -1;
        this.isShuffled = false;
        this.repeatMode = 'off'; // 'off', 'all', 'one'
        this.originalQueue = [];
        this.isReady = false;
        this.currentSong = null;
        this.updateInterval = null;

        this.elements = {
            thumbnail: $('#playerThumbnail'),
            title: $('#playerTitle'),
            artist: $('#playerArtist'),
            likeBtn: $('#playerLike'),
            playPauseBtn: $('#playPauseBtn'),
            playPauseIcon: $('#playPauseIcon'),
            prevBtn: $('#prevBtn'),
            nextBtn: $('#nextBtn'),
            shuffleBtn: $('#shuffleBtn'),
            repeatBtn: $('#repeatBtn'),
            progressBar: $('#progressBar'),
            progressBarFill: $('#progressBarFill'),
            progressBarHandle: $('#progressBarHandle'),
            timeCurrent: $('#timeCurrent'),
            timeTotal: $('#timeTotal'),
            volumeBtn: $('#volumeBtn'),
            volumeIcon: $('#volumeIcon'),
            volumeSlider: $('#volumeSlider'),
            queueBtn: $('#queueBtn'),
            downloadBtn: $('#downloadBtn')
        };

        // Don't init here - wait for app to call init() after storage is ready
    }

    /**
     * Initialize player
     */
    init() {
        // Wait for YouTube iframe API to load
        if (typeof YT !== 'undefined' && YT.Player) {
            this.createPlayer();
        } else {
            window.onYouTubeIframeAPIReady = () => this.createPlayer();
        }

        this.attachEventListeners();
        this.loadSavedState();
    }

    /**
     * Create YouTube player instance
     */
    createPlayer() {
        this.player = new YT.Player(CONFIG.YOUTUBE_PLAYER_ID, {
            height: '0',
            width: '0',
            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                playsinline: 1
            },
            events: {
                onReady: this.onPlayerReady.bind(this),
                onStateChange: this.onPlayerStateChange.bind(this),
                onError: this.onPlayerError.bind(this)
            }
        });
    }

    /**
     * Player ready callback
     */
    onPlayerReady(event) {
        this.isReady = true;
        console.log('YouTube player ready');

        // Set saved volume
        const savedVolume = parseInt(this.elements.volumeSlider.value);
        this.player.setVolume(savedVolume);

        // Start update interval
        this.startUpdateInterval();

        // Setup media session if supported
        if (CONFIG.FEATURES.MEDIA_SESSION && 'mediaSession' in navigator) {
            this.setupMediaSession();
        }
    }

    /**
     * Player state change callback
     */
    onPlayerStateChange(event) {
        const state = event.data;

        if (state === YT.PlayerState.PLAYING) {
            this.onPlay();
        } else if (state === YT.PlayerState.PAUSED) {
            this.onPause();
        } else if (state === YT.PlayerState.ENDED) {
            this.onEnded();
        } else if (state === YT.PlayerState.BUFFERING) {
            this.onBuffering();
        }
    }

    /**
     * Player error callback
     */
    onPlayerError(event) {
        console.error('YouTube player error:', event.data);
        showToast(CONFIG.ERRORS.PLAYBACK_ERROR, 'error');

        // Skip to next song
        setTimeout(() => this.next(), 1000);
    }

    /**
     * Play event handler
     */
    onPlay() {
        this.elements.playPauseIcon.textContent = '⏸';
        this.updateNowPlayingInfo();
        this.updateMediaSession();

        // Update play count
        if (this.currentSong) {
            storage.updatePlayCount(this.currentSong.id);
        }
    }

    /**
     * Pause event handler
     */
    onPause() {
        this.elements.playPauseIcon.textContent = '▶';
    }

    /**
     * Ended event handler
     */
    onEnded() {
        if (this.repeatMode === 'one') {
            this.player.seekTo(0);
            this.player.playVideo();
        } else {
            this.next();
        }
    }

    /**
     * Buffering event handler
     */
    onBuffering() {
        // Could show loading indicator
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Play/Pause
        this.elements.playPauseBtn?.addEventListener('click', () => this.togglePlayPause());

        // Previous
        this.elements.prevBtn?.addEventListener('click', () => this.previous());

        // Next
        this.elements.nextBtn?.addEventListener('click', () => this.next());

        // Shuffle
        this.elements.shuffleBtn?.addEventListener('click', () => this.toggleShuffle());

        // Repeat
        this.elements.repeatBtn?.addEventListener('click', () => this.toggleRepeat());

        // Progress bar
        this.elements.progressBar?.addEventListener('click', (e) => this.seek(e));

        // Volume
        this.elements.volumeBtn?.addEventListener('click', () => this.toggleMute());
        this.elements.volumeSlider?.addEventListener('input', (e) => {
            this.setVolume(parseInt(e.target.value));
        });

        // Like/Add to library
        this.elements.likeBtn?.addEventListener('click', () => this.toggleLike());

        // Queue
        this.elements.queueBtn?.addEventListener('click', () => this.showQueue());

        // Download
        this.elements.downloadBtn?.addEventListener('click', () => this.downloadCurrent());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    /**
     * Play song
     */
    play(song, queue = null) {
        if (!this.isReady) {
            console.warn('Player not ready yet');
            return;
        }

        this.currentSong = song;

        // Update queue if provided
        if (queue) {
            this.queue = queue;
            this.originalQueue = [...queue];
            this.currentIndex = this.queue.findIndex(s => s.id === song.id);
        }

        // Load and play video
        this.player.loadVideoById(song.id);

        // Update UI
        this.updateNowPlayingInfo();
        this.updateLikeButton();
    }

    /**
     * Toggle play/pause
     */
    togglePlayPause() {
        if (!this.player) return;

        const state = this.player.getPlayerState();

        if (state === YT.PlayerState.PLAYING) {
            this.player.pauseVideo();
        } else {
            this.player.playVideo();
        }
    }

    /**
     * Play next song
     */
    next() {
        if (this.queue.length === 0) return;

        this.currentIndex++;

        if (this.currentIndex >= this.queue.length) {
            if (this.repeatMode === 'all') {
                this.currentIndex = 0;
            } else {
                this.currentIndex = this.queue.length - 1;
                this.player.pauseVideo();
                return;
            }
        }

        this.play(this.queue[this.currentIndex]);
    }

    /**
     * Play previous song
     */
    previous() {
        if (this.queue.length === 0) return;

        // If more than 3 seconds in, restart current song
        if (this.player.getCurrentTime() > 3) {
            this.player.seekTo(0);
            return;
        }

        this.currentIndex--;

        if (this.currentIndex < 0) {
            this.currentIndex = 0;
        }

        this.play(this.queue[this.currentIndex]);
    }

    /**
     * Toggle shuffle
     */
    toggleShuffle() {
        this.isShuffled = !this.isShuffled;

        if (this.isShuffled) {
            // Save current song
            const currentSong = this.queue[this.currentIndex];

            // Shuffle queue
            this.queue = shuffleArray(this.queue);

            // Put current song at the beginning
            this.currentIndex = this.queue.findIndex(s => s.id === currentSong.id);
            if (this.currentIndex !== 0) {
                [this.queue[0], this.queue[this.currentIndex]] =
                [this.queue[this.currentIndex], this.queue[0]];
                this.currentIndex = 0;
            }

            this.elements.shuffleBtn.classList.add('active');
        } else {
            // Restore original queue
            const currentSong = this.queue[this.currentIndex];
            this.queue = [...this.originalQueue];
            this.currentIndex = this.queue.findIndex(s => s.id === currentSong.id);

            this.elements.shuffleBtn.classList.remove('active');
        }

        this.updateQueue();
    }

    /**
     * Toggle repeat mode
     */
    toggleRepeat() {
        if (this.repeatMode === 'off') {
            this.repeatMode = 'all';
            this.elements.repeatBtn.classList.add('active');
            this.elements.repeatBtn.querySelector('span').textContent = '🔁';
        } else if (this.repeatMode === 'all') {
            this.repeatMode = 'one';
            this.elements.repeatBtn.querySelector('span').textContent = '🔂';
        } else {
            this.repeatMode = 'off';
            this.elements.repeatBtn.classList.remove('active');
            this.elements.repeatBtn.querySelector('span').textContent = '🔁';
        }
    }

    /**
     * Seek to position
     */
    seek(event) {
        if (!this.player) return;

        const rect = this.elements.progressBar.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        const duration = this.player.getDuration();

        this.player.seekTo(duration * percent);
    }

    /**
     * Set volume
     */
    setVolume(volume) {
        if (!this.player) return;

        this.player.setVolume(volume);
        this.updateVolumeIcon(volume);

        // Save volume
        storage.setSetting('volume', volume);
    }

    /**
     * Toggle mute
     */
    toggleMute() {
        if (!this.player) return;

        if (this.player.isMuted()) {
            this.player.unMute();
            const volume = parseInt(this.elements.volumeSlider.value);
            this.updateVolumeIcon(volume);
        } else {
            this.player.mute();
            this.updateVolumeIcon(0);
        }
    }

    /**
     * Update volume icon
     */
    updateVolumeIcon(volume) {
        if (volume === 0) {
            this.elements.volumeIcon.textContent = '🔇';
        } else if (volume < 50) {
            this.elements.volumeIcon.textContent = '🔉';
        } else {
            this.elements.volumeIcon.textContent = '🔊';
        }
    }

    /**
     * Update now playing info
     */
    updateNowPlayingInfo() {
        if (!this.currentSong) return;

        this.elements.thumbnail.src = this.currentSong.thumbnail || 'https://via.placeholder.com/300x300/282828/b3b3b3.png?text=Music';
        this.elements.title.textContent = this.currentSong.title;
        this.elements.artist.textContent = this.currentSong.artist;

        // Update total time
        const duration = this.player.getDuration();
        this.elements.timeTotal.textContent = formatTime(duration);
    }

    /**
     * Update like button state
     */
    async updateLikeButton() {
        if (!this.currentSong) return;

        const isLiked = await storage.hasSong(this.currentSong.id);

        if (isLiked) {
            this.elements.likeBtn.classList.add('active');
        } else {
            this.elements.likeBtn.classList.remove('active');
        }
    }

    /**
     * Toggle like (add/remove from library)
     */
    async toggleLike() {
        if (!this.currentSong) return;

        const isLiked = await storage.hasSong(this.currentSong.id);

        if (isLiked) {
            await storage.removeSong(this.currentSong.id);
            this.elements.likeBtn.classList.remove('active');
            showToast(CONFIG.SUCCESS.REMOVED_FROM_LIBRARY, 'success');
        } else {
            await storage.addSong(this.currentSong);
            this.elements.likeBtn.classList.add('active');
            showToast(CONFIG.SUCCESS.ADDED_TO_LIBRARY, 'success');
        }

        // Trigger library update event
        document.dispatchEvent(new CustomEvent('libraryUpdated'));
    }

    /**
     * Download current song
     */
    async downloadCurrent() {
        if (!this.currentSong) {
            showToast('No song playing', 'warning');
            return;
        }

        try {
            await backendAPI.download(this.currentSong.id, this.currentSong.title);
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    /**
     * Show queue view
     */
    showQueue() {
        // Dispatch event to show queue
        document.dispatchEvent(new CustomEvent('showQueue'));
    }

    /**
     * Start progress update interval
     */
    startUpdateInterval() {
        this.updateInterval = setInterval(() => {
            if (this.player && this.player.getPlayerState() === YT.PlayerState.PLAYING) {
                const currentTime = this.player.getCurrentTime();
                const duration = this.player.getDuration();

                // Update time display
                this.elements.timeCurrent.textContent = formatTime(currentTime);

                // Update progress bar
                const percent = (currentTime / duration) * 100;
                this.elements.progressBarFill.style.width = `${percent}%`;
                this.elements.progressBarHandle.style.left = `${percent}%`;
            }
        }, CONFIG.UPDATE_INTERVAL_MS);
    }

    /**
     * Setup media session (for lock screen controls)
     */
    setupMediaSession() {
        navigator.mediaSession.setActionHandler('play', () => this.player.playVideo());
        navigator.mediaSession.setActionHandler('pause', () => this.player.pauseVideo());
        navigator.mediaSession.setActionHandler('previoustrack', () => this.previous());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
    }

    /**
     * Update media session metadata
     */
    updateMediaSession() {
        if (!('mediaSession' in navigator) || !this.currentSong) return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: this.currentSong.title,
            artist: this.currentSong.artist,
            artwork: [
                {
                    src: this.currentSong.thumbnail || '/assets/icons/icon-192x192.png',
                    sizes: '192x192',
                    type: 'image/png'
                }
            ]
        });
    }

    /**
     * Update queue display
     */
    updateQueue() {
        // Dispatch event for queue component
        document.dispatchEvent(new CustomEvent('queueUpdated', {
            detail: {
                queue: this.queue,
                currentIndex: this.currentIndex
            }
        }));
    }

    /**
     * Keyboard shortcuts handler
     */
    handleKeyboard(event) {
        // Don't handle if typing in input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (event.key) {
            case ' ':
                event.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowLeft':
                this.previous();
                break;
            case 'ArrowRight':
                this.next();
                break;
        }
    }

    /**
     * Load saved state
     */
    async loadSavedState() {
        // Load volume
        const savedVolume = await storage.getSetting('volume', CONFIG.DEFAULT_VOLUME);
        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.value = savedVolume;
        }
    }
}

// Create global player instance
const musicPlayer = new MusicPlayer();
