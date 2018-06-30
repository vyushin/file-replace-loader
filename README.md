# file-replace-loader
[![version](https://img.shields.io/npm/v/file-replace-loader.svg?style=flat-square)](https://www.npmjs.com/package/file-replace-loader)
[![npm downloads](https://img.shields.io/npm/dt/file-replace-loader.svg?style=flat-square)](https://www.npmjs.com/package/file-replace-loader)
[![license](https://img.shields.io/github/license/vyushin/file-replace-loader.svg?style=flat-square)](https://github.com/vyushin/file-replace-loader/blob/master/LICENSE)

file-replace-loader is webpack loader that allows you replace files in compile time by some condition.

### Features

* Compatibility with webpack 3.x, 4.x
* Replaces files which importing in compile time
* Sync and Async modes
* Replaces files only in compile time, without changes source files
* Compatibility with other loaders

## Usage

```javascript
//webpack.config.js

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

After example build in bundle file will be some code from `config.local.js` and original sources
won't changed.

## Using with other loaders

File replace loader must executes before other loaders. It means that in webpack config file the loader must be last in list. For example:

```javascript
//webpack.config.js

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

Above is correct example. File replace loader will executed before other loaders.
Let's see inadmissible usage:

```javascript
//webpack.config.js

// Error, because file replace loader will be execute after other loaders
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
