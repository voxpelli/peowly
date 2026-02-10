import { describe, expect, it } from 'tstyche';

import type {
  ExtendedParseArgsConfig,
  AnyFlag,
  PeowlyMeta,
} from '../index.js';

describe('PeowlyMeta', () => {
  it('should have optional properties', () => {
    type Meta = PeowlyMeta;

    expect<Meta>().type.toHaveProperty('description');
    expect<Meta>().type.toHaveProperty('pkg');
    expect<Meta>().type.toHaveProperty('version');
  });
});

describe('ExtendedParseArgsConfig', () => {
  it('should extend ParseArgsConfig', () => {
    const config: ExtendedParseArgsConfig<Record<string, AnyFlag>> = {
      options: {
        help: {
          type: 'boolean',
          description: 'Show help',
        },
      },
    };

    expect(config).type.toBeAssignableTo<
      ExtendedParseArgsConfig<Record<string, AnyFlag>>
    >();
  });
});
