const { app, BrowserWindow } = require('electron');
const path = require('path');

// Fallback para detectar modo desenvolvimento se electron-is-dev falhar
let isDev;
try {
  isDev = require('electron-is-dev');
} catch (error) {
  // Se electron-is-dev não estiver disponível, usar verificação manual
  isDev = !app.isPackaged;
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'favicon.ico'),
    title: 'Real Estate Broker App'
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
