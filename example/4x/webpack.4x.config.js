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
            replacement: resolve('./src/replacement.js')
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
            replacement: resolve('./src/replacement.png')
          }
        }]
      }
    ]
  },
  target: 'node',
};