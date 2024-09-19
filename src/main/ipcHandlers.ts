/* eslint-disable spaced-comment */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-unused-vars */

import Electron, { ipcMain, Notification } from 'electron';
import settings from 'electron-settings';
import { exec } from 'child_process';
import path from 'path';

let alarmInterval: NodeJS.Timeout | null = null;

const playAlarmSound = () => {
  const alarmSoundPath = path.join(__dirname, 'alarm.mp3');
  const audio = new Audio(alarmSoundPath);
  audio.loop = true;
  audio.play();
  return audio;
};

const sendNotification = (title: string, body: string) => {
  const notification = new Notification({
    title,
    body,
    actions: [{ type: 'button', text: 'Stop' }, { type: 'button', text: 'Snooze' }],
    closeButtonText: 'Close'
  })

  notification.on('action', (event, index) => {
    if (index === 0) {
      ipcMain.emit('stop-alarm');
    } else if (index === 1) {
      ipcMain.emit('snooze-alarm');
    }
  });

  notification.show();
};

const setVolume = (volume: number) => {
  exec(`nircmd.exe setsysvolume ${volume}`);
};

export const setupIpcHandlers = (ipcMain: Electron.IpcMain) => {
  ipcMain.on('ipc-example', async (event, arg) => {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
    console.log(msgTemplate(arg));
    event.reply('ipc-example', msgTemplate('pong'));
  });

  ipcMain.on('add-alarm', async (event, arg) => {
    const alarms = (await settings.get('alarms')) as any[] || [];
    alarms.push({ id: Date.now(), time: arg.time, label: arg.label, active: arg.active, repeat: arg.repeat });
    await settings.set('alarms', alarms);
    event.reply('add-alarm', alarms);
  });

  ipcMain.on('update-alarm', async (event, arg) => {
    const alarms: { id: number, time: string, label: string, active: boolean, repeat: string[] }[] = (await settings.get('alarms')) as any[] || [];
    let index = -1;
    if (Array.isArray(alarms)) {
      index = alarms.findIndex((alarm: any) => alarm.id === arg.id);
      if (index !== -1) {
        alarms[index] = { id: arg.id, time: arg.time, label: arg.label, active: arg.active, repeat: arg.repeat };
        await settings.set('alarms', alarms);
      }
      event.reply('update-alarm', alarms);
    } else {
      event.reply('update-alarm', []);
    }
    if (index !== -1) {
      alarms[index] = { id: arg.id, time: arg.time, label: arg.label, active: arg.active, repeat: arg.repeat };
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

  ipcMain.on('start-alarm', async (event, arg) => {
    if (alarmInterval) {
      clearInterval(alarmInterval);
    }
    setVolume(0);
    // const audio = playAlarmSound();
    sendNotification('Alarm', 'Your alarm is ringing!');
    /*alarmInterval = setInterval(() => {
      audio.play();
    }, 1000);*/
    event.reply('start-alarm', 'Alarm started');
  });

  ipcMain.on('stop-alarm', async (event) => {
    if (alarmInterval) {
      clearInterval(alarmInterval);
      alarmInterval = null;
    }
    setVolume(65535);
    event.reply('stop-alarm', 'Alarm stopped');
  });

  ipcMain.on('snooze-alarm', async (event) => {
    if (alarmInterval) {
      clearInterval(alarmInterval);
      alarmInterval = null;
    }
    setVolume(65535);
    // Implement snooze logic here (e.g., restart alarm after 5 minutes)
    event.reply('snooze-alarm', 'Alarm snoozed');
  });
};
