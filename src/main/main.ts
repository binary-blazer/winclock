/* eslint-disable promise/catch-or-return */
/* eslint-disable no-console */
/* eslint-disable promise/always-return */
/* eslint-disable global-require */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { app, BrowserWindow, ipcMain, Tray } from 'electron';
import AutoLaunch from 'electron-auto-launch';
import settings from 'electron-settings';
import { createTray } from './tray';
import { setupIpcHandlers } from './ipcHandlers';
import { createWindow } from './window';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
const runInBackground = settings.get('backgroundRunning');

const autoLauncher = new AutoLaunch({
  name: 'Buzzr Clock',
});

async function autoBootFunction(_autoLauncher: AutoLaunch) {
  const autoBoot = await settings.get('autoBoot');

  if (autoBoot) {
    _autoLauncher.enable();
  } else {
    _autoLauncher.disable();
  }
}

autoBootFunction(autoLauncher);

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    if (await runInBackground) {
      app.hide();
    } else {
      app.quit();
    }
  }
});

const checkAlarms = async () => {
  const alarms = ((await settings.get('alarms')) as any[]) || [];
  const now = new Date();
  alarms.forEach((alarm) => {
    if (!alarm.active) return;
    const [hours, minutes] = alarm.time
      .split(':')
      .map((t: string) => parseInt(t, 10));
    const alarmTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
    );
    if (alarmTime <= now && alarm.active) {
      ipcMain.emit('start-alarm', null, { id: alarm.id });
    }
  });
};

const applySettings = async () => {
  const militaryTime = (await settings.get('militaryTime')) || false;
  const backgroundRunning = (await settings.get('backgroundRunning')) || true;

  if (backgroundRunning) {
    autoLauncher.enable();
  } else {
    autoLauncher.disable();
  }

  mainWindow.webContents.send('apply-settings', { militaryTime });
};

app
  .whenReady()
  .then(() => {
    createTray(tray);
    createWindow(mainWindow);
    setupIpcHandlers(ipcMain);
    setInterval(checkAlarms, 60000);
    applySettings();
    app.on('activate', () => {
      if (mainWindow === null) createWindow(mainWindow);
    });
  })
  .catch(console.log);
