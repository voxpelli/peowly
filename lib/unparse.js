/**
 * Serialises a parsed flags object back to a CLI argument array suitable for
 * passing to `child_process.spawn()`.
 *
 * Rules:
 *  - `boolean true`  → `['--name']`
 *  - `boolean false` → `[]` (omitted; `--no-name` is not emitted)
 *  - `string`/`number` → `['--name', String(value)]`
 *  - multiple array → one `--name value` pair per element
 *  - `undefined` → `[]` (omitted)
 *
 * @template {import('./flag-types.d.ts').AnyFlags} Flags
 * @param {import('./peowly-types.d.ts').TypedFlags<Flags>} flags
 * @param {Flags} flagDefs
 * @returns {string[]}
 */
export function unparseFlags (flags, flagDefs) {
  /** @type {string[]} */
  const result = [];

  for (const [name, def] of Object.entries(flagDefs)) {
    const value = /** @type {Record<string, unknown>} */ (flags)[name];
    if (value === undefined) continue;
    const cliName = `--${name}`;

    if (def.multiple) {
      if (!Array.isArray(value)) continue;
      for (const item of /** @type {Array<string | number>} */ (value)) {
        result.push(cliName, String(item));
      }
    } else if (def.type === 'boolean') {
      if (value === true) result.push(cliName);
    } else {
      result.push(cliName, String(value));
    }
  }

  return result;
}
