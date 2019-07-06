/**
 * Transform source code of file-replace-loader to old JS for more compatibility
 * {@link https://github.com/vyushin/file-replace-loader/blob/master/transform.js}
 */

console.time('time');
console.info(`
  _____                     __                      
 |_   _| __ __ _ _ __  ___ / _| ___  _ __ _ __ ___  
   | || '__/ _\` | '_ \\/ __| |_ / _ \\| '__| '_ \` _ \\ 
   | || | | (_| | | | \\__ \\  _| (_) | |  | | | | | |
   |_||_|  \\__,_|_| |_|___/_|  \\___/|_|  |_| |_| |_|                                              
`);

const { resolve, basename } = require('path');
const { transformFileAsync } = require('@babel/core');
const { mkdirSync, writeFileSync } = require('fs');

/**
 * Target code must be compatible with this Node.js version
 * @const
 */
const TARGET_NODE_VERSION = '4.3.0';

/**
 * Transform BABEL options
 * @const
 */
const TRANSFORM_OPTIONS = {
  sourceType: 'module',
  comments: true,
  sourceMaps: false,
  minified: false,
  configFile: false,
  babelrc: false,
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: TARGET_NODE_VERSION,
      },
    }],
  ],
};

/**
 * Files which will be transformed
 * @const
 */
const SOURCES = [
  resolve('./src/index.js'),
  resolve('./src/constants.js'),
];

/**
 * Destination directory
 * @const
 */
const DIST_DIR = resolve('./dist');

mkdirSync(DIST_DIR);

console.info(`Transform files for Node.js v${TARGET_NODE_VERSION}:\n  ${SOURCES.join(',\n  ')}`);
const promises = SOURCES.map((source) => (
  transformFileAsync(source, TRANSFORM_OPTIONS).then((result) => {
    writeFileSync(resolve(DIST_DIR, basename(source)), result.code);
  })
));

Promise.all(promises).then(() => {
  console.info('\nTRANSFORM SUCCESSFUL!');
  console.timeEnd('time');
});