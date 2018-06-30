/**
 * Main file of file replace loader
 * {@link https://github.com/vyushin/file-replace-loader/blob/master/index.js}
 */

const loaderUtils = require('loader-utils');
const validateOptions = require('schema-utils');
const path = require('path');
const fs = require('fs');
const CONSTANTS = require('./constants');

const ENCODING = CONSTANTS.ENCODING;
const LOADER_NAME = CONSTANTS.LOADER_NAME;
const MAIN_LOADER_FILE = CONSTANTS.MAIN_LOADER_FILE;
const LOADER_REPLACEMENT_CONDITIONS = CONSTANTS.LOADER_REPLACEMENT_CONDITIONS;
const LOADER_OPTIONS_SCHEMA = CONSTANTS.LOADER_OPTIONS_SCHEMA;
const ERROR_TYPES = CONSTANTS.ERROR_TYPES;
const ERROR_MESSAGES = CONSTANTS.ERROR_MESSAGES;

/**
 * Custom exception formatted to the loader format
 */
function Exception(options) {
  const defaultOptions = { name: `\n[${LOADER_NAME}]` };
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
  let message = '';
  e.errors && e.errors.forEach((error) => {
    const dataPath = error.dataPath && error.dataPath.replace(/^\.+/, '') || '';
    const property = LOADER_OPTIONS_SCHEMA.properties[dataPath] || {};
    const errorMessages = property && property.errorMessages;
    message += `\n  [options.${dataPath}]: ${(errorMessages && errorMessages[error.keyword]) || error.message}`;
  });
  e.name = `\n[${LOADER_NAME}]`;
  e.message = message ? `${ERROR_TYPES[0]} ${message}\n` : e.message;
  return e;
}

/**
 * Formatting info messages
 * @param {String} message
 * @return {String}
 */
function prepareInfoMessage(message) {
  return `[${LOADER_NAME}] ${message}`;
}

function readFile(path, isAsync, callback) {
  if (isAsync) {
    return fs.readFile(path, ENCODING, (err, content) => {
      err && new Exception({
        title: ERROR_TYPES[2],
        message: err.message
      });
      callback(content);
    });
  } else {
    return fs.readFileSync(path, { encoding: ENCODING, flag: 'r' });
  }
}

function getOptions(loaderContext) {
  const properties = Object.keys(LOADER_OPTIONS_SCHEMA.properties) || [];
  const defaultOptions = {};
  properties.forEach(key => defaultOptions[key] = LOADER_OPTIONS_SCHEMA.properties[key].default);
  const result = Object.assign({}, defaultOptions, loaderUtils.getOptions(loaderContext));
  result.replacement && (result.replacement = path.resolve(loaderContext.context, result.replacement));
  return result;
}

/**
 * File Replace Loader function
 */
module.exports = function(source) {
  const options = getOptions(this);
  const isAsync = options && options.async === true;
  const callback = isAsync === true && this.async() || null;

  /**
   * Validate loader options before its work
   */
  try {
    validateOptions(LOADER_OPTIONS_SCHEMA, options);
  } catch (e) {
    throw prepareErrorSchemaMessage(e);
  }

  /**
   * Checking using with other loaders
   */
  if (this.loaders.length > 1) {
    const firstLoader = this.loaders[this.loaders.length - 1];
    const isFirst = firstLoader.path === MAIN_LOADER_FILE;

    if (!isFirst) {
      throw new Exception({
        title: ERROR_TYPES[3],
        message: ERROR_MESSAGES[3],
      })
    }
  }

  /**
   * If condition is 'always' or true
   */
  if (options.condition === LOADER_REPLACEMENT_CONDITIONS[1] ||
      options.condition === LOADER_REPLACEMENT_CONDITIONS[2]) {
    if (fs.existsSync(options.replacement)) {
      this.addDependency(options.replacement);
      return isAsync
        ? readFile(options.replacement, true, (content) => { callback(null, content) })
        : readFile(options.replacement, false);
    } else {
      throw new Exception({
        title: ERROR_TYPES[1],
        message: ERROR_MESSAGES[0].replace('$1', options.replacement),
      });
    }
  }

  /**
   * If condition is 'if-replacement-exists'
   */
  if (options.condition === LOADER_REPLACEMENT_CONDITIONS[4]) {
    if (fs.existsSync(options.replacement)) {
      this.addDependency(options.replacement);
      return isAsync
        ? readFile(options.replacement, true, (content) => { callback(null, content) })
        : readFile(options.replacement, false);
    }
    /**
     * We don't need any errors here, because it isn't error when replacement doesn't exist by
     * condition 'if-replacement-exists'
     */
  }

  /**
   * If condition is 'if-source-is-empty'
   */
  if (options.condition === LOADER_REPLACEMENT_CONDITIONS[5]) {
    if (fs.existsSync(options.replacement)) {
      const stats = fs.statSync(this.resourcePath);
      if (stats.size === 0) {
        this.addDependency(options.replacement);
        return isAsync
          ? readFile(options.replacement, true, (content) => { callback(null, content) })
          : readFile(options.replacement, false);
      } else {
        return isAsync ? callback(null, source) : source;
      }
    } else {
      throw new Exception({
        title: ERROR_TYPES[1],
        message: ERROR_MESSAGES[1].replace('$1', options.replacement),
      });
    }
  }

  /**
   * If condition is 'never' or false
   */
  if (options.condition === LOADER_REPLACEMENT_CONDITIONS[0] ||
      options.condition === LOADER_REPLACEMENT_CONDITIONS[3]) {
    return isAsync ? callback(null, source) : source;
  }
};
