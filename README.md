# file-replace-loader
[![version](https://img.shields.io/npm/v/file-replace-loader.svg?style=flat-square)](https://www.npmjs.com/package/file-replace-loader)
[![npm downloads](https://img.shields.io/npm/dt/file-replace-loader.svg?style=flat-square)](https://www.npmjs.com/package/file-replace-loader)
[![license](https://img.shields.io/github/license/vyushin/file-replace-loader.svg?style=flat-square)](https://github.com/vyushin/file-replace-loader/blob/master/LICENSE)

file-replace-loader is webpack loader that allows you replace files in compile time by some condition.

## Usage

```javascript
//webpack.config.js

module: {
  rules: [{
    test: /\.config.js$/,
    loader: 'file-replace-loader',
    options: {
      condition: 'if-replacement-exists',
      replacement: resolve('./config.local.js')
    }
  }]
}
```

This example rule will replace all of imports `/\.config.js$/` to `config.local.js` file,
if replacement exists (condition `if-replacement-exists`).

## Options

Key          | Description          | Type          | Required       | Default               | Possible values
------------ | -------------        | ------------- | -------------  | -------------         | -------------
`condition`  | Condition to replace | enum          | false          | if-replacement-exists | true
`replacement`| Replacement file     | string        | true           | none                  | Full path to file

## Installation

###### NPM
`npm i -D file-replace-loader`

## License
[MIT LICENSE](https://github.com/vyushin/file-replace-loader/blob/master/LICENSE)
