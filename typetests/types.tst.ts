import { describe, expect, it } from 'tstyche';

import type { AnyFlag, AnyFlags, TypedFlags } from '../index.js';

describe('Type Exports', () => {
  it('should export AnyFlag type', () => {
    const flag: AnyFlag = {
      type: 'string',
      description: 'A test flag',
    };

    expect(flag).type.toBeAssignableTo<AnyFlag>();
  });

  it('should export AnyFlags type', () => {
    const flags: AnyFlags = {
      input: {
        type: 'string',
        description: 'Input file',
      },
      output: {
        type: 'string',
        'default': 'output.js',
        description: 'Output file',
      },
      verbose: {
        type: 'boolean',
        'default': false,
        description: 'Enable verbose output',
      },
    };

    expect(flags).type.toBeAssignableTo<AnyFlags>();
  });

  it('should have correct TypedFlags type utility', () => {
    type TestFlags = {
      name: { type: 'string'; description: string };
      count: { type: 'boolean'; 'default': false; description: string };
    };

    type Flags = TypedFlags<TestFlags>;

    // Verify the structure matches what we'd expect
    expect<Flags>().type.toHaveProperty('name');
    expect<Flags>().type.toHaveProperty('count');
  });
});
