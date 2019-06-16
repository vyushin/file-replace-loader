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
    rules: [{
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
    }, {
      test: /\.png$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      }, {
        loader: 'file-replace-loader',
        options: {
          condition: 'if-replacement-exists',
          replacement: resolve('./src/replacement.png')
        }
      }]
    }]
  },
  resolveLoader: {
    modules: ['node_modules', resolve('../../')]
  },
  target: 'node',
};