import { describe, expect, it } from 'tstyche';

import type { AnyFlag, AnyFlags } from '../index.js';

describe('type: aliases', () => {
  it('aliases is string[] | undefined on a boolean flag', () => {
    const flag: AnyFlag = {
      type: 'boolean' as const,
      description: 'Enable color',
      aliases: ['colours', 'colors'],
    };

    expect(flag).type.toBeAssignableTo<AnyFlag>();
  });

  it('aliases is string[] | undefined on a string flag', () => {
    const flag: AnyFlag = {
      type: 'string' as const,
      description: 'Timeout ms',
      aliases: ['timeouts'],
    };

    expect(flag).type.toBeAssignableTo<AnyFlag>();
  });

  it('aliases is string[] | undefined on a number flag', () => {
    const flag: AnyFlag = {
      type: 'number' as const,
      description: 'Retry count',
      aliases: ['retries'],
    };

    expect(flag).type.toBeAssignableTo<AnyFlag>();
  });

  it('showAliasInHelp is boolean | undefined', () => {
    const flag: AnyFlag = {
      type: 'boolean' as const,
      description: 'Enable color',
      aliases: ['colours'],
      showAliasInHelp: true,
    };

    expect(flag).type.toBeAssignableTo<AnyFlag>();
  });

  it('flags with aliases are assignable to AnyFlags', () => {
    const flags: AnyFlags = {
      color: { type: 'boolean' as const, description: 'Color', aliases: ['colours', 'colors'] },
      timeout: { type: 'string' as const, description: 'Timeout ms', aliases: ['timeouts'] },
      retry: { type: 'number' as const, description: 'Retry count', aliases: ['retries'] },
    };

    expect(flags).type.toBeAssignableTo<AnyFlags>();
  });
});
