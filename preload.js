const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  resizeWindow: (width, height, alwaysOnTop) => ipcRenderer.send('window-resize', { width, height, alwaysOnTop }),
  updateTrayTimer: (timeStr) => ipcRenderer.send('update-tray-timer', timeStr),
  openExternal: (url) => ipcRenderer.send('open-external', url),
});
