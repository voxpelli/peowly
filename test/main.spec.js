import chai from 'chai';

import { peowly } from '../index.js';

chai.should();

describe('peowly', () => {
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

    flags.should.deep.equal({ fix: true });
  });
});
