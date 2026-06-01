const { app, BrowserWindow, ipcMain, Tray, nativeImage, shell } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 380,
    height: 480,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    center: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    // On macOS, this makes the titlebar disappear and keeps standard rounded corners
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 16, y: 16 },
    hasShadow: true,
    backgroundColor: '#000000',
  });

  mainWindow.loadFile('index.html');

  // Uncomment to open DevTools for debugging
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for window control
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.hide(); // Hide instead of quit to keep running in tray
});

ipcMain.on('open-external', (event, url) => {
  shell.openExternal(url);
});

// Setup Tray
function createTray() {
  const iconPath = path.join(__dirname, 'build', 'trayTemplate@2x.png');
  const trayIcon = nativeImage.createFromPath(iconPath);
  tray = new Tray(trayIcon);
  tray.setToolTip('Koda');
  
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// IPC handler for updating tray text
ipcMain.on('update-tray-timer', (event, timeStr) => {
  if (timeStr) {
    if (!tray) {
      const emptyImg = nativeImage.createEmpty();
      tray = new Tray(emptyImg);
    }
    tray.setTitle(timeStr);
  } else {
    if (tray) {
      tray.destroy();
      tray = null;
    }
  }
});


// Resize window handler when transitioning to main app screen
ipcMain.on('window-resize', (event, { width, height, alwaysOnTop }) => {
  if (mainWindow) {
    mainWindow.hide();
    mainWindow.setSize(width, height, false);
    mainWindow.center();
    if (alwaysOnTop !== undefined) {
      mainWindow.setAlwaysOnTop(alwaysOnTop, 'screen-saver');
    }
    setTimeout(() => {
      mainWindow.show();
    }, 50);
  }
});
