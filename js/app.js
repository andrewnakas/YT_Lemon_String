/* ========================================
   Main Application
   ======================================== */

class App {
    constructor() {
        this.currentView = 'search';
        this.sidebarOpen = false;

        this.elements = {
            sidebar: $('#sidebar'),
            navItems: $$('.nav-item'),
            views: $$('.view'),
            menuToggle: $('#menuToggle'),
            viewTitle: $('.view-title')
        };

        this.init();
    }

    /**
     * Initialize application
     */
    async init() {
        console.log(`${CONFIG.APP_NAME} v${CONFIG.APP_VERSION}`);

        // Initialize storage
        try {
            await storage.init();
            console.log('Storage initialized');
        } catch (error) {
            console.error('Storage initialization error:', error);
            showToast('Storage initialization failed', 'error');
        }

        // Attach event listeners
        this.attachEventListeners();

        // Check for service worker support
        if (CONFIG.FEATURES.OFFLINE_MODE && supportsServiceWorker()) {
            this.registerServiceWorker();
        }

        // Check for install prompt
        if (CONFIG.FEATURES.INSTALL_PROMPT) {
            this.setupInstallPrompt();
        }

        // Set initial view
        this.switchView('search');

        console.log('App initialized');
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Navigation
        this.elements.navItems.forEach(navItem => {
            navItem.addEventListener('click', (e) => {
                const view = navItem.dataset.view;
                if (view) {
                    this.switchView(view);

                    // Close sidebar on mobile
                    if (isMobile()) {
                        this.closeSidebar();
                    }
                }
            });
        });

        // Mobile menu toggle
        this.elements.menuToggle?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Close sidebar when clicking outside (mobile)
        document.addEventListener('click', (e) => {
            if (this.sidebarOpen &&
                !this.elements.sidebar?.contains(e.target) &&
                !this.elements.menuToggle?.contains(e.target)) {
                this.closeSidebar();
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.view) {
                this.switchView(e.state.view, false);
            }
        });
    }

    /**
     * Switch view
     */
    switchView(viewName, pushState = true) {
        // Hide all views
        this.elements.views.forEach(view => {
            view.classList.remove('active');
        });

        // Show selected view
        const targetView = $(`#${viewName}View`);
        if (targetView) {
            targetView.classList.add('active');
        }

        // Update navigation
        this.elements.navItems.forEach(navItem => {
            if (navItem.dataset.view === viewName) {
                navItem.classList.add('active');
            } else {
                navItem.classList.remove('active');
            }
        });

        // Update mobile header title
        if (this.elements.viewTitle) {
            this.elements.viewTitle.textContent = this.getViewTitle(viewName);
        }

        // Update browser history
        if (pushState) {
            history.pushState({ view: viewName }, '', `#${viewName}`);
        }

        this.currentView = viewName;
    }

    /**
     * Get view title
     */
    getViewTitle(viewName) {
        const titles = {
            search: 'Search',
            library: 'Your Library',
            playlists: 'Playlists',
            queue: 'Queue'
        };

        return titles[viewName] || 'YT Lemon String';
    }

    /**
     * Toggle sidebar (mobile)
     */
    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;

        if (this.sidebarOpen) {
            this.openSidebar();
        } else {
            this.closeSidebar();
        }
    }

    /**
     * Open sidebar (mobile)
     */
    openSidebar() {
        this.elements.sidebar?.classList.add('active');
        this.sidebarOpen = true;

        // Create overlay
        if (!$('.sidebar-overlay')) {
            const overlay = createElement('div', {
                className: 'sidebar-overlay active'
            });

            overlay.addEventListener('click', () => this.closeSidebar());
            document.body.appendChild(overlay);
        }
    }

    /**
     * Close sidebar (mobile)
     */
    closeSidebar() {
        this.elements.sidebar?.classList.remove('active');
        this.sidebarOpen = false;

        // Remove overlay
        const overlay = $('.sidebar-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    /**
     * Register service worker
     */
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker registered:', registration);

            // Check for updates
            registration.addEventListener('updatefound', () => {
                console.log('Service Worker update found');
            });
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }

    /**
     * Setup PWA install prompt
     */
    setupInstallPrompt() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent default install prompt
            e.preventDefault();
            deferredPrompt = e;

            // Show custom install button (if you want to add one)
            console.log('Install prompt available');

            // You can show a custom UI element here
            // For now, we'll just log it
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA installed');
            deferredPrompt = null;
        });
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new App();
    });
} else {
    window.app = new App();
}
