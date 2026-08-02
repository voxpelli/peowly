/* eslint-disable n/no-unsupported-features/node-builtins */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { peowly, formatGroupedFlagList } from '../lib/main.js';

describe('peowly long-form aliases', () => {
  describe('basic alias rewriting', () => {
    it('should remap a long-form alias to its canonical flag', () => {
      const { flags } = peowly({
        args: ['--colors'],
        options: {
          color: { type: 'boolean', 'default': false, description: 'Enable color', aliases: ['colors'] },
        },
      });

      assert.equal(flags.color, true);
    });

    it('should remap multiple aliases for the same flag', () => {
      const { flags: flags1 } = peowly({
        args: ['--colours'],
        options: {
          color: { type: 'boolean', 'default': false, description: 'Enable color', aliases: ['colors', 'colours'] },
        },
      });
      assert.equal(flags1.color, true);

      const { flags: flags2 } = peowly({
        args: ['--colors'],
        options: {
          color: { type: 'boolean', 'default': false, description: 'Enable color', aliases: ['colors', 'colours'] },
        },
      });
      assert.equal(flags2.color, true);
    });

    it('should remap a string alias with separate value token', () => {
      const { flags } = peowly({
        args: ['--timeouts', '5000'],
        options: {
          timeout: { type: 'string', description: 'Timeout ms', aliases: ['timeouts'] },
        },
      });

      assert.equal(flags.timeout, '5000');
    });

    it('should remap a string alias with = syntax', () => {
      const { flags } = peowly({
        args: ['--timeouts=5000'],
        options: {
          timeout: { type: 'string', description: 'Timeout ms', aliases: ['timeouts'] },
        },
      });

      assert.equal(flags.timeout, '5000');
    });

    it('should remap a number alias', () => {
      const { flags } = peowly({
        args: ['--retries', '3'],
        options: {
          retry: { type: 'number', description: 'Retry count', aliases: ['retries'] },
        },
      });

      assert.equal(flags.retry, 3);
    });

    it('should not affect non-aliased args', () => {
      const { flags } = peowly({
        args: ['--verbose', '--output', 'out.js'],
        options: {
          verbose: { type: 'boolean', 'default': false, description: 'Verbose' },
          output: { type: 'string', description: 'Output file', aliases: ['out'] },
        },
      });

      assert.equal(flags.verbose, true);
      assert.equal(flags.output, 'out.js');
    });
  });

  describe('collision detection', () => {
    it('should throw when alias conflicts with an existing flag name', () => {
      assert.throws(() => {
        peowly({
          args: [],
          options: {
            color: { type: 'boolean', 'default': false, description: 'Color', aliases: ['verbose'] },
            verbose: { type: 'boolean', 'default': false, description: 'Verbose' },
          },
        });
      }, /conflicts with existing flag/);
    });

    it('should throw when the same alias is claimed by two flags', () => {
      assert.throws(() => {
        peowly({
          args: [],
          options: {
            color: { type: 'boolean', 'default': false, description: 'Color', aliases: ['colours'] },
            hue: { type: 'boolean', 'default': false, description: 'Hue', aliases: ['colours'] },
          },
        });
      }, /already claimed/);
    });
  });

  describe('showAliasInHelp', () => {
    it('should not show aliases in help by default', () => {
      const help = formatGroupedFlagList(
        { color: { type: 'boolean', 'default': false, description: 'Enable color', aliases: ['colors'] } },
        2
      );

      assert.doesNotMatch(help, /\[alias/);
    });

    it('should show alias annotation when showAliasInHelp is true', () => {
      const help = formatGroupedFlagList(
        { color: { type: 'boolean', 'default': false, description: 'Enable color', aliases: ['colors'], showAliasInHelp: true } },
        2
      );

      assert.match(help, /\[alias: --colors\]/);
    });

    it('should use plural label for multiple aliases', () => {
      const help = formatGroupedFlagList(
        { color: { type: 'boolean', 'default': false, description: 'Enable color', aliases: ['colors', 'colours'], showAliasInHelp: true } },
        2
      );

      assert.match(help, /\[aliases: --colors, --colours\]/);
    });
  });
});
