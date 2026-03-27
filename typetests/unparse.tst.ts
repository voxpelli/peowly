import { describe, expect, it } from 'tstyche';

import { peowly, unparseFlags } from '../index.js';

describe('type: unparseFlags', () => {
  it('returns string[]', () => {
    const result = unparseFlags(
      { verbose: true },
      { verbose: { type: 'boolean' as const, description: 'Verbose' } }
    );

    expect(result).type.toBe<string[]>();
  });

  it('accepts typed flags from peowly result', () => {
    const flagDefs = {
      verbose: { type: 'boolean' as const, description: 'Verbose' },
      output: { type: 'string' as const, description: 'Output' },
      retries: { type: 'number' as const, description: 'Retries' },
    };

    const { flags } = peowly({ args: [], options: flagDefs });

    expect(unparseFlags(flags, flagDefs)).type.toBe<string[]>();
  });
});
