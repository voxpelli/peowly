import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { peowly, unparseFlags } from '../lib/main.js';

describe('unparseFlags', () => {
  describe('basic flag types', () => {
    it('should emit --name for a true boolean flag', () => {
      const result = unparseFlags(
        { verbose: true },
        { verbose: { type: 'boolean', description: 'Verbose' } }
      );
      assert.deepEqual(result, ['--verbose']);
    });

    it('should emit --no-name for a false boolean flag', () => {
      const result = unparseFlags(
        { verbose: false },
        { verbose: { type: 'boolean', description: 'Verbose' } }
      );
      assert.deepEqual(result, ['--no-verbose']);
    });

    it('should emit --name value for a string flag', () => {
      const result = unparseFlags(
        { output: 'out.js' },
        { output: { type: 'string', description: 'Output file' } }
      );
      assert.deepEqual(result, ['--output', 'out.js']);
    });

    it('should emit --name value for a number flag', () => {
      const result = unparseFlags(
        { retries: 3 },
        { retries: { type: 'number', description: 'Retry count' } }
      );
      assert.deepEqual(result, ['--retries', '3']);
    });

    it('should emit --name=-5 for a negative number', () => {
      const result = unparseFlags(
        { retries: -5 },
        { retries: { type: 'number', description: 'Retry count' } }
      );
      assert.deepEqual(result, ['--retries=-5']);
    });

    it('should omit undefined flags', () => {
      const result = unparseFlags(
        { output: undefined },
        { output: { type: 'string', description: 'Output file' } }
      );
      assert.deepEqual(result, []);
    });
  });

  describe('multiple flags', () => {
    it('should emit one --name value pair per element for multiple string flags', () => {
      const result = unparseFlags(
        { ext: ['js', 'ts'] },
        { ext: { type: 'string', multiple: true, description: 'Extensions' } }
      );
      assert.deepEqual(result, ['--ext', 'js', '--ext', 'ts']);
    });

    it('should emit one --name value pair per element for multiple number flags', () => {
      const result = unparseFlags(
        { port: [3000, 4000] },
        { port: { type: 'number', multiple: true, description: 'Ports' } }
      );
      assert.deepEqual(result, ['--port', '3000', '--port', '4000']);
    });

    it('should emit nothing for an empty multiple array', () => {
      const result = unparseFlags(
        { ext: [] },
        { ext: { type: 'string', multiple: true, description: 'Extensions' } }
      );
      assert.deepEqual(result, []);
    });
  });

  describe('mixed flags', () => {
    it('should handle a mix of flag types', () => {
      const result = unparseFlags(
        { verbose: true, output: 'out.js', count: 2, debug: false },
        {
          verbose: { type: 'boolean', description: 'Verbose' },
          output: { type: 'string', description: 'Output' },
          count: { type: 'number', description: 'Count' },
          debug: { type: 'boolean', description: 'Debug' },
        }
      );
      assert.deepEqual(result, ['--verbose', '--output', 'out.js', '--count', '2', '--no-debug']);
    });
  });

  describe('round-trip with peowly', () => {
    it('should round-trip a true boolean flag', () => {
      const flagDefs = /** @type {const} */ ({
        verbose: { type: 'boolean', 'default': false, description: 'Verbose' },
      });

      const { flags: parsed } = peowly({
        args: ['--verbose'],
        options: flagDefs,
      });
      assert.equal(parsed['verbose'], true);

      const argv = unparseFlags(parsed, flagDefs);
      const { flags: reparsed } = peowly({ args: argv, options: flagDefs });
      assert.equal(reparsed['verbose'], true);
    });

    it('should round-trip a false boolean flag with default: true', () => {
      const flagDefs = /** @type {const} */ ({
        verbose: { type: 'boolean', 'default': true, description: 'Verbose' },
      });

      const { flags: parsed } = peowly({
        args: ['--no-verbose'],
        options: flagDefs,
      });
      assert.equal(parsed['verbose'], false);

      const argv = unparseFlags(parsed, flagDefs);
      const { flags: reparsed } = peowly({ args: argv, options: flagDefs });
      assert.equal(reparsed['verbose'], false);
    });

    it('should round-trip a false boolean flag without a default', () => {
      const flagDefs = /** @type {const} */ ({
        verbose: { type: 'boolean', description: 'Verbose' },
      });

      const { flags: parsed } = peowly({
        args: ['--no-verbose'],
        options: flagDefs,
      });
      assert.equal(parsed.verbose, false);

      const argv = unparseFlags(parsed, flagDefs);
      const { flags: reparsed } = peowly({ args: argv, options: flagDefs });
      assert.equal(reparsed.verbose, false);
    });

    it('should round-trip an absent boolean with default: true', () => {
      const flagDefs = /** @type {const} */ ({
        verbose: { type: 'boolean', 'default': true, description: 'Verbose' },
      });

      const { flags: parsed } = peowly({ args: [], options: flagDefs });
      assert.equal(parsed['verbose'], true);

      const argv = unparseFlags(parsed, flagDefs);
      const { flags: reparsed } = peowly({ args: argv, options: flagDefs });
      assert.equal(reparsed['verbose'], true);
    });

    it('should round-trip an absent boolean with default: false', () => {
      const flagDefs = /** @type {const} */ ({
        verbose: { type: 'boolean', 'default': false, description: 'Verbose' },
      });

      const { flags: parsed } = peowly({ args: [], options: flagDefs });
      assert.equal(parsed['verbose'], false);

      const argv = unparseFlags(parsed, flagDefs);
      const { flags: reparsed } = peowly({ args: argv, options: flagDefs });
      assert.equal(reparsed['verbose'], false);
    });

    it('should round-trip a string flag with a default', () => {
      const flagDefs = /** @type {const} */ ({
        output: { type: 'string', 'default': 'out.js', description: 'Output' },
      });

      const { flags: parsed } = peowly({ args: [], options: flagDefs });
      assert.equal(parsed.output, 'out.js');

      const argv = unparseFlags(parsed, flagDefs);
      const { flags: reparsed } = peowly({ args: argv, options: flagDefs });
      assert.equal(reparsed.output, 'out.js');
    });

    it('should round-trip a number flag with a default', () => {
      const flagDefs = /** @type {const} */ ({
        retries: { type: 'number', 'default': 3, description: 'Retries' },
      });

      const { flags: parsed } = peowly({ args: [], options: flagDefs });
      assert.equal(parsed.retries, 3);

      const argv = unparseFlags(parsed, flagDefs);
      const { flags: reparsed } = peowly({ args: argv, options: flagDefs });
      assert.equal(reparsed.retries, 3);
    });

    it('should round-trip a negative scalar number', () => {
      const flagDefs = /** @type {const} */ ({
        offset: { type: 'number', description: 'An offset' },
      });

      const { flags: parsed } = peowly({
        args: ['--offset=-42'],
        options: flagDefs,
      });
      assert.equal(parsed.offset, -42);

      const argv = unparseFlags(parsed, flagDefs);
      assert.deepEqual(argv, ['--offset=-42']);

      const { flags: reparsed } = peowly({ args: argv, options: flagDefs });
      assert.equal(reparsed.offset, -42);
    });

    it('should round-trip a negative number in multiple mode', () => {
      const flagDefs = /** @type {const} */ ({
        offset: { type: 'number', multiple: true, description: 'Offsets' },
      });

      const { flags: parsed } = peowly({
        args: ['--offset=-5', '--offset', '10'],
        options: flagDefs,
      });
      assert.deepEqual(parsed.offset, [-5, 10]);

      const argv = unparseFlags(parsed, flagDefs);
      assert.deepEqual(argv, ['--offset=-5', '--offset', '10']);

      const { flags: reparsed } = peowly({ args: argv, options: flagDefs });
      assert.deepEqual(reparsed.offset, [-5, 10]);
    });

    it('should round-trip a mix of flag types', () => {
      const flagDefs = /** @type {const} */ ({
        verbose: { type: 'boolean', 'default': true, description: 'Verbose' },
        output: { type: 'string', 'default': 'out.js', description: 'Output' },
        retries: { type: 'number', 'default': 3, description: 'Retries' },
      });

      const { flags: parsed } = peowly({
        args: ['--no-verbose', '--output', 'dist.js', '--retries', '5'],
        options: flagDefs,
      });

      assert.equal(parsed['verbose'], false);
      assert.equal(parsed['output'], 'dist.js');
      assert.equal(parsed['retries'], 5);

      const argv = unparseFlags(parsed, flagDefs);

      const { flags: reparsed } = peowly({ args: argv, options: flagDefs });

      assert.equal(reparsed['verbose'], false);
      assert.equal(reparsed['output'], 'dist.js');
      assert.equal(reparsed['retries'], 5);
    });

    it('should round-trip multiple flags', () => {
      const flagDefs = /** @type {const} */ ({
        ext: { type: 'string', multiple: /** @type {const} */ (true), description: 'Extensions' },
        port: { type: 'number', multiple: /** @type {const} */ (true), description: 'Ports' },
      });

      const { flags: parsed } = peowly({
        args: ['--ext', 'js', '--ext', 'ts', '--port', '3000', '--port', '4000'],
        options: flagDefs,
      });

      const argv = unparseFlags(parsed, flagDefs);

      const { flags: reparsed } = peowly({
        args: argv,
        options: flagDefs,
      });

      assert.deepEqual(reparsed.ext, parsed.ext);
      assert.deepEqual(reparsed.port, parsed.port);
    });
  });
});
