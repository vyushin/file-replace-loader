# file-replace-loader
[![version](https://img.shields.io/npm/v/file-replace-loader.svg?style=flat-square)](https://www.npmjs.com/package/file-replace-loader)
[![npm downloads](https://img.shields.io/npm/d18m/file-replace-loader)](https://www.npmjs.com/package/file-replace-loader)
[![license](https://img.shields.io/github/license/vyushin/file-replace-loader.svg?style=flat-square)](https://github.com/vyushin/file-replace-loader/blob/master/LICENSE)

file-replace-loader is a webpack loader that allows you to replace files at compile time based on conditions.

> **file-replace-loader is free** and will always remain free <br/>
> A simple and quick way to support the project is to **buy me a coffee**. <br/>It will take no more than 5 minutes and will allow the project to keep going

<a href="https://buymeacoffee.com/vyushin" target="_blank" title="Buy me a coffee">
  <img height="50" alt="Buy me a coffee" src="https://github.com/vyushin/file-replace-loader/assets/8006957/99ce6635-4489-4073-bcf9-da8b72aa4cd7">
</a>

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
* Supports webpack watch mode;
* Replace files at compile time without changing source files;
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

This rule replaces matching `/\.config\.js$/` files with `config.local.js`, <br/>if replacement exists (condition `if-replacement-exists`).

After the build, the bundle will contain code from `config.local.js`, while original sources
won't be changed.

## Multiple replace

To describe replace rules for two or more files you can use function as replacement value.<br/>

How does it work?
1. Webpack runs file-replace-loader according to `test` rule, `include` and `exclude` rule options;
2. file-replace-loader checks the `replacement` option. If it is a string, the loader replaces the file. If it is a function,
then file-replace-loader checks what it returns. If the function returns a file path, the loader
replaces the file; if it returns nothing, the current match is skipped.
3. If the `replacement` function returns a path, file-replace-loader checks `condition`. If condition is `always`, it replaces every match. If `condition` is
`if-replacement-exists`, the loader checks whether the file exists, etc;

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

file-replace-loader passes `resourcePath` to the `replacement` function for every matched file.
file-replace-loader does not enforce how this path is processed, but if the `replacement` function returns a new path, file-replace-loader replaces the file.
If the `replacement` function returns nothing, file-replace-loader skips replacement for the current `resourcePath`.

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

**NOTE:** Make sure that all replacement files contain the necessary imports and exports 
that other files are expecting.

## Using with binary files

file-replace-loader allows replacing binary files. <br/>For example:

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

file-replace-loader must execute before other loaders. This means that in a webpack config file the loader must be last in the list. <br/>For example:

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

The example above is correct. file-replace-loader will be executed before other loaders.
<br/>Let's see incorrect usage:

```javascript
//webpack.config.js

const { resolve } = require('path');

// Error, because file-replace-loader will be executed after other loaders

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

In the incorrect example above, file-replace-loader is first in the rule list. 
This case throws an error because file-replace-loader should be last in the list.

## Loader options

| Option                                | Type            | Required       | Default                 | Possible values
| ------------                          | -------------   | -------------  | -------------           | -------------
| `condition`<br/>Condition to replace  | `string`&#124;`boolean`        | no             | `'if-replacement-exists'` | `true`,<br/>`false`,<br/>`'always'`,<br/>`'never'`,<br/>`'if-replacement-exists'`,<br/>`'if-source-is-empty'`
| `replacement`<br/>Replacement file    | `string`&#124;`function (resourcePath, options)`        | yes            | —                       | Full path to file or function returning full path to file
| `async`<br/>Asynchronous file reading | `boolean`       | no             | `true`                  | `true`,<br/>`false`
| `progress`<br/>Progress output        | `boolean`       | no             | `IS_DEBUG_MODE == true or IS_PROGRESS_MODE == true`                  | `true`,<br/>`false`

## Contributing
See the [contributing](https://github.com/vyushin/file-replace-loader/blob/master/CONTRIBUTING.md) guideline.

## License
[MIT LICENSE](https://github.com/vyushin/file-replace-loader/blob/master/LICENSE)
