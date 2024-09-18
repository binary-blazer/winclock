/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */

import path from 'path';
import { app, Tray, Menu } from 'electron';
import AutoLaunch from 'electron-auto-launch';
import settings from 'electron-settings';

export const createTray = (tray: Tray | null, autoLauncher: AutoLaunch) => {
  tray = new Tray(path.join(process.cwd(), 'assets', 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Toggle Auto Boot',
      type: 'checkbox',
      checked: Boolean(settings.getSync('autoBoot')) || false,
      click: (menuItem) => {
        const autoBoot = menuItem.checked;
        settings.setSync('autoBoot', autoBoot);
        if (autoBoot) {
          autoLauncher.enable();
        } else {
          autoLauncher.disable();
        }
      },
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setToolTip('MyElectronApp');
  tray.setContextMenu(contextMenu);
};
