/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */

import path from 'path';
import { app, Tray, Menu, nativeImage } from 'electron';

export const createTray = (tray: Tray | null) => {
  const image = nativeImage.createFromPath(
    path.join(process.cwd(), 'assets', 'icon.png'),
  );

  tray = new Tray(image);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Buzzr Clock');
  tray.setContextMenu(contextMenu);

  return tray;
};
