/* ========================================
   YT Lemon String - Electron Main Process
   ======================================== */

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let backendServer;
const BACKEND_PORT = 3456; // Fixed port for local backend

// Paths
const isDev = !app.isPackaged;
const backendPath = isDev
    ? path.join(__dirname, '../backend')
    : path.join(process.resourcesPath, 'backend');
const frontendPath = isDev
    ? path.join(__dirname, '..')
    : path.join(process.resourcesPath);

/**
 * Start local Express backend server
 */
function startBackendServer() {
    console.log('[Electron] Starting backend server...');
    console.log('[Electron] Backend path:', backendPath);

    // Start the Node.js backend server
    backendServer = spawn('node', ['server.js'], {
        cwd: backendPath,
        env: {
            ...process.env,
            PORT: BACKEND_PORT,
            NODE_ENV: 'desktop',
            FRONTEND_URL: '*' // Allow all origins for local app
        },
        stdio: 'inherit'
    });

    backendServer.on('error', (error) => {
        console.error('[Electron] Backend error:', error);
        dialog.showErrorBox('Backend Error', `Failed to start backend server: ${error.message}`);
    });

    backendServer.on('exit', (code) => {
        console.log(`[Electron] Backend server exited with code ${code}`);
    });

    // Wait for server to start
    return new Promise((resolve) => {
        setTimeout(resolve, 2000); // Give server time to start
    });
}

/**
 * Create main application window
 */
async function createWindow() {
    console.log('[Electron] Creating main window...');

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        backgroundColor: '#121212',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: true
        },
        titleBarStyle: 'default',
        icon: path.join(frontendPath, 'assets/icons/icon-512x512.png')
    });

    // Start backend server first
    await startBackendServer();

    // Load the app from local server
    const appUrl = `http://localhost:${BACKEND_PORT}`;
    console.log('[Electron] Loading app from:', appUrl);

    // Serve static files - we need to update backend to serve frontend
    mainWindow.loadURL(appUrl);

    // Open DevTools in development
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

/**
 * App lifecycle
 */
app.whenReady().then(async () => {
    await createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('quit', () => {
    // Clean up backend server
    if (backendServer) {
        console.log('[Electron] Stopping backend server...');
        backendServer.kill();
    }
});

/**
 * IPC Handlers
 */

// Handle download path selection
ipcMain.handle('select-download-path', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });

    if (result.canceled) {
        return null;
    }

    return result.filePaths[0];
});

// Check if yt-dlp is installed
ipcMain.handle('check-ytdlp', async () => {
    const { execSync } = require('child_process');
    try {
        const version = execSync('yt-dlp --version', { encoding: 'utf-8' }).trim();
        return { installed: true, version };
    } catch (error) {
        return { installed: false };
    }
});

// Open external link
ipcMain.handle('open-external', async (event, url) => {
    await shell.openExternal(url);
});

console.log('[Electron] Main process initialized');
