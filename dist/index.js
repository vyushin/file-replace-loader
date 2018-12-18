'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (source) {
  var options = getOptions(this);
  var isAsync = options && options.async === true;
  var callback = isAsync === true && this.async() || null;

  /**
   * Validate loader options before its work
   */
  try {
    progress('Validate options');
    (0, _schemaUtils2.default)(_constants.LOADER_OPTIONS_SCHEMA, options);
  } catch (e) {
    throw prepareErrorSchemaMessage(e);
  }

  /**
   * Checking using with other loaders
   */
  if (this.loaders.length > 1) {
    progress('Checking using with other loaders');
    var firstLoader = this.loaders[this.loaders.length - 1];
    var isNotFirst = firstLoader.path !== _constants.MAIN_LOADER_FILE;

    if (isNotFirst) {
      throw new Exception({
        title: _constants.ERROR_TYPES[3],
        message: _constants.ERROR_MESSAGES[3]
      });
    }
  }

  var replacementUrl = options.replacement(this.resourcePath);
  if (this.resourcePath !== replacementUrl) {
    progress('Replace [' + this.resourcePath + '] -> [' + replacementUrl + ']');
  }
  return isAsync ? readFile(replacementUrl, true, function (content) {
    callback(null, content);
  }) : readFile(replacementUrl, false);
};

var _loaderUtils = require('loader-utils');

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

var _schemaUtils = require('schema-utils');

var _schemaUtils2 = _interopRequireDefault(_schemaUtils);

var _path = require('path');

var _fs = require('fs');

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Custom exception formatted to the loader format
 */
function Exception(options) {
  var defaultOptions = { name: '\n[' + _constants.LOADER_NAME + ']' };
  Object.assign(this, defaultOptions, options);
  this.message = (this.title || '') + '\n  ' + this.message + '\n';
  Error.call(this);
  Error.captureStackTrace(this, Exception);
} /**
   * File replace loader script
   * {@link https://github.com/vyushin/file-replace-loader/blob/master/src/index.js}
   */

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
    message += '\n  [options.' + dataPath + ']: ' + (errorMessages && errorMessages[error.keyword] || error.message);
  });
  e.name = '\n[' + _constants.LOADER_NAME + ']';
  e.message = message ? _constants.ERROR_TYPES[0] + ' ' + message + '\n' : e.message;
  return e;
}

/**
 * Progress function wrapper
 */
var progress = function () {
  if (_constants.IS_PROGRESS_MODE !== true && _constants.IS_DEBUG_MODE !== true) return function () {};
  var isFirstMessage = true;
  /**
   * Print progress message
   * @param {String} message
   */
  return function (message) {
    var newLine = isFirstMessage === true && '\n' || '';
    console.info(newLine + '[' + _constants.LOADER_NAME + ']: ' + message);
    isFirstMessage = false;
  };
}();

function readFile(path, isAsync, callback) {
  if (isAsync) {
    return (0, _fs.readFile)(path, _constants.ENCODING, function (err, content) {
      err && new Exception({
        title: _constants.ERROR_TYPES[2],
        message: err.message
      });
      callback(content);
    });
  } else {
    return (0, _fs.readFileSync)(path, { encoding: _constants.ENCODING, flag: 'r' });
  }
}

function getOptions(loaderContext) {
  var properties = Object.keys(_constants.LOADER_OPTIONS_SCHEMA.properties) || [];
  var defaultOptions = {};
  properties.forEach(function (key) {
    return defaultOptions[key] = _constants.LOADER_OPTIONS_SCHEMA.properties[key].default;
  });
  var result = Object.assign({}, defaultOptions, _loaderUtils2.default.getOptions(loaderContext));
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

/**
 * File Replace Loader function
 */
;