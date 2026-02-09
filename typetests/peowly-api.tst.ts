import { describe, expect, it } from 'tstyche';

import type { AnyFlag, PeowlyOptions, PeowlyResult } from '../index.js';

describe('PeowlyOptions', () => {
  it('should accept basic options', () => {
    const options: PeowlyOptions<{
      help: { type: 'boolean'; description: string };
    }> = {
      name: 'test-cli',
      options: {
        help: {
          type: 'boolean',
          description: 'Show help',
        },
      },
    };

    expect(options).type.toBeAssignableTo<
      PeowlyOptions<Record<string, AnyFlag>>
    >();
  });

  it('should have optional help properties', () => {
    const optionsWithHelp: PeowlyOptions<Record<string, AnyFlag>> = {
      name: 'test-cli',
      help: 'Help text',
      options: {},
    };

    expect(optionsWithHelp).type.toBeAssignableTo<
      PeowlyOptions<Record<string, AnyFlag>>
    >();
  });
});

describe('PeowlyResult', () => {
  it('should have correct structure', () => {
    type Result = PeowlyResult<{
      verbose: { type: 'boolean'; 'default': false; description: string };
      output: { type: 'string'; 'default': string; description: string };
    }>;

    expect<Result>().type.toHaveProperty('flags');
    expect<Result>().type.toHaveProperty('input');
    expect<Result>().type.toHaveProperty('showHelp');
    expect<Result>().type.toHaveProperty('remainderArgs');
  });

  it('result showHelp should be callable', () => {
    type Result = PeowlyResult<Record<string, AnyFlag>>;

    const result: Result = {
      flags: {},
      input: [],
      remainderArgs: [],
      showHelp: (): never => {
        throw new Error('Help shown');
      },
    };

    expect(result.showHelp).type.toBeCallableWith();
  });
});
