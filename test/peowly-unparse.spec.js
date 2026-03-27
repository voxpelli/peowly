/* eslint-disable n/no-unsupported-features/node-builtins */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

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

    it('should omit a false boolean flag', () => {
      const result = unparseFlags(
        { verbose: false },
        { verbose: { type: 'boolean', description: 'Verbose' } }
      );
      assert.deepEqual(result, []);
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
      assert.deepEqual(result, ['--verbose', '--output', 'out.js', '--count', '2']);
    });
  });

  describe('round-trip with peowly', () => {
    it('should round-trip a parsed flags object back to argv and re-parse identically', () => {
      const flagDefs = {
        verbose: { type: /** @type {const} */ ('boolean'), description: 'Verbose' },
        output: { type: /** @type {const} */ ('string'), description: 'Output' },
        retries: { type: /** @type {const} */ ('number'), description: 'Retries' },
      };

      const { flags: parsed } = peowly({
        args: ['--verbose', '--output', 'out.js', '--retries', '3'],
        options: flagDefs,
      });

      const argv = unparseFlags(parsed, flagDefs);

      const { flags: reparsed } = peowly({
        args: argv,
        options: flagDefs,
      });

      assert.equal(reparsed.verbose, parsed.verbose);
      assert.equal(reparsed.output, parsed.output);
      assert.equal(reparsed.retries, parsed.retries);
    });

    it('should round-trip multiple flags', () => {
      const flagDefs = {
        ext: { type: /** @type {const} */ ('string'), multiple: /** @type {const} */ (true), description: 'Extensions' },
        port: { type: /** @type {const} */ ('number'), multiple: /** @type {const} */ (true), description: 'Ports' },
      };

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
