# file-replace-loader
[![version](https://img.shields.io/npm/v/file-replace-loader.svg?style=flat-square)](https://www.npmjs.com/package/file-replace-loader)
[![npm downloads](https://img.shields.io/npm/dt/file-replace-loader.svg?style=flat-square)](https://www.npmjs.com/package/file-replace-loader)
[![license](https://img.shields.io/github/license/vyushin/file-replace-loader.svg?style=flat-square)](https://github.com/vyushin/file-replace-loader/blob/master/LICENSE)

file-replace-loader is webpack loader that allows you replace files in compile time by some condition.

## Usage

```javascript
//webpack.config.js
module.exports = {
  //...
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
}
```

This example rule will replace all of imports `/\.config.js$/` to `config.local.js` file,
if replacement exists (condition `if-replacement-exists`).

## Options

| Key          | Description                | Type            | Required       | Default               | Possible values
| ------------ | -------------              | -------------   | -------------  | -------------         | -------------
| `condition`  | Condition to replace       | `enum`          | no             | if-replacement-exists | `true`<br/>`false`<br/>`always`<br/>`never`<br/>`if-replacement-exists`<br/>`if-source-is-empty`
| `replacement`| Replacement file           | `string`        | yes            | —                     | Full path to file
| `async`      | Asynchronous file reading  | `boolean`       | no             | `true`                | `true`<br/>`false`

## Installation

###### NPM
`npm i -D file-replace-loader`

## License
[MIT LICENSE](https://github.com/vyushin/file-replace-loader/blob/master/LICENSE)
