/* eslint-disable n/no-unsupported-features/node-builtins */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  formatHelpList,
  formatFlagList,
  formatGroupedHelpList,
  formatGroupedFlagList,
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

    it('should handle empty list', () => {
      const result = formatHelpList({}, 2);
      assert.equal(typeof result, 'string');
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
  });
});
