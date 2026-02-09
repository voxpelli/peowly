/* eslint-disable n/no-unsupported-features/node-builtins */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { filter, groupBy } from '../lib/utils.js';

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

  describe('groupBy()', () => {
    it('should group items by callback result', () => {
      const input = [1, 2, 3, 4, 5];
      const result = groupBy(input, (item) => (item % 2 === 0 ? 'even' : 'odd'));
      assert.deepEqual(result, {
        odd: [1, 3, 5],
        even: [2, 4],
      });
    });

    it('should handle empty iterable', () => {
      const result = groupBy([], String);
      assert.deepEqual(result, {});
    });

    it('should group string items', () => {
      /** @type {string[]} */
      const input = ['apple', 'apricot', 'banana', 'blueberry'];
      const result = groupBy(input, (item) => item[0] ?? '');
      assert.deepEqual(result, {
        a: ['apple', 'apricot'],
        b: ['banana', 'blueberry'],
      });
    });

    it('should handle numeric keys', () => {
      const input = [10, 20, 30, 40];
      const result = groupBy(input, (item) => String(item / 10));
      assert.deepEqual(result, {
        '1': [10],
        '2': [20],
        '3': [30],
        '4': [40],
      });
    });

    it('should work with objects', () => {
      const input = [
        { name: 'Alice', type: 'admin' },
        { name: 'Bob', type: 'user' },
        { name: 'Charlie', type: 'admin' },
      ];
      const result = groupBy(input, (item) => item.type);
      assert.deepEqual(result, {
        admin: [
          { name: 'Alice', type: 'admin' },
          { name: 'Charlie', type: 'admin' },
        ],
        user: [
          { name: 'Bob', type: 'user' },
        ],
      });
    });

    it('should support index in callback', () => {
      const input = ['a', 'b', 'c'];
      const result = groupBy(input, (_item, index) => index % 2 === 0 ? 'even-index' : 'odd-index');
      assert.deepEqual(result, {
        'even-index': ['a', 'c'],
        'odd-index': ['b'],
      });
    });
  });
});
