/* eslint-disable n/no-unsupported-features/node-builtins */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { peowly } from '../index.js';

describe('peowly basic', () => {
  it('should work', () => {
    /** @type {import('../index.js').AnyFlags} */
    const options = {
      fix: {
        description: 'Fixes stuff',
        type: 'boolean',
      },
    };
    const { flags } = peowly({
      args: ['--fix'],
      options,
    });

    assert.deepEqual(flags, { fix: true });
  });
});
