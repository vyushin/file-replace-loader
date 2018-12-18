/**
 * File replace loader script
 * {@link https://github.com/vyushin/file-replace-loader/blob/master/src/index.js}
 */

import loaderUtils from 'loader-utils';
import validateOptions from 'schema-utils';
import { resolve } from 'path';
import { readFile as readFileAsync, readFileSync, existsSync, statSync } from 'fs';
import { ENCODING, LOADER_NAME, MAIN_LOADER_FILE, LOADER_REPLACEMENT_CONDITIONS,
  LOADER_OPTIONS_SCHEMA, ERROR_TYPES, ERROR_MESSAGES, IS_PROGRESS_MODE, IS_DEBUG_MODE } from './constants';

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
 * Progress function wrapper
 */
const progress = function() {
  if (IS_PROGRESS_MODE !== true && IS_DEBUG_MODE !== true) return () => {};
  let isFirstMessage = true;
  /**
   * Print progress message
   * @param {String} message
   */
  return (message) => {
    const newLine = isFirstMessage === true && '\n' || '';
    console.info(`${newLine}[${LOADER_NAME}]: ${message}`);
    isFirstMessage = false;
  };
}();

function readFile(path, isAsync, callback) {
  if (isAsync) {
    return readFileAsync(path, ENCODING, (err, content) => {
      err && new Exception({
        title: ERROR_TYPES[2],
        message: err.message
      });
      callback(content);
    });
  } else {
    return readFileSync(path, { encoding: ENCODING, flag: 'r' });
  }
}

function getOptions(loaderContext) {
  const properties = Object.keys(LOADER_OPTIONS_SCHEMA.properties) || [];
  const defaultOptions = {};
  properties.forEach(key => defaultOptions[key] = LOADER_OPTIONS_SCHEMA.properties[key].default);
  const result = Object.assign({}, defaultOptions, loaderUtils.getOptions(loaderContext));
  return result;
}

/**
 * Checks the condition by compliance
 * @param {String} condition
 * @return {Proof}
 */
function condition(condition) {
  function Proof(condition) {
    this.oneOf = function() {
      const args = Array.from(arguments || []);
      return args.some(arg => arg === condition);
    };
    this.is = function() {
      return condition === arguments[0];
    };
  }
  return new Proof(condition);
}

/**
 * File Replace Loader function
 */
export default function(source) {
  const options = getOptions(this);
  const isAsync = options && options.async === true;
  const callback = isAsync === true && this.async() || null;

  /**
   * Validate loader options before its work
   */
  try {
    progress(`Validate options`);
    validateOptions(LOADER_OPTIONS_SCHEMA, options);
  } catch (e) {
    throw prepareErrorSchemaMessage(e);
  }

  /**
   * Checking using with other loaders
   */
  if (this.loaders.length > 1) {
    progress(`Checking using with other loaders`);
    const firstLoader = this.loaders[this.loaders.length - 1];
    const isNotFirst = firstLoader.path !== MAIN_LOADER_FILE;

    if (isNotFirst) {
      throw new Exception({
        title: ERROR_TYPES[3],
        message: ERROR_MESSAGES[3],
      })
    }
  }

    const replacementUrl = options.replacement(this.resourcePath);
    if (this.resourcePath !== replacementUrl) {
        progress(`Replace [${this.resourcePath}] -> [${replacementUrl}]`);
    }
    return isAsync
        ? readFile(replacementUrl, true, (content) => { callback(null, content) })
        : readFile(replacementUrl, false);
};
