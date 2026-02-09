/* eslint-disable n/no-unsupported-features/node-builtins */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { formatHelpMessage, defaultFlags } from '../lib/main.js';

describe('format-help', () => {
  describe('formatHelpMessage()', () => {
    it('should generate basic help with name and flags', () => {
      const result = formatHelpMessage('test-cli', {
        flags: {
          output: {
            type: 'string',
            description: 'Output file',
          },
        },
      });
      assert(result.includes('test-cli'));
      assert(result.includes('output'));
    });

    it('should include usage string', () => {
      const result = formatHelpMessage('test-cli', {
        usage: '<input> [output]',
        flags: {},
      });
      assert(result.includes('<input> [output]'));
    });

    it('should include examples', () => {
      const result = formatHelpMessage('test-cli', {
        flags: {},
        usage: 'Test usage',
        examples: ['example 1', 'example 2'],
      });
      assert(result.includes('example 1'));
    });

    it('should format with all options', () => {
      const result = formatHelpMessage('test-cli', {
        flags: {},
        usage: 'Test usage',
        examples: ['test'],
      });
      assert(typeof result === 'string');
    });

    it('should include multiple examples', () => {
      const result = formatHelpMessage('test-cli', {
        flags: {},
        examples: ['test-cli file.js', 'test-cli --help'],
      });
      assert(result.includes('test-cli file.js'));
      assert(result.includes('test-cli --help'));
    });

    it('should include commands', () => {
      const result = formatHelpMessage('test-cli', {
        flags: {},
        commands: {
          build: { description: 'Build the project' },
          test: { description: 'Run tests' },
        },
      });
      assert(result.includes('build'));
      assert(result.includes('Build the project'));
      assert(result.includes('test'));
      assert(result.includes('Run tests'));
    });

    it('should include aliases', () => {
      const result = formatHelpMessage('test-cli', {
        flags: {},
        aliases: {
          b: { description: 'Alias for build' },
        },
      });
      assert(result.includes('b'));
      assert(result.includes('Alias for build'));
    });

    it('should include default flags by default', () => {
      const result = formatHelpMessage('test-cli', {
        flags: {},
      });
      assert(result.includes('--help'));
      assert(result.includes('--version'));
    });

    it('should exclude default flags when noDefaultFlags is true', () => {
      const result = formatHelpMessage('test-cli', {
        flags: {},
        noDefaultFlags: true,
      });
      assert(!result.includes('--help') && !result.includes('--version'));
    });

    it('should respect indent option', () => {
      const resultSmall = formatHelpMessage('test', {
        indent: 0,
        flags: {},
      });
      const resultLarge = formatHelpMessage('test', {
        indent: 6,
        flags: {},
      });
      assert.equal(typeof resultSmall, 'string');
      assert.equal(typeof resultLarge, 'string');
    });

    it('should include flag descriptions', () => {
      const result = formatHelpMessage('test-cli', {
        flags: {
          verbose: {
            type: 'boolean',
            'default': false,
            description: 'Enable verbose output',
          },
          output: {
            type: 'string',
            description: 'Output file path',
          },
        },
      });
      assert(result.includes('Enable verbose output'));
      assert(result.includes('Output file path'));
    });

    it('should handle grouped flags', () => {
      const result = formatHelpMessage('test-cli', {
        flags: {
          output: {
            type: 'string',
            description: 'Output file',
            listGroup: 'Output Options',
          },
          verbose: {
            type: 'boolean',
            'default': false,
            description: 'Verbose mode',
            listGroup: 'Output Options',
          },
        },
      });
      assert(result.includes('Output Options'));
    });

    it('should handle aliases with groups', () => {
      const result = formatHelpMessage('test-cli', {
        flags: {},
        aliases: {
          h: { description: 'Help' },
          v: { description: 'Version', listGroup: 'Meta' },
        },
      });
      assert(result.includes('h'));
      assert(result.includes('Help'));
    });
  });

  describe('defaultFlags', () => {
    it('should export help flag', () => {
      assert(defaultFlags.help);
      assert.equal(defaultFlags.help.type, 'boolean');
      assert.equal(defaultFlags.help['default'], false);
      assert(defaultFlags.help.description.length > 0);
    });

    it('should export version flag', () => {
      assert(defaultFlags.version);
      assert.equal(defaultFlags.version.type, 'boolean');
      assert.equal(defaultFlags.version['default'], false);
      assert(defaultFlags.version.description.length > 0);
    });
  });
});
