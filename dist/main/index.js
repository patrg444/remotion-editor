"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const initialize_1 = require("./initialize");
const isDevelopment = process.env.NODE_ENV === 'development';
async function createWindow() {
    const mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    if (isDevelopment) {
        await mainWindow.loadURL('http://localhost:8082');
        mainWindow.webContents.openDevTools();
    }
    else {
        await mainWindow.loadFile(path_1.default.join(__dirname, '../renderer/index.html'));
    }
}
electron_1.app.whenReady().then(async () => {
    await (0, initialize_1.initialize)();
    console.log('[initialize] Application initialized');
    await createWindow();
    electron_1.app.on('activate', async () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            await createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
