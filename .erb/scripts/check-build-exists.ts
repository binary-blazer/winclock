import path from 'path';
import fs from 'fs';
import webpackPaths from '../configs/webpack.paths';
import { whiteBrightBgRedBold } from './colorUtils';

const mainPath = path.join(webpackPaths.distMainPath, 'main.js');
const rendererPath = path.join(webpackPaths.distRendererPath, 'renderer.js');

if (!fs.existsSync(mainPath)) {
  throw new Error(
    whiteBrightBgRedBold(
      'The main process is not built yet. Build it by running "npm run build:main"',
    ),
  );
}

if (!fs.existsSync(rendererPath)) {
  throw new Error(
    whiteBrightBgRedBold(
      'The renderer process is not built yet. Build it by running "npm run build:renderer"',
    ),
  );
}
