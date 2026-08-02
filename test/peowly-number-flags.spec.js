import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatFlagList, peowly } from '../lib/main.js';

describe('peowly number flags', () => {
  describe('type: number', () => {
    it('should parse a number flag', () => {
      const { flags } = peowly({
        args: ['--count', '5'],
        options: {
          count: { type: 'number', description: 'A count' },
        },
      });

      assert.equal(flags.count, 5);
      assert.equal(typeof flags.count, 'number');
    });

    it('should parse a float value', () => {
      const { flags } = peowly({
        args: ['--ratio', '3.14'],
        options: {
          ratio: { type: 'number', description: 'A ratio' },
        },
      });

      assert.equal(flags.ratio, 3.14);
    });

    it('should parse a negative value using = syntax', () => {
      // parseArgs treats '--offset -42' as ambiguous (looks like short flag '-4 2').
      // Negative numbers must use the '--flag=value' form.
      const { flags } = peowly({
        args: ['--offset=-42'],
        options: {
          offset: { type: 'number', description: 'An offset' },
        },
      });

      assert.equal(flags.offset, -42);
    });

    it('should return undefined when flag is absent and has no default', () => {
      const { flags } = peowly({
        args: [],
        options: {
          count: { type: 'number', description: 'A count' },
        },
      });

      assert.equal(flags.count, undefined);
    });

    it('should apply numeric default when flag is absent', () => {
      const { flags } = peowly({
        args: [],
        options: {
          retries: { type: 'number', 'default': 3, description: 'Retry count' },
        },
      });

      assert.equal(flags.retries, 3);
      assert.equal(typeof flags.retries, 'number');
    });

    it('should apply zero as a numeric default', () => {
      const { flags } = peowly({
        args: [],
        options: {
          timeout: { type: 'number', 'default': 0, description: 'Timeout ms' },
        },
      });

      assert.equal(flags.timeout, 0);
    });

    it('should override numeric default when flag is provided', () => {
      const { flags } = peowly({
        args: ['--retries', '10'],
        options: {
          retries: { type: 'number', 'default': 3, description: 'Retry count' },
        },
      });

      assert.equal(flags.retries, 10);
    });

    it('should throw on non-numeric input', () => {
      assert.throws(() => {
        peowly({
          args: ['--count', 'foo'],
          options: {
            count: { type: 'number', description: 'A count' },
          },
        });
      }, /Flag --count expects a number, got: foo/);
    });
  });

  describe('type: number with multiple: true', () => {
    it('should parse multiple number values', () => {
      const { flags } = peowly({
        args: ['--port', '3000', '--port', '4000'],
        options: {
          port: { type: 'number', multiple: true, description: 'Ports' },
        },
      });

      assert(Array.isArray(flags.port));
      assert.deepEqual(flags.port, [3000, 4000]);
    });

    it('should apply array default when flag is absent', () => {
      const { flags } = peowly({
        args: [],
        options: {
          port: { type: 'number', multiple: true, 'default': [3000, 4000], description: 'Ports' },
        },
      });

      assert.deepEqual(flags.port, [3000, 4000]);
    });

    it('should throw on non-numeric input in multiple mode', () => {
      assert.throws(() => {
        peowly({
          args: ['--port', 'abc'],
          options: {
            port: { type: 'number', multiple: true, description: 'Ports' },
          },
        });
      }, /Flag --port expects a number, got: abc/);
    });
  });

  describe('number defaults in help output', () => {
    it('should display numeric default in flag list', () => {
      const help = formatFlagList(
        { retries: { type: 'number', 'default': 3, description: 'Retry count' } },
        2
      );

      assert.match(help, /\[3\]/);
    });
  });
});
