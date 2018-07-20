/**
 * Constants of file replace loader
 * {@link https://github.com/vyushin/file-replace-loader/blob/master/src/constants.js}
 */

import { resolve } from 'path';
import * as packageJson from '../package.json';

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
 * Main loader file from package.json
 * @const
 */
const MAIN_LOADER_FILE = resolve(__dirname, '../', packageJson.main);

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
 * Error types that using in error messages
 * @const
 * @enum
 */
const ERROR_TYPES = [];
ERROR_TYPES[0] = 'Invalid options';
ERROR_TYPES[1] = 'Replacement error';
ERROR_TYPES[2] = 'File reading error';
ERROR_TYPES[3] = 'Usage error';

const ERROR_MESSAGES = [];
ERROR_MESSAGES[0] = `File ($1) doesn't exist but specified in ${LOADER_NAME} options with \n` +
  `  condition ${LOADER_REPLACEMENT_CONDITIONS[1]} or '${LOADER_REPLACEMENT_CONDITIONS[2]}'. \n` +
  `  Perhaps this is due replacement isn't full path. Make sure that file exists and replacement\n` +
  `  option is full path to file.\n` +
  `  If you are experiencing difficulties to solve this problem, you can create an issue on ${packageJson.bugs.url}`;

ERROR_MESSAGES[1] = `File ($1) doesn't exist but specified in replacement. ${LOADER_NAME} can't replace\n` +
  `  it by '${LOADER_REPLACEMENT_CONDITIONS[5]}' condition. Make sure that replacement file exists. \n` +
  `  If you are experiencing difficulties to solve this problem, you can create an issue on ${packageJson.bugs.url}`;

ERROR_MESSAGES[2] = `should be equal to one of the allowed values: [$1]. \n` +
  `  If you are experiencing difficulties to solve this problem, you can create an issue on ${packageJson.bugs.url}`;

ERROR_MESSAGES[3] = `${LOADER_NAME} must executes before other loaders. Check your Webpack config file.\n` +
  `  NOTE: Webpack reads loaders from right to left. So ${LOADER_NAME} have to be the last in array of loaders. \n` +
  `  If you are experiencing difficulties to solve this problem, you can create an issue on ${packageJson.bugs.url}`;

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
        enum: ERROR_MESSAGES[2].replace('$1', LOADER_REPLACEMENT_CONDITIONS.join(', ')),
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
};

/**
 * True if the build runs with --progress arg
 * @const
 */
const IS_PROGRESS_MODE = (process.argv || []).some(arg => arg === '--progress');

/**
 * True if the build runs with --debug arg
 * @const
 */
const IS_DEBUG_MODE = (process.argv || []).some(arg => arg === '--debug');

export {
  ENCODING,
  LOADER_NAME,
  MAIN_LOADER_FILE,
  LOADER_REPLACEMENT_CONDITIONS,
  LOADER_OPTIONS_SCHEMA,
  ERROR_TYPES,
  ERROR_MESSAGES,
  IS_PROGRESS_MODE,
  IS_DEBUG_MODE,
}