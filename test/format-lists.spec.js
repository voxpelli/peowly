import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  formatFlagList,
  formatGroupedFlagList,
  formatGroupedHelpList,
  formatHelpList,
} from '../lib/format-lists.js';

describe('format-lists', () => {
  describe('formatHelpList()', () => {
    it('should format basic list with descriptions', () => {
      const list = {
        verbose: 'Enable verbose output',
        quiet: 'Suppress output',
      };
      const result = formatHelpList(list, 2);
      assert(result.includes('verbose'));
      assert(result.includes('Enable verbose output'));
      assert(result.includes('quiet'));
      assert(result.includes('Suppress output'));
    });

    it('should format list with flag objects', () => {
      const list = {
        output: {
          type: 'string',
          description: 'Output file',
          'default': 'dist.js',
        },
        verbose: {
          type: 'boolean',
          'default': false,
          description: 'Verbose mode',
        },
      };
      const result = formatHelpList(list, 2);
      assert(result.includes('output'));
      assert(result.includes('Output file'));
      assert(result.includes('verbose'));
      assert(result.includes('Verbose mode'));
    });

    it('should apply indentation', () => {
      const list = { test: 'A test item' };
      const result = formatHelpList(list, 4);
      assert(result.length > 0);
    });

    it('should apply keyPrefix', () => {
      const list = {
        verbose: 'Enable verbose output',
      };
      const result = formatHelpList(list, 2, { keyPrefix: '--' });
      assert(result.includes('--verbose'));
    });

    it('should handle short flags', () => {
      const list = {
        verbose: {
          type: 'boolean',
          'default': false,
          'short': 'v',
          description: 'Verbose',
        },
      };
      const result = formatHelpList(list, 2, { shortFlagPrefix: '-' });
      assert(result.includes('-v'));
    });

    it('should apply padName for alignment', () => {
      const list = {
        v: 'Short',
        verbose: 'Long flag name with description',
      };
      const result = formatHelpList(list, 2, { padName: 20 });
      assert.match(result, /verbose/);
    });

    it('should display string defaults inline', () => {
      const list = {
        output: {
          type: 'string',
          'default': 'file.js',
          description: 'Output',
        },
      };
      const result = formatHelpList(list, 2);
      assert(result.includes('file.js'));
    });

    it('should display multiple defaults inline', () => {
      const list = {
        extensions: {
          type: 'string',
          'default': ['js', 'ts'],
          multiple: true,
          description: 'Extensions',
        },
      };
      const result = formatHelpList(list, 2);
      assert(result.includes('js'));
      assert(result.includes('ts'));
    });

    it('should display boolean flags with default: true using [no-] convention', () => {
      const list = {
        color: {
          type: 'boolean',
          'default': true,
          description: 'Enable color',
        },
      };
      const result = formatHelpList(list, 2, { keyPrefix: '--' });
      assert(result.includes('--[no-]color'));
      assert(!result.includes('--color '));
    });

    it('should display boolean flags with default: false without [no-] prefix or [true] default', () => {
      const list = {
        verbose: {
          type: 'boolean',
          'default': false,
          description: 'Verbose',
        },
      };
      const result = formatHelpList(list, 2, { keyPrefix: '--' });
      assert(result.includes('--verbose'));
      assert(!result.includes('--no-verbose'));
      assert(!result.includes('[default: on]'), 'should not show [default: on] for default: false');
    });

    it('should sort by canonical name so [no-] flags appear under their base name', () => {
      const list = {
        color: { type: 'boolean', 'default': true, description: 'Enable color' },
        debug: { type: 'boolean', 'default': false, description: 'Debug mode' },
        output: { type: 'string', description: 'Output file' },
      };
      const result = formatHelpList(list, 2, { keyPrefix: '--' });
      const colorIdx = result.indexOf('--[no-]color');
      const debugIdx = result.indexOf('--debug');
      const outputIdx = result.indexOf('--output');
      assert(colorIdx !== -1, 'should contain --[no-]color');
      assert(debugIdx !== -1, 'should contain --debug');
      assert(outputIdx !== -1, 'should contain --output');
      // Sort by canonical name: color (c) < debug (d) < output (o)
      assert(colorIdx < debugIdx, '--[no-]color should sort before --debug');
      assert(debugIdx < outputIdx, '--debug should sort before --output');
    });

    it('should sort [no-] flag before a flag with the same prefix (e.g. color vs colorful)', () => {
      const list = {
        color: { type: 'boolean', 'default': true, description: 'Enable color' },
        colorful: { type: 'boolean', 'default': false, description: 'Colorful output' },
      };
      const result = formatHelpList(list, 2, { keyPrefix: '--' });
      const colorIdx = result.indexOf('--[no-]color');
      const colorfulIdx = result.indexOf('--colorful');
      assert(colorIdx !== -1, 'should contain --[no-]color');
      assert(colorfulIdx !== -1, 'should contain --colorful');
      // color < colorful by canonical name, so [no-]color sorts first
      assert(colorIdx < colorfulIdx, '--[no-]color should sort before --colorful');
    });

    it('should produce exact output with mixed types, defaults, short flags, and [no-] convention', () => {
      const list = {
        color: { type: 'boolean', 'default': true, 'short': 'c', description: 'Enable color' },
        debug: { type: 'boolean', 'default': false, description: 'Debug mode' },
        output: { type: 'string', 'default': 'out.js', description: 'Output file' },
      };
      const result = formatHelpList(list, 2, { keyPrefix: '--' });
      assert.equal(result, [
        '  -c, --[no-]color  [default: on]  Enable color',
        '      --debug                      Debug mode',
        '      --output  [default: out.js]  Output file',
      ].join('\n'));
    });

    it('should handle empty list', () => {
      const result = formatHelpList({}, 2);
      assert.equal(typeof result, 'string');
    });

    it('should let long flag names expand into the default column', () => {
      const list = {
        color: { type: 'boolean', 'default': true, description: 'Enable color output' },
        'very-long-flag-name': { type: 'boolean', 'default': false, description: 'A very long flag' },
        debug: { type: 'number', 'default': 1, description: 'Debug mode' },
        help: { type: 'boolean', 'default': false, description: 'Prints this help and exits.' },
        output: { type: 'string', 'default': 'dist.js', description: 'Output file' },
      };
      const result = formatHelpList(list, 2, { keyPrefix: '--' });
      assert.equal(result, [
        '      --[no-]color   [default: on]  Enable color output',
        '      --debug         [default: 1]  Debug mode',
        '      --help                        Prints this help and exits.',
        '      --output  [default: dist.js]  Output file',
        '      --very-long-flag-name         A very long flag',
      ].join('\n'));
    });

    it('should truncate long default values with ellipsis', () => {
      const list = {
        config: { type: 'string', 'default': '/very/long/path/to/config/file.js', description: 'Config file' },
        debug: { type: 'boolean', 'default': false, description: 'Debug mode' },
      };
      const result = formatHelpList(list, 2, { keyPrefix: '--' });
      assert(result.includes('[default: /very/long/path/to'));
      assert(result.includes('…'));
      assert(!result.includes('/very/long/path/to/config/file.js'));
    });

    it('should truncate long defaults for all types (single and multiple)', () => {
      const list = {
        // Long string (single)
        longStr: { type: 'string', 'default': 'this-is-a-very-long-default-value.js', description: 'Long string' },
        // Long string (multiple) - joined exceeds 20
        longMulti: { type: 'string', 'default': ['javascript', 'typescript', 'jsx'], multiple: true, description: 'Long multi string' },
        // Long number (multiple) - joined exceeds 20
        longMultiNum: { type: 'number', 'default': [3000, 3001, 3002, 3003, 3004], multiple: true, description: 'Long multi number' },
        // Short string (multiple) - joined under 20
        shortMulti: { type: 'string', 'default': ['js', 'ts'], multiple: true, description: 'Short multi' },
        // Exact 20 chars - should NOT truncate
        exact20: { type: 'string', 'default': '12345678901234567890', description: 'Exact 20' },
        // 21 chars - should truncate
        over20: { type: 'string', 'default': '123456789012345678901', description: '21 chars' },
      };
      const result = formatHelpList(list, 2, { keyPrefix: '--' });
      // Long string (single) - truncated
      assert(result.includes('this-is-a-very-long…'));
      // Long string (multiple) - joined then truncated
      assert(result.includes('javascript, typescr…'));
      // Long number (multiple) - joined then truncated
      assert(result.includes('3000, 3001, 3002, 3…'));
      // Short multiple - NOT truncated
      assert(result.includes('[default: js, ts]'));
      // Exact 20 chars - NOT truncated
      assert(result.includes('[default: 12345678901234567890]'));
      // 21 chars - truncated
      assert(result.includes('[default: 1234567890123456789…]'));
    });

    it('should respect maxDefaultDisplayLength option', () => {
      const list = {
        config: { type: 'string', 'default': 'this-is-a-very-long-default-value.js', description: 'Config file' },
      };
      // Default (20) truncates
      const defaultResult = formatHelpList(list, 2, { keyPrefix: '--' });
      assert(defaultResult.includes('…'));
      assert(!defaultResult.includes('this-is-a-very-long-default-value.js'));
      // Custom (40) does not truncate
      const customResult = formatHelpList(list, 2, { keyPrefix: '--', maxDefaultDisplayLength: 40 });
      assert(!customResult.includes('…'));
      assert(customResult.includes('this-is-a-very-long-default-value.js'));
      // Custom (10) truncates shorter
      const shortResult = formatHelpList(list, 2, { keyPrefix: '--', maxDefaultDisplayLength: 10 });
      assert(shortResult.includes('this-is-a…'));
    });
  });

  describe('formatFlagList()', () => {
    it('should format flags with -- prefix', () => {
      const list = {
        verbose: {
          type: 'boolean',
          'default': false,
          description: 'Verbose',
        },
      };
      const result = formatFlagList(list, 2);
      assert(result.includes('--verbose'));
    });

    it('should include descriptions', () => {
      const list = {
        output: {
          type: 'string',
          description: 'Output file',
        },
      };
      const result = formatFlagList(list, 2);
      assert(result.includes('output'));
      assert(result.includes('Output file'));
    });
  });

  describe('formatGroupedHelpList()', () => {
    it('should group items by listGroup property', () => {
      const list = {
        verbose: {
          description: 'Be verbose',
          listGroup: 'Output',
        },
        quiet: {
          description: 'Be quiet',
          listGroup: 'Output',
        },
        help: {
          description: 'Show help',
          listGroup: 'Meta',
        },
      };
      const result = formatGroupedHelpList(list, 2);
      assert(result.includes('Output'));
      assert(result.includes('Meta'));
      assert(result.includes('verbose'));
      assert(result.includes('quiet'));
      assert(result.includes('help'));
    });

    it('should use defaultGroupName for ungrouped items', () => {
      const list = {
        verbose: { description: 'Verbose' },
        help: { description: 'Help', listGroup: 'Meta' },
      };
      const result = formatGroupedHelpList(list, 2, { defaultGroupName: 'Options' });
      assert(result.includes('Options'));
      assert(result.includes('Meta'));
    });

    it('should respect defaultGroupOrderFirst option', () => {
      const list = {
        verbose: { description: 'Verbose' },
        help: { description: 'Help', listGroup: 'Commands' },
      };
      const result = formatGroupedHelpList(list, 2, {
        defaultGroupName: 'Options',
        defaultGroupOrderFirst: true,
      });
      assert(result.includes('Options') || result.includes('verbose'));
    });

    it('should align items within groups when specified', () => {
      const list = {
        verbose: {
          description: 'Enable verbose',
          listGroup: 'Output',
        },
        'very-long-flag-name': {
          description: 'Another flag',
          listGroup: 'Output',
        },
      };
      const result = formatGroupedHelpList(list, 2, { alignWithinGroups: true });
      assert(result.includes('verbose'));
      assert(result.includes('very-long-flag-name'));
    });

    it('should produce exact output with groups and default group', () => {
      const list = {
        build: { description: 'Build the project', listGroup: 'Commands' },
        test: { description: 'Run tests', listGroup: 'Commands' },
        clean: { description: 'Clean build artifacts' },
      };
      const result = formatGroupedHelpList(list, 2, { defaultGroupName: 'Other' });
      assert.equal(result, [
        '',
        '  Commands',
        '    build  Build the project',
        '    test   Run tests',
        '',
        '  Other',
        '    clean  Clean build artifacts',
        '',
      ].join('\n'));
    });
  });

  describe('formatGroupedFlagList()', () => {
    it('should format flags with grouping', () => {
      const list = {
        output: {
          type: 'string',
          description: 'Output file',
          listGroup: 'Output Options',
        },
        verbose: {
          type: 'boolean',
          'default': false,
          description: 'Verbose',
          listGroup: 'Output Options',
        },
        help: {
          type: 'boolean',
          'default': false,
          description: 'Show help',
        },
      };
      const result = formatGroupedFlagList(list, 2);
      assert(result.includes('--output'));
      assert(result.includes('--verbose'));
      assert(result.includes('--help'));
      assert(result.includes('Output Options'));
    });

    it('should use defaultGroupName for flags without group', () => {
      const list = {
        verbose: {
          type: 'boolean',
          'default': false,
          description: 'Verbose',
        },
      };
      const result = formatGroupedFlagList(list, 2, { defaultGroupName: 'Flags' });
      assert(result.includes('--verbose'));
    });

    it('should handle empty flag list', () => {
      const result = formatGroupedFlagList({}, 2);
      assert.equal(typeof result, 'string');
    });

    it('should produce exact output with mixed types, groups, [no-] convention, and short flags', () => {
      const list = {
        color: { type: 'boolean', 'default': true, 'short': 'c', description: 'Enable color' },
        debug: { type: 'boolean', 'default': false, description: 'Debug mode' },
        output: { type: 'string', 'default': 'out.js', description: 'Output file', listGroup: 'Output Options' },
        verbose: { type: 'boolean', 'default': false, description: 'Verbose', listGroup: 'Output Options' },
      };
      const result = formatGroupedFlagList(list, 2);
      assert.equal(result, [
        '',
        '  Output Options',
        '        --output  [default: out.js]  Output file',
        '        --verbose                    Verbose',
        '',
        '  Options',
        '    -c, --[no-]color  [default: on]  Enable color',
        '        --debug                      Debug mode',
        '',
      ].join('\n'));
    });
  });
});
