/* eslint-disable no-console */
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import toIco from 'to-ico';
import { Icns, IcnsImage } from '@fiahfy/icns';

const iconPath = path.resolve(__dirname, '../assets/icon.png');
const outputDir = path.resolve(__dirname, '../assets/icons');

const sizes = [16, 24, 32, 48, 64, 96, 128, 256, 512, 1024];

async function resizeIcon() {
  try {
    const icns = new Icns();

    // Resize to multiple sizes and save in ../assets/icons
    // eslint-disable-next-line no-restricted-syntax
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `${size}x${size}.png`);
      // eslint-disable-next-line no-await-in-loop
      await sharp(iconPath).resize(size, size).toFile(outputPath);
      console.log(`Icon resized to ${size}x${size}`);
    }

    // Convert to SVG and save in ../assets
    const svgOutputPath = path.resolve(__dirname, '../assets/icon.svg');
    await sharp(iconPath).toFile(svgOutputPath);
    console.log('Icon converted to SVG');

    // Convert to ICO and save in ../assets
    const icoOutputPath = path.resolve(__dirname, '../assets/icon.ico');
    const icoBuffer = await sharp(iconPath).resize(256, 256).png().toBuffer();
    const ico = await toIco([icoBuffer]);
    fs.writeFileSync(icoOutputPath, ico);
    console.log('Icon converted to ICO');

    let buf;
    let image;

    // eslint-disable-next-line prefer-const
    buf = await sharp(iconPath).resize(1024, 1024).png().toBuffer();

    // eslint-disable-next-line prefer-const
    image = IcnsImage.fromPNG(buf, 'ic10');
    icns.append(image);
    fs.writeFileSync(path.join(outputDir, 'icon.icns'), icns.data);

    console.log('All icons resized and converted successfully!');
  } catch (error) {
    console.error('Error resizing or converting icons:', error);
  }
}

resizeIcon();
