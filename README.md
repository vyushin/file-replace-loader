# file-replace-loader
[![version](https://img.shields.io/npm/v/file-replace-loader.svg?style=flat-square)](https://www.npmjs.com/package/file-replace-loader)
[![npm downloads](https://img.shields.io/npm/dw/file-replace-loader.svg?style=flat-square)](https://www.npmjs.com/package/file-replace-loader)
[![license](https://img.shields.io/github/license/vyushin/file-replace-loader.svg?style=flat-square)](https://github.com/vyushin/file-replace-loader/blob/master/LICENSE)

file-replace-loader is webpack loader that allows you replace files in compile time by some condition.

## Table of contents

* [Features](#features)
* [Installation](#installation)
* [Usage](#usage)
* [Multiple replace](#multiple-replace)
* [Using with binary files](#using-with-binary-files)
* [Using with other loaders](#using-with-other-loaders)
* [Loader options](#loader-options)
* [Contributing](#contributing)
* [License](#license)

## Features

* Compatibility with webpack 3.x, 4.x, 5.x;
* Support watch webpack mode;
* Replace files in compile time without change source files;
* Multiple replacement;
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

This example rule replaces all of imports `/\.config.js$/` to `config.local.js` file, <br/>if replacement exists (condition `if-replacement-exists`).

After this build a bundle file will contain code from `config.local.js` and original sources
won't changed.

## Multiple replace

To describe replace rules for two or more files you can use function as replacement value.<br/>

How does it work?
1. Webpack runs file-replace-loader according to `test` rule, `include` and `exclude` rule options;
2. file-replace-loader looks on `replacement` option. If it is string then the loader just replace a file. If it is a function
then file-replace-loader checking what it returns. If the function returns a path to file then the loader
replaces, if returns nothing then current match skips.
3. If `replacement` function returns a path then file-replace-loader looks to `condition`. If condition is `always` then it replace every match. If `condition` is
`if-replacement-exists` then loader checking existing file, etc;

For example:

```javascript
const { resolve } = require('path');

module.exports = {
  //...
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'file-replace-loader',
      options: {
        condition: 'always', // <-- Note that the rule applies for all files!
        replacement(resourcePath) {
          if (resourcePath.endsWith('foo.js')) {
            return resolve('./bar.js');
          }
          if (resourcePath.endsWith('foo-a.js')) {
            return resolve('./bar-a.js');
          }
        },
        async: true,
      }
    }]
  }
}
```

file-replace-loader passes to `replacement` function `resourcePath` for every matching.
file-replace-loader doesn't care what developer does with this path but if `repalcement` function returns a new path then file-replace-loader replaces file.
If `replacement` function returns nothing then file-replace-loading skip replace for current `resourcePath`.

Example with mapping:

```javascript
const { resolve } = require('path');

module.exports = {
  //...
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'file-replace-loader',
      options: {
        condition: 'always', // <-- Note that the rule applies for all files! But you can use other conditions too
        replacement(resourcePath) {
          const mapping = {
            [resolve('./src/foo-a.js')]: resolve('./src/bar-a.js'),
            [resolve('./src/foo-b.js')]: resolve('./src/bar-b.js'),
            [resolve('./src/foo-c.js')]: resolve('./src/bar-c.js'),
          };
          return mapping[resourcePath];
        },
        async: true,
      }
    }]
  }
}
```

**NOTE:** Make shure that all replacement files contains necessary imports and exports 
that other files are expecting.

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

file-replace-loader must executes before other loaders. This means that in webpack config file the loader must be last in list. <br/>For example:

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

In incorrect example above file-replace-loader first in rule list. 
This case throw an error because file-replace-loader should be last in list.

## Loader options

| Option                                | Type            | Required       | Default                 | Possible values
| ------------                          | -------------   | -------------  | -------------           | -------------
| `condition`<br/>Condition to replace  | `string`&#124;`boolean`        | no             | `'if-replacement-exists'` | `true`,<br/>`false`,<br/>`'always'`,<br/>`'never'`,<br/>`'if-replacement-exists'`,<br/>`'if-source-is-empty'`
| `replacement`<br/>Replacement file    | `string`&#124;`function (resourcePath, options)`        | yes            | —                       | Full path to file or function returning full path to file
| `async`<br/>Asynchronous file reading | `boolean`       | no             | `true`                  | `true`,<br/>`false`
| `progress`<br/>Progress output        | `boolean`       | no             | `IS_DEBUG_MODE == true or IS_PROGRESS_MODE == true`                  | `true`,<br/>`false`

## Contributing
See [contributing](https://github.com/vyushin/file-replace-loader/blob/master/CONTRIBUTING.md) guideline.

## License
[MIT LICENSE](https://github.com/vyushin/file-replace-loader/blob/master/LICENSE)
