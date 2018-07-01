/**
 * Main file written on old JS for compatibility
 * {@link https://github.com/vyushin/file-replace-loader/blob/master/index.js}
 */

console.time('time');
console.info('Transform file-replace-loader');

var path = require('path');
var babel = require('babel-core');
var fs = require('fs');

var TRANSFORM_OPTIONS = {
  env: 'development',
  sourceType: 'module',
  sourceMaps: false,
  babelrc: false,
  comments: true,
  minified: false,
  presets: [
    [
      'babel-preset-env',
      {
        options: {
          targets: {
            node: '4.3.0',
            uglify: false,
          },
        }
      }
    ]
  ]
};

var SOURCES = [
  path.resolve('./src/index.js'),
  path.resolve('./src/constants.js'),
];

fs.mkdirSync('./dist');

console.info('Transform files:\n  ' + SOURCES.join('\n  '));
SOURCES.forEach(function(source) {
  var data = babel.transformFileSync(source, TRANSFORM_OPTIONS).code;
  fs.writeFileSync('./dist/' + path.basename(source), data);
});

console.log('\nTRANSFORM SUCCESSFUL!');
console.timeEnd('time');