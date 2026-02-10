import { describe, expect, it } from 'tstyche';

import type { AnyFlags } from '../index.js';
import { peowly } from '../index.js';

describe('peowly usage examples', () => {
  it('should work with typed flags - string and boolean', () => {
    const flags: AnyFlags = {
      output: {
        type: 'string' as const,
        'default': 'dist.js',
        description: 'The output file',
        listGroup: 'Output',
      },
      verbose: {
        type: 'boolean' as const,
        'default': false,
        description: 'Controls verbose output',
      },
    };

    expect(flags).type.toBeAssignableTo<AnyFlags>();
  });

  it('peowly should accept options with typed flags', () => {
    const flags = {
      verbose: {
        type: 'boolean' as const,
        description: 'Enable verbose output',
      },
      output: {
        type: 'string' as const,
        'default': 'out.js',
        description: 'Output file',
      },
    };

    const cli = peowly({
      name: 'test-cli',
      options: flags,
    });

    expect(cli).type.toHaveProperty('flags');
    expect(cli).type.toHaveProperty('input');
    expect(cli).type.toHaveProperty('showHelp');
  });

  it('peowly result typed flags', () => {
    type Flags = {
      count: {
        type: 'boolean';
        'default': false;
        description: string;
      };
    };

    type CliType = ReturnType<typeof peowly<Flags>>;
    type FlagsType = CliType['flags'];

    // Flags are typed based on the provided options
    expect<FlagsType>().type.toHaveProperty('count');
  });

  it('should handle optional properties in flag definitions', () => {
    const flags: AnyFlags = {
      output: {
        type: 'string',
        description: 'Output path',
        // Optional properties
        'default': 'out.js',
        'short': 'o',
        multiple: false,
        listGroup: 'Output',
      },
    };

    expect(flags).type.toBeAssignableTo<AnyFlags>();
  });

  it('should support string and boolean flag types', () => {
    const flags: AnyFlags = {
      input: {
        type: 'string',
        description: 'Input file',
      },
      recursive: {
        type: 'boolean',
        'default': false,
        description: 'Recursive processing',
      },
      verbose: {
        type: 'boolean',
        'default': false,
        description: 'Verbose output',
      },
    };

    expect(flags).type.toBeAssignableTo<AnyFlags>();
  });

  it('peowly should be callable with valid config', () => {
    expect(peowly).type.toBeCallableWith({
      name: 'test',
    });

    expect(peowly).type.toBeCallableWith({
      name: 'test',
      options: {
        help: {
          type: 'boolean' as const,
          description: 'Show help',
        },
      },
    });
  });

  it('boolean flag default must be false', () => {
    // This demonstrates the constraint that boolean flags default to false
    const flags: AnyFlags = {
      verbose: {
        type: 'boolean',
        'default': false,
        description: 'Enable verbose mode',
      },
    };

    expect(flags).type.toBeAssignableTo<AnyFlags>();
  });

  it('should correctly type multiple string flags without default', () => {
    type MultipleStringFlags = {
      extensions: {
        type: 'string';
        multiple: true;
        description: string;
      };
    };

    type Result = ReturnType<typeof peowly<MultipleStringFlags>>['flags'];

    // Should be Array<string> | undefined when no default is provided
    const flags: Result = { extensions: ['js', 'ts'] };
    expect(flags.extensions).type.toBeAssignableTo<string[] | undefined>();
  });

  it('should correctly type multiple string flags with default', () => {
    type MultipleStringWithDefault = {
      extensions: {
        type: 'string';
        multiple: true;
        'default': string[];
        description: string;
      };
    };

    type Result = ReturnType<typeof peowly<MultipleStringWithDefault>>['flags'];

    // Should be Array<string> (not undefined) when default is provided
    const flags: Result = { extensions: ['js'] };
    expect(flags.extensions).type.toBeAssignableTo<string[]>();
  });

  it('should type multiple flags correctly when mixed with single flags', () => {
    type MixedFlags = {
      verbose: {
        type: 'boolean';
        'default': false;
        description: string;
      };
      extensions: {
        type: 'string';
        multiple: true;
        description: string;
      };
      output: {
        type: 'string';
        'default': string;
        description: string;
      };
    };

    type Result = ReturnType<typeof peowly<MixedFlags>>['flags'];

    // Verify structure
    expect<Result>().type.toHaveProperty('verbose');
    expect<Result>().type.toHaveProperty('extensions');
    expect<Result>().type.toHaveProperty('output');

    // Verify types are correct
    const flags: Result = {
      verbose: false,
      extensions: ['js', 'ts'],
      output: 'dist.js',
    };

    expect(flags.verbose).type.toBeAssignableTo<boolean>();
    expect(flags.extensions).type.toBeAssignableTo<string[] | undefined>();
    expect(flags.output).type.toBeAssignableTo<string>();
  });

  it('multiple string flags should not resolve to Array<unknown>', () => {
    type Flags = {
      values: {
        type: 'string';
        multiple: true;
        description: string;
      };
    };

    type Result = ReturnType<typeof peowly<Flags>>['flags'];

    // This verifies that TypedFlag correctly extracts 'string' type
    // and doesn't fall through to 'unknown', which would result in Array<unknown>
    const result: Result = { values: ['a', 'b', 'c'] };

    // Verify the array contains strings, not unknowns
    expect(result.values).type.toBeAssignableTo<(string[] | undefined)>();
  });
});
