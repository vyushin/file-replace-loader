const resolve = require('path').resolve;

module.exports = {
  entry: {
    script: resolve('./index.js'),
  },

  module: {
    rules: [{
      test: /\.js$/,
      loader: 'file-replace-loader',
      options: {
        condition: 'if-source-is-empty',
        replacement: resolve('./replacement.js')
      }
    }]
  },
  resolveLoader: {
    modules: ['node_modules', resolve('../../')]
  },
  target: 'node',
  mode: 'development'
};