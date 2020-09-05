"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
exports.raw = void 0;

var _loaderUtils = _interopRequireDefault(require("loader-utils"));

var _schemaUtils = _interopRequireDefault(require("schema-utils"));

var _fs = require("fs");

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * File replace loader script
 * {@link https://github.com/vyushin/file-replace-loader/blob/master/src/index.js}
 */

/**
 * Custom exception formatted to the loader format
 */
function Exception(options) {
  var defaultOptions = {
    name: `\n[${_constants.LOADER_NAME}]`
  };
  Object.assign(this, defaultOptions, options);
  this.message = `${this.title || ''}\n  ${this.message}\n`;
  Error.call(this);
  Error.captureStackTrace(this, Exception);
}

Exception.prototype = Object.create(Error.prototype);
/**
 * Format schema error to the loader format
 * @param {Object} e Error object
 * @return {Object}
 */

function prepareErrorSchemaMessage(e) {
  var message = '';
  e.errors && e.errors.forEach(function (error) {
    var dataPath = error.dataPath && error.dataPath.replace(/^\.+/, '') || '';
    var property = _constants.LOADER_OPTIONS_SCHEMA.properties[dataPath] || {};
    var errorMessages = property && property.errorMessages;
    message += `\n  [options.${dataPath}]: ${errorMessages && errorMessages[error.keyword] || error.message}`;
  });
  e.name = `\n[${_constants.LOADER_NAME}]`;
  e.message = `${message ? `${_constants.ERROR_TYPES[0]} ${message}\n` : e.message} ${_constants.HELP_INFO_MESSAGE}`;
  return e;
}
/**
 * Progress function factory
 * @param {Object} options Options object
 * @return {Function} Progress function
 */


var progressFactory = function progressFactory(_ref) {
  var progress = _ref.progress;
  if (!progress) return function () {};
  var isFirstMessage = true;
  /**
   * Print progress message
   * @param {String} message
   */

  return function (message) {
    var newLine = isFirstMessage === true && '\n' || '';
    console.info(`${newLine}[${_constants.LOADER_NAME}]: ${message}`);
    isFirstMessage = false;
  };
};

function readFile(path, isAsync, callback) {
  if (isAsync) {
    return (0, _fs.readFile)(path, null, function (err, content) {
      err && new Exception({
        title: _constants.ERROR_TYPES[2],
        message: err.message
      });
      callback(content);
    });
  } else {
    return (0, _fs.readFileSync)(path, {
      flag: 'r'
    });
  }
}

function getOptions(loaderContext) {
  var hasLoaderContextGetOptionsFunc = typeof loaderContext.getOptions === 'function'; // Since Webpack 5, getOptions function is part of loader context

  var options = hasLoaderContextGetOptionsFunc ? loaderContext.getOptions(_constants.LOADER_OPTIONS_SCHEMA) : _loaderUtils.default.getOptions(loaderContext);
  var properties = Object.keys(_constants.LOADER_OPTIONS_SCHEMA.properties) || [];
  var defaultOptions = {};
  properties.forEach(function (key) {
    return defaultOptions[key] = _constants.LOADER_OPTIONS_SCHEMA.properties[key].default;
  });
  var result = Object.assign({}, defaultOptions, options); //result.replacement && (result.replacement = resolve(loaderContext.context, result.replacement));

  return result;
}
/**
 * Checks the condition by compliance
 * @param {String} condition
 * @return {Proof}
 */


function condition(condition) {
  function Proof(condition) {
    this.oneOf = function () {
      var args = Array.from(arguments || []);
      return args.some(function (arg) {
        return arg === condition;
      });
    };

    this.is = function () {
      return condition === arguments[0];
    };
  }

  return new Proof(condition);
}
/** Enable raw input from webpack
 *
 * This asks webpack to provide us a Buffer instead of a String.
 *
 * We need this to avoid corrupting binary files when returning
 * the input unmodified.
 *
 */


var raw = true;
/**
 * File Replace Loader function
 */

exports.raw = raw;

function _default(source) {
  var options = getOptions(this);
  var isAsync = options && options.async === true;
  var callback = isAsync === true && this.async() || null;

  var replacement = function replacement(resourcePath) {
    return options.replacement instanceof Function ? options.replacement(resourcePath) || null : options.replacement;
  };

  var progress = progressFactory(options);
  /**
   * Validate loader options before its work
   */

  try {
    progress(`Validate options`);
    (0, _schemaUtils.default)(_constants.LOADER_OPTIONS_SCHEMA, options);
  } catch (e) {
    this.emitError(e);
  }
  /**
   * Checking using with other loaders
   */


  if (this.loaders.length > 1) {
    progress(`Checking using with other loaders`);
    var firstLoader = this.loaders[this.loaders.length - 1];
    var isNotFirst = firstLoader.path !== _constants.MAIN_LOADER_FILE;

    if (isNotFirst) {
      throw new Exception({
        title: _constants.ERROR_TYPES[3],
        message: _constants.ERROR_MESSAGES[3]
      });
    }
  }
  /**
   * If condition is 'always' or true
   */


  if (condition(options.condition).oneOf(_constants.LOADER_REPLACEMENT_CONDITIONS[1], _constants.LOADER_REPLACEMENT_CONDITIONS[2])) {
    progress(`Trying replace by condition '${options.condition}'`);
    var replacementPath = replacement(this.resourcePath);

    if (replacementPath === null) {
      return isAsync ? callback(null, source) : source; // Skip replacement
    }

    if ((0, _fs.existsSync)(replacementPath)) {
      progress(`Replace [${this.resourcePath}] -> [${replacementPath}]`);
      this.addDependency(replacementPath);
      return isAsync ? readFile(replacementPath, true, function (content) {
        callback(null, content);
      }) : readFile(replacementPath, false);
    } else {
      throw new Exception({
        title: _constants.ERROR_TYPES[1],
        message: _constants.ERROR_MESSAGES[0].replace('$1', replacementPath)
      });
    }
  }
  /**
   * If condition is 'if-replacement-exists'
   */


  if (condition(options.condition).is(_constants.LOADER_REPLACEMENT_CONDITIONS[4])) {
    progress(`Trying replace by condition '${options.condition}'`);

    var _replacementPath = replacement(this.resourcePath);

    if (_replacementPath === null) {
      return isAsync ? callback(null, source) : source; // Skip replacement
    }

    if ((0, _fs.existsSync)(_replacementPath)) {
      progress(`Replace [${this.resourcePath}] -> [${_replacementPath}]`);
      this.addDependency(_replacementPath);
      return isAsync ? readFile(_replacementPath, true, function (content) {
        callback(null, content);
      }) : readFile(_replacementPath, false);
    } else {
      return isAsync ? callback(null, source) : source;
    }
  }
  /**
   * If condition is 'if-source-is-empty'
   */


  if (condition(options.condition).is(_constants.LOADER_REPLACEMENT_CONDITIONS[5])) {
    progress(`Trying replace by condition '${options.condition}'`);

    var _replacementPath2 = replacement(this.resourcePath);

    if (_replacementPath2 === null) {
      return isAsync ? callback(null, source) : source; // Skip replacement
    }

    if ((0, _fs.existsSync)(_replacementPath2)) {
      var stat = (0, _fs.statSync)(this.resourcePath);

      if (stat.size === 0) {
        progress(`Replace [${this.resourcePath}] -> [${_replacementPath2}]`);
        this.addDependency(_replacementPath2);
        return isAsync ? readFile(_replacementPath2, true, function (content) {
          callback(null, content);
        }) : readFile(_replacementPath2, false);
      } else {
        progress(`Skip replacement because source file [${this.resourcePath}] is not empty`);
        return isAsync ? callback(null, source) : source;
      }
    } else {
      throw new Exception({
        title: _constants.ERROR_TYPES[1],
        message: _constants.ERROR_MESSAGES[1].replace('$1', _replacementPath2)
      });
    }
  }
  /**
   * If condition is 'never' or false
   */


  if (condition(options.condition).oneOf(_constants.LOADER_REPLACEMENT_CONDITIONS[0], _constants.LOADER_REPLACEMENT_CONDITIONS[3])) {
    progress(`Skip replacement because condition is '${options.condition}'`);
    return isAsync ? callback(null, source) : source;
  }
}

;