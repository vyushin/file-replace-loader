/**
 * Constants of file replace loader
 * {@link https://github.com/vyushin/file-replace-loader/blob/master/constants.js}
 */

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

const ERROR_MESSAGES = [];
ERROR_MESSAGES[0] = `File ($1) doesn't exist but specified in ${LOADER_NAME} options with \n` +
  `  condition ${LOADER_REPLACEMENT_CONDITIONS[1]} or '${LOADER_REPLACEMENT_CONDITIONS[2]}'. \n` +
  `  Perhaps this is due replacement isn't full path. Make sure that file exists and replacement\n` +
  `  option is full path to file`;
ERROR_MESSAGES[1] = `File ($1) doesn't exist but specified in replacement. ${LOADER_NAME} can't replace\n` +
  `  it by '${LOADER_REPLACEMENT_CONDITIONS[5]}' condition. Make sure that replacement file exists.`;


exports.ENCODING = ENCODING;
exports.LOADER_NAME = LOADER_NAME;
exports.LOADER_REPLACEMENT_CONDITIONS = LOADER_REPLACEMENT_CONDITIONS;
exports.LOADER_OPTIONS_SCHEMA = LOADER_OPTIONS_SCHEMA;
exports.ERROR_TYPES = ERROR_TYPES;
exports.ERROR_MESSAGES = ERROR_MESSAGES;