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

  describe('end-of-options delimiter (--)', () => {
    it('should not rewrite aliases after -- delimiter', () => {
      const { flags, input } = peowly({
        args: ['--colors', '--', '--colors'],
        options: {
          color: { type: 'boolean', 'default': false, description: 'Enable color', aliases: ['colors'] },
        },
      });

      assert.equal(flags.color, true);
      assert.deepEqual(input, ['--colors']);
    });

    it('should preserve -- itself in positionals', () => {
      const { flags, input } = peowly({
        args: ['--', '--colors'],
        options: {
          color: { type: 'boolean', 'default': false, description: 'Enable color', aliases: ['colors'] },
        },
      });

      assert.equal(flags.color, false);
      assert.deepEqual(input, ['--colors']);
    });

    it('should not affect alias rewriting before --', () => {
      const { flags, input } = peowly({
        args: ['--colors', '--', 'file.txt'],
        options: {
          color: { type: 'boolean', 'default': false, description: 'Enable color', aliases: ['colors'] },
        },
      });

      assert.equal(flags.color, true);
      assert.deepEqual(input, ['file.txt']);
    });

    it('should handle = syntax after -- delimiter', () => {
      const { flags, input } = peowly({
        args: ['--', '--colors=always'],
        options: {
          color: { type: 'string', description: 'Color mode', aliases: ['colors'] },
        },
      });

      assert.equal(flags.color, undefined);
      assert.deepEqual(input, ['--colors=always']);
    });
  });

  describe('--no- prefix with allowNegative', () => {
    it('should handle --no- prefix for aliases', () => {
      const { flags } = peowly({
        args: ['--no-colors'],
        options: {
          color: { type: 'boolean', 'default': true, description: 'Enable color', aliases: ['colors'] },
        },
      });

      assert.equal(flags['color'], false);
    });

    it('should handle --no- prefix for canonical flags', () => {
      const { flags } = peowly({
        args: ['--no-color'],
        options: {
          color: { type: 'boolean', 'default': true, description: 'Enable color' },
        },
      });

      assert.equal(flags['color'], false);
    });
  });
});
