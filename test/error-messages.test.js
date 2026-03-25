const webpack = require('webpack');
const path = require('path');
const os = require('os');
const fs = require('fs');

const LOADER_PATH = require.resolve('file-replace-loader');
const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

/**
 * Runs webpack build and returns stats
 */
function compile(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(stats);
    });
  });
}

/**
 * Creates base webpack config
 * @param {Object} loaderOptions - file-replace-loader options
 * @param {Object} [overrides] - config overrides
 */
function createConfig(loaderOptions, overrides = {}) {
  const outputPath = fs.mkdtempSync(path.join(os.tmpdir(), 'frl-test-'));
  return {
    mode: 'development',
    entry: path.resolve(FIXTURES_DIR, 'source.js'),
    output: {
      filename: 'bundle.js',
      path: outputPath,
    },
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: LOADER_PATH,
          options: loaderOptions,
        }],
      }],
    },
    target: 'node',
    ...overrides,
  };
}

/**
 * Extracts text of all compilation errors
 */
function getErrorMessages(stats) {
  return stats.compilation.errors.map(e => e.message).join('\n');
}

// ============================================================
// ERROR_MESSAGES[0]
// Replacement file does not exist for condition 'always' or true
// ============================================================
describe('ERROR_MESSAGES[0]: missing replacement file (condition: always)', () => {

  test('condition "always" + missing replacement -> returns ERROR_MESSAGES[0] text', async () => {
    const nonExistentFile = '/tmp/frl-test-nonexistent-replacement.js';
    const config = createConfig({
      condition: 'always',
      replacement: nonExistentFile,
      async: false,
    });

    const stats = await compile(config);

    expect(stats.hasErrors()).toBe(true);
    const errors = getErrorMessages(stats);
    expect(errors).toContain("doesn't exist");
    expect(errors).toContain(nonExistentFile);
    expect(errors).toContain("condition");
    expect(errors).toContain("always");
  });

  test('condition true + missing replacement -> returns the same error', async () => {
    const nonExistentFile = '/tmp/frl-test-nonexistent-replacement-2.js';
    const config = createConfig({
      condition: true,
      replacement: nonExistentFile,
      async: false,
    });

    const stats = await compile(config);

    expect(stats.hasErrors()).toBe(true);
    const errors = getErrorMessages(stats);
    expect(errors).toContain("doesn't exist");
    expect(errors).toContain(nonExistentFile);
  });
});

// ============================================================
// ERROR_MESSAGES[1]
// Replacement file does not exist for condition 'if-source-is-empty'
// ============================================================
describe('ERROR_MESSAGES[1]: missing replacement file (condition: if-source-is-empty)', () => {

  test('condition "if-source-is-empty" + missing replacement -> returns ERROR_MESSAGES[1] text', async () => {
    const nonExistentFile = '/tmp/frl-test-nonexistent-replacement-3.js';
    const config = createConfig(
      {
        condition: 'if-source-is-empty',
        replacement: nonExistentFile,
        async: false,
      },
      {
        entry: path.resolve(FIXTURES_DIR, 'empty-source.js'),
      }
    );

    const stats = await compile(config);

    expect(stats.hasErrors()).toBe(true);
    const errors = getErrorMessages(stats);
    expect(errors).toContain("doesn't exist");
    expect(errors).toContain(nonExistentFile);
    expect(errors).toContain('if-source-is-empty');
  });
});

// ============================================================
// ERROR_MESSAGES[3]
// file-replace-loader is not the last one in the loaders chain
// ============================================================
describe('ERROR_MESSAGES[3]: invalid loader order', () => {

  test('file-replace-loader is not the last in use -> returns "must executes before other loaders"', async () => {
    const outputPath = fs.mkdtempSync(path.join(os.tmpdir(), 'frl-test-'));
    const config = {
      mode: 'development',
      entry: path.resolve(FIXTURES_DIR, 'source.js'),
      output: {
        filename: 'bundle.js',
        path: outputPath,
      },
      module: {
        rules: [{
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            // file-replace-loader is not the last one -> should fail
            {
              loader: LOADER_PATH,
              options: {
                condition: 'never',
                replacement: path.resolve(FIXTURES_DIR, 'source.js'),
                async: false,
              },
            },
            // passthrough-loader is on the right (executes first)
            {
              loader: path.resolve(FIXTURES_DIR, 'passthrough-loader.js'),
            },
          ],
        }],
      },
      target: 'node',
    };

    const stats = await compile(config);

    expect(stats.hasErrors()).toBe(true);
    const errors = getErrorMessages(stats);
    expect(errors).toContain('must executes before other loaders');
    expect(errors).toContain('right to left');
  });
});

// ============================================================
// ERROR_MESSAGES[2] and [4]: schema validation
// In webpack 5 validation goes through getOptions() (schema-utils v3),
// error texts are from webpack, not from loader.
// Verify that compilation fails with a validation error.
// ============================================================
describe('Options validation (schema validation)', () => {

  test('invalid condition -> compilation fails with an error', async () => {
    const config = createConfig({
      condition: 'invalid-condition-value',
      replacement: path.resolve(FIXTURES_DIR, 'source.js'),
      async: false,
    });

    const stats = await compile(config);

    expect(stats.hasErrors()).toBe(true);
    const errors = getErrorMessages(stats);
    expect(errors).toMatch(/condition/i);
  });

  test('replacement is neither string nor function -> compilation fails with an error', async () => {
    const config = createConfig({
      condition: 'always',
      replacement: 12345,
      async: false,
    });

    const stats = await compile(config);

    expect(stats.hasErrors()).toBe(true);
    const errors = getErrorMessages(stats);
    expect(errors).toMatch(/replacement/i);
  });

  test('unknown option -> compilation fails with an error', async () => {
    const config = createConfig({
      replacement: path.resolve(FIXTURES_DIR, 'source.js'),
      unknownOption: true,
      async: false,
    });

    const stats = await compile(config);

    expect(stats.hasErrors()).toBe(true);
  });
});
