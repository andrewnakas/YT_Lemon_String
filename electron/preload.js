/* ========================================
   YT Lemon String - Electron Preload Script
   ======================================== */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Check if running in Electron
    isElectron: true,

    // Download path selection
    selectDownloadPath: () => ipcRenderer.invoke('select-download-path'),

    // Check yt-dlp installation
    checkYtDlp: () => ipcRenderer.invoke('check-ytdlp'),

    // Open external links
    openExternal: (url) => ipcRenderer.invoke('open-external', url)
});

console.log('[Electron] Preload script loaded');
