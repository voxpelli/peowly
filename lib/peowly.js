// eslint-disable-next-line n/no-unsupported-features/node-builtins
import { parseArgs } from 'node:util';

import { defaultFlags } from './flags.js';
import { formatHelpMessage } from './format-help.js';
import { filter } from './utils.js';

// TODO: Add helper that translates a meow config into this config
// TODO: Add type tests that verifies overlap and differences to meow

/**
 * @template {import('./flag-types.d.ts').AnyFlags} Flags
 * @param {import('./peowly-types.d.ts').PeowlyOptions<Flags>} options
 * @returns {import('./peowly-types.d.ts').PeowlyResult<Flags>}
 */
export function peowly (options) {
  const pkg = options?.pkg;
  const name = options?.name || (
    pkg?.bin && typeof pkg.bin === 'object' && !Array.isArray(pkg.bin)
      ? Object.keys(pkg.bin).at(0)
      : pkg?.name
  );

  const {
    args = process.argv.slice(2),
    description = pkg?.description,
    examples,
    help: baseHelp,
    indent = 2,
    name: _name, // destructed to get rid of it from parseArgsOptions
    options: flags = {},
    pkg: _pkg, // destructed to get rid of it from parseArgsOptions
    processTitle = name,
    returnRemainderArgs,
    usage,
    version = pkg?.version,
    ...parseArgsOptions
  } = options || {};

  if (processTitle) {
    process.title = processTitle;
  }

  let help = baseHelp || formatHelpMessage(name || 'nameless', {
    examples,
    flags,
    indent,
    usage,
  });

  help = '\n' + (description ? ''.padEnd(indent) + description + '\n\n' : '') + help;

  /** @type {import('./flag-types.d.ts').AnyFlags & typeof defaultFlags} */
  const resolvedFlags = { ...flags, ...defaultFlags };

  /** @type {Map<string, { multiple: boolean, 'default': number | number[] | undefined }>} */
  const numberFlagMeta = new Map();

  /** @type {Record<string, import('./flag-types.d.ts').ParseArgsCompatibleFlag>} */
  const parseArgsFlags = {};

  for (const [name, flag] of Object.entries(resolvedFlags)) {
    if (flag.type === 'number') {
      numberFlagMeta.set(name, { multiple: flag.multiple === true, 'default': flag['default'] });
      const { 'default': _d, ...flagWithoutDefault } = flag;
      parseArgsFlags[name] = /** @type {import('./flag-types.d.ts').StringFlag} */ ({ ...flagWithoutDefault, type: 'string' });
    } else {
      parseArgsFlags[name] = flag;
    }
  }

  const showHelp = (/** @type {number | undefined} */ code) => {
    // eslint-disable-next-line no-console
    console.log(help);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(typeof code === 'number' ? code : 2); // Default to code 2 for incorrect usage (#47)
  };

  if (args.includes('--help')) {
    showHelp(0);
  }

  if (args.includes('--version')) {
    // eslint-disable-next-line no-console
    console.log(version || 'no version');
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(0);
  }

  // Build alias map: alias name → canonical flag name
  /** @type {Map<string, string>} */
  const aliasMap = new Map();

  for (const [canonicalName, flag] of Object.entries(resolvedFlags)) {
    for (const alias of flag.aliases ?? []) {
      if (resolvedFlags[alias] !== undefined) {
        throw new Error(`Flag alias "${alias}" conflicts with existing flag "${canonicalName}"`);
      }
      if (aliasMap.has(alias)) {
        throw new Error(`Alias "${alias}" is already claimed by flag "${aliasMap.get(alias)}"`);
      }
      aliasMap.set(alias, canonicalName);
    }
  }

  // Rewrite args: expand aliases to their canonical flag names
  const rewrittenArgs = aliasMap.size === 0
    ? args
    : args.map(arg => {
      if (!arg.startsWith('--')) return arg;
      const eqIdx = arg.indexOf('=');
      if (eqIdx !== -1) {
        const alias = arg.slice(2, eqIdx);
        const canonical = aliasMap.get(alias);
        return canonical ? `--${canonical}=${arg.slice(eqIdx + 1)}` : arg;
      }
      const flagName = arg.slice(2);
      const canonical = aliasMap.get(flagName);
      if (canonical) return `--${canonical}`;
      if (flagName.startsWith('no-')) {
        const aliasedName = flagName.slice(3);
        const canonicalForNo = aliasMap.get(aliasedName);
        if (canonicalForNo && resolvedFlags[canonicalForNo]?.type === 'boolean') {
          return `--no-${canonicalForNo}`;
        }
      }
      return arg;
    });

  const {
    positionals,
    tokens,
    values: {
      help: _helpFlag,
      version: _versionFlag,
      ...values
    },
  } = parseArgs({
    args: rewrittenArgs,
    allowPositionals: true,
    ...parseArgsOptions,
    options: parseArgsFlags,
    strict: !returnRemainderArgs,
    tokens: true,
  });

  // Coerce string values back to numbers for number-typed flags
  if (numberFlagMeta.size) {
    const mutableValues = /** @type {Record<string, unknown>} */ (values);
    for (const [flagName, meta] of numberFlagMeta) {
      const raw = mutableValues[flagName];
      if (raw === undefined) {
        if (meta['default'] !== undefined) mutableValues[flagName] = meta['default'];
      } else if (meta.multiple) {
        mutableValues[flagName] = /** @type {string[]} */ (raw).map(s => {
          const n = Number(s);
          if (Number.isNaN(n)) throw new Error(`Flag --${flagName} expects a number, got: ${s}`);
          return n;
        });
      } else {
        const n = Number(raw);
        if (Number.isNaN(n)) throw new Error(`Flag --${flagName} expects a number, got: ${raw}`);
        mutableValues[flagName] = n;
      }
    }
  }

  /** @type {string[]} */
  let remainderArgs = [];

  if (returnRemainderArgs) {
    /** @type {Array<string|undefined>} */
    const sourceArgs = [...args];

    for (const token of tokens ?? []) {
      if (token.kind !== 'option') {
        continue;
      }
      if (!resolvedFlags[token.name]) {
        delete values[token.name];
      } else {
        sourceArgs[token.index] = undefined;
      }
    }

    remainderArgs = filter(sourceArgs);
  }

  return {
    input: positionals,
    flags: /** @type {import('./peowly-types.d.ts').TypedFlags<Flags>} */ (values),
    remainderArgs,
    showHelp,
  };
}
