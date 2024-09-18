/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
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
    const alarms = (await settings.get('alarms')) as any[] || [];
    alarms.push({ id: Date.now(), time: arg.time, label: arg.label });
    await settings.set('alarms', alarms);
    event.reply('add-alarm', alarms);
  });

  ipcMain.on('update-alarm', async (event, arg) => {
    const alarms: { id: number, time: string, label: string }[] = (await settings.get('alarms')) as any[] || [];
    let index = -1;
    if (Array.isArray(alarms)) {
      index = alarms.findIndex((alarm: any) => alarm.id === arg.id);
      if (index !== -1) {
        alarms[index] = { id: arg.id, time: arg.time, label: arg.label };
        await settings.set('alarms', alarms);
      }
      event.reply('update-alarm', alarms);
    } else {
      event.reply('update-alarm', []);
    }
    if (index !== -1) {
      alarms[index] = { id: arg.id, time: arg.time, label: arg.label };
      await settings.set('alarms', alarms);
    }
    event.reply('update-alarm', alarms);
  });

  ipcMain.on('delete-alarm', async (event, arg) => {
    let alarms = (await settings.get('alarms')) as any[] || [];
    if (Array.isArray(alarms)) {
      alarms = alarms.filter((alarm: any) => alarm.id !== arg.id);
    } else {
      alarms = [];
    }
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
