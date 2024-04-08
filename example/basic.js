/* eslint-disable no-console */
/* eslint-disable unicorn/no-process-exit */

import { formatHelpMessage, peowly } from '../index.js';

const flags = /** @satisfies {import('../index.js').AnyFlags} */ ({
  output: {
    type: 'string',
    'default': 'dist.js',
    description: 'The output file',
    listGroup: 'Output',
  },
  logs: {
    type: 'boolean',
    'default': false,
    description: 'Controls log output',
  },
});

const name = 'node basic.js';

const cli = peowly({
  help: formatHelpMessage(name, {
    examples: ['yay'],
    flags,
    usage: '<name>',
  }),
  name,
  options: flags,
});

const [inputItem = ''] = cli.input;

if (!inputItem) {
  cli.showHelp();
  process.exit(1);
}

console.log('Got flags:', cli.flags);
console.log('Got input:', cli.input);
