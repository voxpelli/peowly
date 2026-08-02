import { describe, expect, it } from 'tstyche';

import { peowly } from '../index.js';
import type { AnyFlag, AnyFlags } from '../index.js';

describe('type: number flags', () => {
  it('number flag without default resolves to number | undefined', () => {
    const cli = peowly({
      args: [],
      options: {
        count: { type: 'number' as const, description: 'A count' },
      },
    });

    expect(cli.flags.count).type.toBe<number | undefined>();
  });

  it('number flag with default resolves to number', () => {
    const cli = peowly({
      args: [],
      options: {
        retries: { type: 'number' as const, 'default': 3, description: 'Retry count' },
      },
    });

    expect(cli.flags.retries).type.toBe<number>();
  });

  it('multiple number flag without default resolves to number[] | undefined', () => {
    const cli = peowly({
      args: [],
      options: {
        port: { type: 'number' as const, multiple: true, description: 'Ports' },
      },
    });

    expect(cli.flags.port).type.toBe<number[] | undefined>();
  });

  it('multiple number flag with default resolves to number[]', () => {
    const cli = peowly({
      args: [],
      options: {
        port: { type: 'number' as const, multiple: true, 'default': [3000, 4000], description: 'Ports' },
      },
    });

    expect(cli.flags.port).type.toBe<number[]>();
  });

  it('number flag is assignable to AnyFlag', () => {
    const flag: AnyFlag = { type: 'number' as const, description: 'A count' };

    expect(flag).type.toBeAssignableTo<AnyFlag>();
  });

  it('number flags are assignable to AnyFlags', () => {
    const flags: AnyFlags = {
      count: { type: 'number' as const, description: 'A count' },
      timeout: { type: 'number' as const, 'default': 5000, description: 'Timeout ms' },
    };

    expect(flags).type.toBeAssignableTo<AnyFlags>();
  });
});
