/* eslint-disable no-console */
/* eslint-disable promise/always-return */
/* eslint-disable global-require */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { app, BrowserWindow, ipcMain, Tray } from 'electron';
import AutoLaunch from 'electron-auto-launch';
import { createTray } from './tray';
import { setupIpcHandlers } from './ipcHandlers';
import { createWindow } from './window';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const autoLauncher = new AutoLaunch({
  name: 'Winclock',
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createTray(tray, autoLauncher);
    createWindow(mainWindow);
    setupIpcHandlers(ipcMain);
    app.on('activate', () => {
      if (mainWindow === null) createWindow(mainWindow);
    });
  })
  .catch(console.log);
