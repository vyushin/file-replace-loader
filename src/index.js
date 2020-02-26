/**
 * File replace loader script
 * {@link https://github.com/vyushin/file-replace-loader/blob/master/src/index.js}
 */

import loaderUtils from 'loader-utils';
import validateOptions from 'schema-utils';
import { resolve } from 'path';
import { readFile as readFileAsync, readFileSync, existsSync, statSync } from 'fs';
import { LOADER_NAME, MAIN_LOADER_FILE, LOADER_REPLACEMENT_CONDITIONS,
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
    return readFileAsync(path, null, (err, content) => {
      err && new Exception({
        title: ERROR_TYPES[2],
        message: err.message
      });
      callback(content);
    });
  } else {
    return readFileSync(path, { flag: 'r' });
  }
}

function getOptions(loaderContext) {
  const properties = Object.keys(LOADER_OPTIONS_SCHEMA.properties) || [];
  const defaultOptions = {};
  properties.forEach(key => defaultOptions[key] = LOADER_OPTIONS_SCHEMA.properties[key].default);
  const result = Object.assign({}, defaultOptions, loaderUtils.getOptions(loaderContext));
  //result.replacement && (result.replacement = resolve(loaderContext.context, result.replacement));
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

/** Enable raw input from webpack
 *
 * This asks webpack to provide us a Buffer instead of a String.
 *
 * We need this to avoid corrupting binary files when returning
 * the input unmodified.
 *
 */
export const raw = true;

/**
 * File Replace Loader function
 */
export default function(source) {
  const options = getOptions(this);
  const isAsync = options && options.async === true;
  const callback = isAsync === true && this.async() || null;
  const replacement = (resourcePath) => (
    options.replacement instanceof Function ? options.replacement(resourcePath) || null : options.replacement
  );

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

  /**
   * If condition is 'always' or true
   */
  if (condition(options.condition).oneOf(LOADER_REPLACEMENT_CONDITIONS[1], LOADER_REPLACEMENT_CONDITIONS[2])) {
    progress(`Trying replace by condition '${options.condition}'`);
    const replacementPath = replacement(this.resourcePath);
    if (replacementPath === null) {
      return isAsync ? callback(null, source) : source; // Skip replacement
    }
    if (existsSync(replacementPath)) {
      progress(`Replace [${this.resourcePath}] -> [${replacementPath}]`);
      this.addDependency(replacementPath);
      return isAsync
        ? readFile(replacementPath, true, (content) => { callback(null, content) })
        : readFile(replacementPath, false);
    } else {
      throw new Exception({
        title: ERROR_TYPES[1],
        message: ERROR_MESSAGES[0].replace('$1', replacementPatht),
      });
    }
  }

  /**
   * If condition is 'if-replacement-exists'
   */
  if (condition(options.condition).is(LOADER_REPLACEMENT_CONDITIONS[4])) {
    progress(`Trying replace by condition '${options.condition}'`);
    const replacementPath = replacement(this.resourcePath);
    if (replacementPath === null) {
      return isAsync ? callback(null, source) : source; // Skip replacement
    }
    if (existsSync(replacementPath)) {
      progress(`Replace [${this.resourcePath}] -> [${replacementPath}]`);
      this.addDependency(replacementPath);
      return isAsync
        ? readFile(replacementPath, true, (content) => { callback(null, content) })
        : readFile(replacementPath, false);
    } else {
      return isAsync ? callback(null, source) : source;
    }
  }

  /**
   * If condition is 'if-source-is-empty'
   */
  if (condition(options.condition).is(LOADER_REPLACEMENT_CONDITIONS[5])) {
    progress(`Trying replace by condition '${options.condition}'`);
    const replacementPath = replacement(this.resourcePath);
    if (replacementPath === null) {
      return isAsync ? callback(null, source) : source; // Skip replacement
    }
    if (existsSync(replacementPath)) {
      const stat = statSync(this.resourcePath);
      if (stat.size === 0) {
        progress(`Replace [${this.resourcePath}] -> [${replacementPath}]`);
        this.addDependency(replacementPath);
        return isAsync
          ? readFile(replacementPath, true, (content) => { callback(null, content) })
          : readFile(replacementPath, false);
      } else {
        progress(`Skip replacement because source file [${this.resourcePath}] is not empty`);
        return isAsync ? callback(null, source) : source;
      }
    } else {
      throw new Exception({
        title: ERROR_TYPES[1],
        message: ERROR_MESSAGES[1].replace('$1', replacementPath),
      });
    }
  }

  /**
   * If condition is 'never' or false
   */
  if (condition(options.condition).oneOf(LOADER_REPLACEMENT_CONDITIONS[0], LOADER_REPLACEMENT_CONDITIONS[3])) {
    progress(`Skip replacement because condition is '${options.condition}'`);
    return isAsync ? callback(null, source) : source;
  }
};
