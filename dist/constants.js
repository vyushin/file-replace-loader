"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MAIN_LOADER_FILE = exports.LOADER_REPLACEMENT_CONDITIONS = exports.LOADER_OPTIONS_SCHEMA = exports.LOADER_NAME = exports.IS_PROGRESS_MODE = exports.IS_DEBUG_MODE = exports.HELP_INFO_MESSAGE = exports.ERROR_TYPES = exports.ERROR_MESSAGES = void 0;
var _path = require("path");
var packageJson = _interopRequireWildcard(require("../package.json"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
/**
 * Constants of file replace loader
 * {@link https://github.com/vyushin/file-replace-loader/blob/master/src/constants.js}
 */

/**
 * Loader name
 * @const
 */
var LOADER_NAME = exports.LOADER_NAME = 'file-replace-loader';

/**
 * Main loader file from package.json
 * @const
 */
var MAIN_LOADER_FILE = exports.MAIN_LOADER_FILE = (0, _path.resolve)(__dirname, '../', packageJson.main);

/**
 * True if the build runs with --progress arg
 * @const
 */
var IS_PROGRESS_MODE = exports.IS_PROGRESS_MODE = (process.argv || []).some(function (arg) {
  return arg === '--progress';
});

/**
 * True if the build runs with --debug arg
 * @const
 */
var IS_DEBUG_MODE = exports.IS_DEBUG_MODE = (process.argv || []).some(function (arg) {
  return arg === '--debug';
});

/**
 * Loader replacement conditions
 * These modes have to use in loader options in webpack config.
 * Array indexing helps using this array like enum type during code is writing
 * @const
 * @enum
 */
var LOADER_REPLACEMENT_CONDITIONS = exports.LOADER_REPLACEMENT_CONDITIONS = [];
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
var ERROR_TYPES = exports.ERROR_TYPES = [];
ERROR_TYPES[0] = 'Invalid options';
ERROR_TYPES[1] = 'Replacement error';
ERROR_TYPES[2] = 'File reading error';
ERROR_TYPES[3] = 'Usage error';
var HELP_INFO_MESSAGE = exports.HELP_INFO_MESSAGE = `If you are experiencing difficulties to solve this problem please create an issue on ${packageJson.bugs.url}`;
var ERROR_MESSAGES = exports.ERROR_MESSAGES = [];
ERROR_MESSAGES[0] = `File ($1) doesn't exist but specified in ${LOADER_NAME} options with \n` + `  condition ${LOADER_REPLACEMENT_CONDITIONS[1]} or '${LOADER_REPLACEMENT_CONDITIONS[2]}'. \n` + `  Perhaps this is due replacement isn't full path. Make sure that file exists and replacement\n` + `  option is full path to file.\n` + `  ${HELP_INFO_MESSAGE}`;
ERROR_MESSAGES[1] = `File ($1) doesn't exist but specified in replacement. ${LOADER_NAME} can't replace\n` + `  it by '${LOADER_REPLACEMENT_CONDITIONS[5]}' condition. Make sure that replacement file exists. \n` + `  ${HELP_INFO_MESSAGE}`;
ERROR_MESSAGES[2] = `should be equal to one of the allowed values: [$1]. \n` + `  ${HELP_INFO_MESSAGE}`;
ERROR_MESSAGES[3] = `${LOADER_NAME} must executes before other loaders. Check your Webpack config file.\n` + `  NOTE: Webpack reads loaders from right to left. So ${LOADER_NAME} have to be the last in array of loaders. \n` + `  ${HELP_INFO_MESSAGE}`;
ERROR_MESSAGES[4] = `should be full path to file or function returning full path to file. \n` + `  ${HELP_INFO_MESSAGE}`;

/**
 * Schema for validate loader options
 * @const
 */
var LOADER_OPTIONS_SCHEMA = exports.LOADER_OPTIONS_SCHEMA = {
  title: LOADER_NAME,
  description: `${LOADER_NAME} Webpack JSON Schema options`,
  type: 'object',
  properties: {
    condition: {
      enum: LOADER_REPLACEMENT_CONDITIONS,
      default: LOADER_REPLACEMENT_CONDITIONS[4],
      errorMessages: {
        enum: ERROR_MESSAGES[2].replace('$1', LOADER_REPLACEMENT_CONDITIONS.join(', '))
      }
    },
    replacement: {
      anyOf: [{
        type: 'string'
      }, {
        instanceof: 'Function'
      }],
      errorMessages: {
        anyOf: ERROR_MESSAGES[4]
      }
    },
    async: {
      type: 'boolean',
      default: true
    },
    progress: {
      type: 'boolean',
      default: IS_DEBUG_MODE || IS_PROGRESS_MODE
    }
  },
  additionalProperties: false,
  required: ['replacement']
};