const { resolve } = require('path');

module.exports = {

  output: {
    filename: '[name].js',
    path: resolve('./dist'),
  },

  entry: {
    script: resolve('./src/source.js'),
    image: resolve('./src/source.png')
  },

  module: {
    rules: [
        /**
         * Using file replace loader with text files (for example .js)
         */
        {
        test: /\.js$/,
        use: [{
          loader: 'babel-loader',
          }, {
          loader: 'file-replace-loader',
          options: {
            condition: 'if-replacement-exists',
            progress: false,
            replacement(resourcePath) {
              const mapping = {
                [resolve('./src/source.js')]: resolve('./src/replacement.js'),
                [resolve('./src/multiple-replacement-test/source-a.js')]: resolve('./src/multiple-replacement-test/replacement-a.js'),
                [resolve('./src/multiple-replacement-test/source-b.js')]: resolve('./src/multiple-replacement-test/replacement-b.js'),
              };
              return mapping[resourcePath];
            }
          }
        }]
      },
      /**
       * Using file replace loader with binary files (for example .png)
       */
      {
        test: /\.png$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          },
        }, {
          loader: 'file-replace-loader',
          options: {
            condition: true,
            progress: false,
            replacement: resolve('./src/replacement.png')
          }
        }]
      }
    ]
  },
  target: 'node',
};