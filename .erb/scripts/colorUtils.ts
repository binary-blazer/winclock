const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  fgYellow: '\x1b[33m',
  bgYellow: '\x1b[43m',
  fgGreen: '\x1b[32m',
  bgGreen: '\x1b[42m',
  fgRed: '\x1b[31m',
  bgRed: '\x1b[41m',
  fgWhite: '\x1b[37m',
};

function whiteBrightBgYellowBold(text: string) {
  return `${colors.bright}${colors.fgWhite}${colors.bgYellow}${text}${colors.reset}`;
}

function whiteBrightBgGreenBold(text: string) {
  return `${colors.bright}${colors.fgWhite}${colors.bgGreen}${text}${colors.reset}`;
}

function whiteBrightBgRedBold(text: string) {
  return `${colors.bright}${colors.fgWhite}${colors.bgRed}${text}${colors.reset}`;
}

function bold(text: string) {
  return `${colors.bright}${text}${colors.reset}`;
}

export {
  whiteBrightBgYellowBold,
  whiteBrightBgGreenBold,
  whiteBrightBgRedBold,
  bold,
};
