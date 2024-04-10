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
    Array.isArray(pkg?.bin)
      ? Object.keys(pkg?.bin).at(0)
      : pkg?.name
  );

  const {
    args = process.argv.slice(2),
    description = pkg?.description,
    help: baseHelp,
    indent = 2,
    name: _name, // destructed to get rid of it from parseArgsOptions
    options: flags = {},
    pkg: _pkg, // destructed to get rid of it from parseArgsOptions
    processTitle = name,
    returnRemainderArgs,
    version = pkg?.version,
    ...parseArgsOptions
  } = options || {};

  if (processTitle) {
    process.title = processTitle;
  }

  let help = baseHelp || formatHelpMessage(name || 'nameless', {
    flags,
    indent,
  });

  help = '\n' + (description ? ''.padEnd(indent) + description + '\n\n' : '') + help;

  /** @type {import('./flag-types.d.ts').AnyFlags & typeof defaultFlags} */
  const resolvedFlags = { ...flags, ...defaultFlags };

  const {
    positionals,
    tokens,
    values: {
      help: helpFlag,
      version: versionFlag,
      ...values
    },
  } = parseArgs({
    args,
    allowPositionals: true,
    ...parseArgsOptions,
    options: resolvedFlags,
    strict: !returnRemainderArgs,
    tokens: true,
  });

  const showHelp = (/** @type {number | undefined} */ code) => {
    // eslint-disable-next-line no-console
    console.log(help);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(typeof code === 'number' ? code : 2); // Default to code 2 for incorrect usage (#47)
  };

  if (helpFlag) {
    showHelp(0);
  }

  if (versionFlag) {
    // eslint-disable-next-line no-console
    console.log(version || 'no version');
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(0);
  }

  /** @type {string[]} */
  let remainderArgs = [];

  if (returnRemainderArgs) {
    /** @type {Array<string|undefined>} */
    const sourceArgs = [...args];

    for (const token of tokens) {
      if (token.kind !== 'option') {
        continue;
      }
      if (!resolvedFlags[token.name]) {
        continue;
      }
      delete values[token.name];
      sourceArgs[token.index] = undefined;
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
