/* eslint-disable n/no-unsupported-features/node-builtins */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { peowly } from '../lib/main.js';

describe('peowly', () => {
  describe('peowly()', () => {
    it('should parse basic boolean flags', () => {
      const { flags } = peowly({
        args: ['--verbose'],
        options: {
          verbose: {
            type: 'boolean',
            'default': false,
            description: 'Enable verbose mode',
          },
        },
      });

      assert.deepEqual(flags, { verbose: true });
    });

    it('should parse string flags', () => {
      const { flags } = peowly({
        args: ['--output', 'dist.js'],
        options: {
          output: {
            type: 'string',
            description: 'Output file',
          },
        },
      });

      assert.equal(flags.output, 'dist.js');
    });

    it('should apply default values', () => {
      const { flags } = peowly({
        args: [],
        options: {
          verbose: {
            type: 'boolean',
            'default': false,
            description: 'Verbose',
          },
          output: {
            type: 'string',
            'default': 'out.js',
            description: 'Output file',
          },
        },
      });

      assert.equal(flags.verbose, false);
      assert.equal(flags.output, 'out.js');
    });

    it('should handle multiple flag values', () => {
      const { flags } = peowly({
        args: ['--ext', 'js', '--ext', 'ts'],
        options: {
          ext: {
            type: 'string',
            multiple: true,
            description: 'Extensions',
          },
        },
      });

      assert(Array.isArray(flags.ext));
      assert.deepEqual(flags.ext, ['js', 'ts']);
    });

    it('should parse positional arguments', () => {
      const { input } = peowly({
        args: ['file.js', '--verbose'],
        options: {
          verbose: {
            type: 'boolean',
            'default': false,
            description: 'Verbose',
          },
        },
      });

      assert.deepEqual(input, ['file.js']);
    });

    it('should exclude help flag from flags result', () => {
      const { flags } = peowly({
        args: ['--verbose'],
        options: {
          verbose: {
            type: 'boolean',
            'default': false,
            description: 'Verbose',
          },
        },
      });

      assert(!('help' in flags));
    });

    it('should exclude version flag from flags result', () => {
      const { flags } = peowly({
        args: ['--verbose'],
        options: {
          verbose: {
            type: 'boolean',
            'default': false,
            description: 'Verbose',
          },
        },
      });

      assert(!('version' in flags));
    });

    it('should return showHelp function', () => {
      const { showHelp } = peowly({
        args: [],
        options: {},
      });

      assert.equal(typeof showHelp, 'function');
    });

    it('should return remainder args when returnRemainderArgs is true', () => {
      const { remainderArgs } = peowly({
        args: ['--verbose', 'unknown', '--unknown-flag', 'file.js'],
        options: {
          verbose: {
            type: 'boolean',
            'default': false,
            description: 'Verbose',
          },
        },
        returnRemainderArgs: true,
      });

      assert(Array.isArray(remainderArgs));
      assert(remainderArgs.includes('unknown'));
      assert(remainderArgs.includes('--unknown-flag'));
    });

    it('should use pkg.name for default name when bin is string', () => {
      const originalTitle = process.title;

      try {
        const { flags } = peowly({
          args: [],
          pkg: { bin: 'my-tool', name: 'my-package' },
          options: {},
        });

        assert(typeof flags === 'object');
        assert.equal(process.title, 'my-package');
      } finally {
        process.title = originalTitle;
      }
    });

    it('should derive name from pkg.bin object', () => {
      const originalTitle = process.title;

      try {
        const { flags } = peowly({
          args: [],
          pkg: { bin: { 'my-tool': 'lib/cli.js', 'other-tool': 'lib/other.js' } },
          options: {},
        });

        assert(typeof flags === 'object');
        assert.equal(process.title, 'my-tool');
      } finally {
        process.title = originalTitle;
      }
    });

    it('should auto-generate help text using formatHelpMessage', () => {
      const { showHelp } = peowly({
        args: [],
        name: 'test-cli',
        options: {
          verbose: {
            type: 'boolean',
            'default': false,
            description: 'Verbose mode',
          },
        },
      });

      assert(typeof showHelp === 'function');
    });

    it('should parse short flags', () => {
      const { flags } = peowly({
        args: ['-v'],
        options: {
          verbose: {
            type: 'boolean',
            'default': false,
            'short': 'v',
            description: 'Verbose',
          },
        },
      });

      assert.equal(flags.verbose, true);
    });

    it('should handle combined short flags', () => {
      const { flags } = peowly({
        args: ['-vq'],
        options: {
          verbose: {
            type: 'boolean',
            'default': false,
            'short': 'v',
            description: 'Verbose',
          },
          quiet: {
            type: 'boolean',
            'default': false,
            'short': 'q',
            description: 'Quiet',
          },
        },
      });

      assert.equal(flags.verbose, true);
      assert.equal(flags.quiet, true);
    });

    it('should handle absence of flags', () => {
      const { flags, input } = peowly({
        args: ['file.js'],
        options: {
          verbose: {
            type: 'boolean',
            'default': false,
            description: 'Verbose',
          },
        },
      });

      assert.deepEqual(input, ['file.js']);
      assert(!('verbose' in flags) || flags.verbose === false);
    });

    it('should filter out undefined values from remainder args', () => {
      const { remainderArgs } = peowly({
        args: ['--verbose', 'file.js'],
        options: {
          verbose: {
            type: 'boolean',
            'default': false,
            description: 'Verbose',
          },
        },
        returnRemainderArgs: true,
      });

      assert.deepEqual(remainderArgs, ['file.js']);
    });
  });
});
