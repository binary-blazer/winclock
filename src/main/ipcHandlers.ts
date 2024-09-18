/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-unused-vars */

import Electron, { ipcMain } from 'electron';
import {
  addAlarm,
  updateAlarm,
  deleteAlarm,
  getAlarms,
  getCurrentTab,
  updateCurrentTab,
} from './database';

export const setupIpcHandlers = (ipcMain: Electron.IpcMain) => {
  ipcMain.on('ipc-example', async (event, arg) => {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
    console.log(msgTemplate(arg));
    event.reply('ipc-example', msgTemplate('pong'));
  });

  ipcMain.on('add-alarm', async (event, arg) => {
    addAlarm(arg.time, arg.label);
    event.reply('add-alarm', getAlarms());
  });

  ipcMain.on('update-alarm', async (event, arg) => {
    updateAlarm(arg.id, arg.time, arg.label);
    event.reply('update-alarm', getAlarms());
  });

  ipcMain.on('delete-alarm', async (event, arg) => {
    deleteAlarm(arg.id);
    event.reply('delete-alarm', getAlarms());
  });

  ipcMain.on('alarms', async (event) => {
    event.reply('alarms', getAlarms());
  });

  ipcMain.on('current-tab', async (event) => {
    event.reply('current-tab', getCurrentTab());
  });

  ipcMain.on('update-current-tab', async (event, arg) => {
    updateCurrentTab(arg);
    event.reply('update-current-tab', getCurrentTab());
  });
};
