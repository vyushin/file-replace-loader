# file-replace-loader
[![version](https://img.shields.io/npm/v/file-replace-loader.svg?style=flat-square)](https://www.npmjs.com/package/file-replace-loader)
[![npm downloads](https://img.shields.io/npm/dt/file-replace-loader.svg?style=flat-square)](https://www.npmjs.com/package/file-replace-loader)
[![license](https://img.shields.io/github/license/vyushin/file-replace-loader.svg?style=flat-square)](https://github.com/vyushin/file-replace-loader/blob/master/LICENSE)

file-replace-loader is webpack loader that allows you replace files in compile time by some condition.

### Features

* Compatibility with webpack 3.x, 4.x
* Replaces files which importing in compile time
* Sync and Async modes
* Compatibility with other loaders

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
        replacement: resolve('./config.local.js'),
        async: true,
      }
    }]
  }
}
```

This example rule will replace all of imports `/\.config.js$/` to `config.local.js` file,
if replacement exists (condition `if-replacement-exists`).

## Options

| Key                                   | Type            | Required       | Default                 | Possible values
| ------------                          | -------------   | -------------  | -------------           | -------------
| `condition`<br/>Condition to replace  | `enum`          | no             | `if-replacement-exists` | `true`,<br/>`false`,<br/>`always`,<br/>`never`,<br/>`if-replacement-exists`,<br/>`if-source-is-empty`
| `replacement`<br/>Replacement file    | `string`        | yes            | —                       | Full path to file
| `async`<br/>Asynchronous file reading | `boolean`       | no             | `true`                  | `true`,<br/>`false`

## Contributing

```bash
git clone https://github.com/vyushin/file-replace-loader
cd file-replace-loader/
npm i
npm run build_4x
cd ./example/dist
node ./script.js
```

## Installation

###### NPM
`npm i -D file-replace-loader`

## License
[MIT LICENSE](https://github.com/vyushin/file-replace-loader/blob/master/LICENSE)
