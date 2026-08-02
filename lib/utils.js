/**
 * @template {unknown[]|(readonly unknown[])} T
 * @param {T} input
 * @returns {Exclude<T[number], undefined>[]}
 */
export function filter (input) {
  /** @type {Exclude<T[number], undefined>[]} */
  const result = [];

  for (const item of input) {
    if (item !== undefined) {
      result.push(/** @type {Exclude<T[number], undefined>} */ (item));
    }
  }

  return result;
}
