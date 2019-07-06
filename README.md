# file-replace-loader
[![version](https://img.shields.io/npm/v/file-replace-loader.svg?style=flat-square)](https://www.npmjs.com/package/file-replace-loader)
[![npm downloads](https://img.shields.io/npm/dw/file-replace-loader.svg?style=flat-square)](https://www.npmjs.com/package/file-replace-loader)
[![license](https://img.shields.io/github/license/vyushin/file-replace-loader.svg?style=flat-square)](https://github.com/vyushin/file-replace-loader/blob/master/LICENSE)

file-replace-loader is webpack loader that allows you replace files in compile time by some condition.

## Features

* Compatibility with webpack 3.x, 4.x;
* Supports watch webpack mode;
* Replace files in compile time without change source files;
* Sync and async modes;
* Compatibility with other loaders;
* Support binary files.

## Installation

###### NPM
`npm install --save-dev file-replace-loader`

###### Yarn
`yarn add file-replace-loader`

## Usage

```javascript
const { resolve } = require('path');

module.exports = {
  //...
  module: {
    rules: [{
      test: /\.config\.js$/,
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

This example rule will replace all of imports `/\.config.js$/` to `config.local.js` file, <br/>if replacement exists (condition `if-replacement-exists`).

After example build in bundle file will some code from `config.local.js` and original sources
won't changed.

## Using with binary files

file-replace-loader allows replace binary files. <br/>For example:

```javascript
//webpack.config.js

const { resolve } = require('path');

module.exports = {
  //...
  module: {
    rules: [{
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
  }
}
```

## Using with other loaders

file-replace-loader must executes before other loaders. It means that in webpack config file the loader must be last in list. <br/>For example:

```javascript
//webpack.config.js

const { resolve } = require('path');

// Correct

module.exports = {
  //...
  module: {
    rules: [{
      test: /\.config\.js$/,
      use: [{
        loader: 'babel-loader',
      }, {
        loader: 'file-replace-loader',
        options: {
          condition: 'if-replacement-exists',
          replacement: resolve('./config.local.js'),
          async: true,
        }
      }]
    }]
  },
}
```

Above is correct example. file-replace-loader will executed before other loaders.
<br/>Let's see incorrect usage:

```javascript
//webpack.config.js

const { resolve } = require('path');

// Error, because file-replace-loader will be execute after other loaders

module.exports = {
  //...
  module: {
    rules: [{
      test: /\.config\.js$/,
      use: [{
        loader: 'file-replace-loader',
        options: {
          condition: 'if-replacement-exists',
          replacement: resolve('./config.local.js'),
          async: true,
        }
      }, {
        loader: 'babel-loader',
      }]
    }]
  },
}
```

## Loader options

| Key                                   | Type            | Required       | Default                 | Possible values
| ------------                          | -------------   | -------------  | -------------           | -------------
| `condition`<br/>Condition to replace  | `enum`          | no             | `'if-replacement-exists'` | `true`,<br/>`false`,<br/>`'always'`,<br/>`'never'`,<br/>`'if-replacement-exists'`,<br/>`'if-source-is-empty'`
| `replacement`<br/>Replacement file    | `string`        | yes            | —                       | Full path to file
| `async`<br/>Asynchronous file reading | `boolean`       | no             | `true`                  | `true`,<br/>`false`

## Contributing
See [contributing](https://github.com/vyushin/file-replace-loader/blob/master/CONTRIBUTING.md) guideline.

## License
[MIT LICENSE](https://github.com/vyushin/file-replace-loader/blob/master/LICENSE)
