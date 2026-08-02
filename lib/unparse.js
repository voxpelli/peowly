/**
 * Serialises a parsed flags object back to a CLI argument array suitable for
 * passing to `child_process.spawn()`.
 *
 * Rules:
 *  - `boolean true`  → `['--name']`
 *  - `boolean false` → `['--no-name']`
 *  - `string`/`number` → `['--name', String(value)]` (or `['--name=-5']` for negative values)
 *  - multiple array → one `--name value` pair per element (inline `--name=-5` for negative items)
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
        const str = String(item);
        if (str.startsWith('-')) {
          result.push(`${cliName}=${str}`);
        } else {
          result.push(cliName, str);
        }
      }
    } else if (def.type === 'boolean') {
      result.push(value === true ? cliName : `--no-${name}`);
    } else {
      const str = String(value);
      if (str.startsWith('-')) {
        result.push(`${cliName}=${str}`);
      } else {
        result.push(cliName, str);
      }
    }
  }

  return result;
}
