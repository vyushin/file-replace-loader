const loaderUtils = require('loader-utils');
const validateOptions = require('schema-utils');
const path = require('path');
const fs = require('fs');

/**
 * Usually used in read file functions
 * @const
 */
const ENCODING = 'utf8';

/**
 * Loader name
 * @const
 */
const LOADER_NAME = 'file-replace-loader';

/**
 * Loader replacement conditions
 * These modes have to use in loader options in webpack config.
 * Array indexing helps using this array like enum type during code is writing
 * @const
 * @enum
 */
const LOADER_REPLACEMENT_CONDITIONS = [];
LOADER_REPLACEMENT_CONDITIONS[0] = false; // Equivalent to "never"
LOADER_REPLACEMENT_CONDITIONS[1] = true; // Equivalent to "always"
LOADER_REPLACEMENT_CONDITIONS[2] = 'always';
LOADER_REPLACEMENT_CONDITIONS[3] = 'never';
LOADER_REPLACEMENT_CONDITIONS[4] = 'if-replacement-exists';
LOADER_REPLACEMENT_CONDITIONS[5] = 'if-source-is-empty';

/**
 * Schema for validate loader options
 * @const
 */
const LOADER_OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    condition: {
      enum: LOADER_REPLACEMENT_CONDITIONS,
      default: LOADER_REPLACEMENT_CONDITIONS[4],
      errorMessages: {
        enum: `should be equal to one of the allowed values: [${LOADER_REPLACEMENT_CONDITIONS.join(', ')}]`
      }
    },
    replacement: {
      type: 'string',
    },
    async: {
      type: 'boolean',
      default: true
    }
  },
  additionalProperties: false,
  required: ['replacement'],
  getDefaultOptions() {
    const result = {};
    Object.keys(this.properties).forEach((key) => {
      result[key] = this.properties[key].default;
    });
    return result;
  },
  getProperty(key) {
    return this.properties[key];
  }
};

/**
 * Error types that using in error messages
 * @const
 * @enum
 */
const ERROR_TYPES = [];
ERROR_TYPES[0] = 'Invalid options';
ERROR_TYPES[1] = 'Replacement error';
ERROR_TYPES[2] = 'File reading error';

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
    const property = LOADER_OPTIONS_SCHEMA.getProperty(dataPath);
    const errorMessages = property && property.errorMessages;
    message += `\n  [options.${dataPath}]: ${(errorMessages && errorMessages[error.keyword]) || error.message}`;
  });
  e.name = `\n[${LOADER_NAME}]`;
  e.message = message ? `${ERROR_TYPES[0]} ${message}\n` : e.message;
  return e;
}

/**
 * Wrapped readFileSync
 * @param {String} path Path to file
 * @return {String} File content
 */
function readFileSync(path) {
  return fs.readFileSync(path, { encoding: ENCODING, flag: 'r' });
}

/**
 * Wrapped readFileS
 * @param {String} path Path to file
 * @param {Function} callback
 */
function readFile(path, callback) {
  return fs.readFile(path, ENCODING, (err, content) => {
    err && new Exception({
      title: ERROR_TYPES[2],
      message: err.message
    });
    callback(content);
  });
}

function getOptions(loaderContext) {
  const defaultOptions = LOADER_OPTIONS_SCHEMA.getDefaultOptions();
  const result = Object.assign({}, defaultOptions, loaderUtils.getOptions(loaderContext));
  result.replacement && (result.replacement = path.resolve(loaderContext.context, result.replacement));
  return result;
}

/**
 * File Replace Loader function
 */
module.exports = function(source) {
  const options = getOptions(this);
  const isSync = options && options.async === false;
  const callback = isSync === false && this.async() || null;

  /**
   * Validate loader options before its work
   */
  try {
    validateOptions(LOADER_OPTIONS_SCHEMA, options);
  } catch (e) {
    throw prepareErrorSchemaMessage(e);
  }

  /**
   * If condition is 'always' or true
   */
  if (options.condition === LOADER_REPLACEMENT_CONDITIONS[1] ||
      options.condition === LOADER_REPLACEMENT_CONDITIONS[2]) {
    if (fs.existsSync(options.replacement)) {
      this.addDependency(options.replacement);
      if (isSync) {
        return readFileSync(options.replacement);
      } else {
        readFile(options.replacement, (content) => {
          callback(null, content);
        })
      }
    } else {
      throw new Exception({
        title: ERROR_TYPES[1],
        message: `File (${options.replacement}) doesn't exist but specified in ${LOADER_NAME} options with \n` +
                 `  condition ${LOADER_REPLACEMENT_CONDITIONS[1]} or '${LOADER_REPLACEMENT_CONDITIONS[2]}'. \n` +
                 `  Perhaps this is due replacement isn't full path. Make sure that file exists and replacement\n` +
                 `  option is full path to file`
      });
    }
  }

  /**
   * If condition is 'if-replacement-exists'
   */
  if (options.condition === LOADER_REPLACEMENT_CONDITIONS[4]) {
    if (fs.existsSync(options.replacement)) {
      this.addDependency(options.replacement);
      if (isSync) {
        return readFileSync(options.replacement)
      } else {
        readFile(options.replacement, (content) => {
          callback(null, content);
        })
      }
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
    if (fs.existsSync(this.resourcePath)) {
      const stats = fs.statSync(this.resourcePath);
      if (stats.size === 0) {
        this.addDependency(options.replacement);
        if (isSync) {
          return readFileSync(options.replacement)
        } else {
          readFile(options.replacement, (content) => {
            callback(null, content);
          })
        }
      } else {
        if (isSync) {
          return source;
        } else {
          callback(null, source);
        }
      }
    } else {
      throw new Exception({
        title: ERROR_TYPES[1],
        message: `File (${this.resourcePath}) doesn't exist but specified in sources. ${LOADER_NAME} can't replace\n` +
                 `  it to replacement file by '${LOADER_REPLACEMENT_CONDITIONS[5]}' condition. Make sure that source file exists.`
      });
    }
  }

  /**
   * If condition is 'never' or false
   */
  if (options.condition === LOADER_REPLACEMENT_CONDITIONS[0] ||
    options.condition === LOADER_REPLACEMENT_CONDITIONS[3]) {
    if (isSync) {
      return source;
    } else {
      callback(null, source);
    }
  }
};
