import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { filter } from '../lib/utils.js';

describe('utils', () => {
  describe('filter()', () => {
    it('should remove undefined values from array', () => {
      const input = [1, undefined, 2, undefined, 3];
      const result = filter(input);
      assert.deepEqual(result, [1, 2, 3]);
    });

    it('should preserve falsy values that are not undefined', () => {
      const input = [0, false, '', undefined, undefined];
      const result = filter(input);
      assert.deepEqual(result, [0, false, '']);
    });

    it('should handle empty array', () => {
      /** @type {Array<unknown>} */
      const input = [];
      const result = filter(input);
      assert.deepEqual(result, []);
    });

    it('should handle array with no undefined values', () => {
      const input = [1, 2, 3];
      const result = filter(input);
      assert.deepEqual(result, [1, 2, 3]);
    });

    it('should handle array with only undefined values', () => {
      const input = [undefined, undefined];
      const result = filter(input);
      assert.deepEqual(result, []);
    });

    it('should handle readonly arrays', () => {
      const input = Object.freeze([1, undefined, 2]);
      const result = filter(input);
      assert.deepEqual(result, [1, 2]);
    });
  });
});
