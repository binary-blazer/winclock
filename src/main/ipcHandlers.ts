/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-unused-vars */

import Electron, { ipcMain } from 'electron';
import settings from 'electron-settings';

export const setupIpcHandlers = (ipcMain: Electron.IpcMain) => {
  ipcMain.on('ipc-example', async (event, arg) => {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
    console.log(msgTemplate(arg));
    event.reply('ipc-example', msgTemplate('pong'));
  });

  ipcMain.on('add-alarm', async (event, arg) => {
    const alarms = (await settings.get('alarms')) || [];
    alarms.push({ id: Date.now(), time: arg.time, label: arg.label });
    await settings.set('alarms', alarms);
    event.reply('add-alarm', alarms);
  });

  ipcMain.on('update-alarm', async (event, arg) => {
    const alarms = (await settings.get('alarms')) || [];
    const index = alarms.findIndex((alarm: any) => alarm.id === arg.id);
    if (index !== -1) {
      alarms[index] = { id: arg.id, time: arg.time, label: arg.label };
      await settings.set('alarms', alarms);
    }
    event.reply('update-alarm', alarms);
  });

  ipcMain.on('delete-alarm', async (event, arg) => {
    let alarms = (await settings.get('alarms')) || [];
    alarms = alarms.filter((alarm: any) => alarm.id !== arg.id);
    await settings.set('alarms', alarms);
    event.reply('delete-alarm', alarms);
  });

  ipcMain.on('alarms', async (event) => {
    const alarms = (await settings.get('alarms')) || [];
    event.reply('alarms', alarms);
  });

  ipcMain.on('current-tab', async (event) => {
    const currentTab = (await settings.get('currentTab')) || '';
    event.reply('current-tab', currentTab);
  });

  ipcMain.on('update-current-tab', async (event, arg) => {
    await settings.set('currentTab', arg);
    const currentTab = (await settings.get('currentTab')) || '';
    event.reply('update-current-tab', currentTab);
  });
};
