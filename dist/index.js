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

  /**
   * If condition is 'always' or true
   */
  if (condition(options.condition).oneOf(_constants.LOADER_REPLACEMENT_CONDITIONS[1], _constants.LOADER_REPLACEMENT_CONDITIONS[2])) {
    progress('Trying replace by condition \'' + options.condition + '\'');
    if ((0, _fs.existsSync)(options.replacement)) {
      progress('Replace [' + this.resourcePath + '] -> [' + options.replacement + ']');
      this.addDependency(options.replacement);
      return isAsync ? readFile(options.replacement, true, function (content) {
        callback(null, content);
      }) : readFile(options.replacement, false);
    } else {
      throw new Exception({
        title: _constants.ERROR_TYPES[1],
        message: _constants.ERROR_MESSAGES[0].replace('$1', options.replacement)
      });
    }
  }

  /**
   * If condition is 'if-replacement-exists'
   */
  if (condition(options.condition).is(_constants.LOADER_REPLACEMENT_CONDITIONS[4])) {
    progress('Trying replace by condition \'' + options.condition + '\'');
    if ((0, _fs.existsSync)(options.replacement)) {
      progress('Replace [' + this.resourcePath + '] -> [' + options.replacement + ']');
      this.addDependency(options.replacement);
      return isAsync ? readFile(options.replacement, true, function (content) {
        callback(null, content);
      }) : readFile(options.replacement, false);
    }
    /**
     * We don't need any errors here, because it isn't error when replacement doesn't exist by
     * condition 'if-replacement-exists'
     */
  }

  /**
   * If condition is 'if-source-is-empty'
   */
  if (condition(options.condition).is(_constants.LOADER_REPLACEMENT_CONDITIONS[5])) {
    progress('Trying replace by condition \'' + options.condition + '\'');
    if ((0, _fs.existsSync)(options.replacement)) {
      var stat = (0, _fs.statSync)(this.resourcePath);
      if (stat.size === 0) {
        progress('Replace [' + this.resourcePath + '] -> [' + options.replacement + ']');
        this.addDependency(options.neplacement);
        return isAsync ? readFile(options.replacement, true, function (content) {
          callback(null, content);
        }) : readFile(options.replacement, false);
      } else {
        progress('Skip replacement because source file [' + this.resourcePath + '] is not empty');
        return isAsync ? callback(null, source) : source;
      }
    } else {
      throw new Exception({
        title: _constants.ERROR_TYPES[1],
        message: _constants.ERROR_MESSAGES[1].replace('$1', options.replacement)
      });
    }
  }

  /**
   * If condition is 'never' or false
   */
  if (condition(options.condition).oneOf(_constants.LOADER_REPLACEMENT_CONDITIONS[0], _constants.LOADER_REPLACEMENT_CONDITIONS[3])) {
    progress('Skip replacement because condition is \'' + options.condition + '\'');
    return isAsync ? callback(null, source) : source;
  }
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
  result.replacement && (result.replacement = (0, _path.resolve)(loaderContext.context, result.replacement));
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