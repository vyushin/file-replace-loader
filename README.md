# file-replace-loader
[![version](https://img.shields.io/npm/v/file-replace-loader.svg?style=flat-square)](https://www.npmjs.com/package/file-replace-loader)
[![npm downloads](https://img.shields.io/npm/dt/file-replace-loader.svg?style=flat-square)](https://www.npmjs.com/package/file-replace-loader)
[![license](https://img.shields.io/github/license/vyushin/file-replace-loader.svg?style=flat-square)](https://github.com/vyushin/file-replace-loader/blob/master/LICENSE)

file-replace-loader is webpack loader that allows you replace files in compile time

## Usage

```javascript
//webpack.config.js

module: {
rules: [{
  test: /\.config.js$/,
  loader: 'file-replace-loader',
  options: {
    condition: 'if-replacement-exist',
    replacement: resolve('./config.local.js')
  }
}]
}
```

## Installation

###### NPM
`npm i -D file-replace-loader`

## License
[MIT LICENSE](https://github.com/vyushin/file-replace-loader/blob/master/LICENSE)