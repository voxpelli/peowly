import { defaultFlags } from './flags.js';
import {
  getHelpListMaxNamePadding,
  formatGroupedFlagList,
  formatGroupedHelpList,
} from './format-lists.js';

/**
 * @typedef HelpMessageInfo
 * @property {import('./help-list-types.d.ts').HelpListBasic} [aliases]
 * @property {import('./help-list-types.d.ts').HelpListBasic} [commands]
 * @property {string[]} [examples]
 * @property {import('./help-list-types.d.ts').HelpList} [flags]
 * @property {number} [indent]
 * @property {boolean} [noDefaultFlags]
 * @property {string} [usage]
 */

/**
 * @param {string} name
 * @param {Readonly<HelpMessageInfo>} info
 * @returns {string}
 */
export function formatHelpMessage (name, info = {}) {
  const {
    aliases = {},
    commands = {},
    examples = [],
    flags = {},
    indent = 2,
    noDefaultFlags = false,
    usage = '',
  } = info;

  const aliasesWithGroups = Object.fromEntries(
    Object.entries(aliases).map(
      ([key, { listGroup, ...value }]) => [key, {
        listGroup: (listGroup ? listGroup + ' ' : '') + 'Aliases',
        ...value,
      }]
    )
  );

  const commandList = { ...aliasesWithGroups, ...commands };
  const flagList = { ...flags, ...(noDefaultFlags ? {} : defaultFlags) };

  const padName = Math.max(
    getHelpListMaxNamePadding(commandList),
    getHelpListMaxNamePadding(flagList, { keyPrefix: '--' })
  );

  /** @type {import('./format-lists.js').HelpListGroupOptions} */
  const listOptions = { fixedPadName: true, padName };

  return (
    ''.padEnd(indent) + 'Usage\n' +
    ''.padEnd(indent + 2) + `$ ${name} ${usage}\n` +
    formatGroupedHelpList(commandList, indent, { defaultGroupName: 'Commands', defaultGroupOrderFirst: true, ...listOptions }) +
    formatGroupedFlagList(flagList, indent, listOptions) +
    (
      examples.length
        ? '\n' + ''.padEnd(indent) + ['Examples', ...examples].join('\n' + ''.padEnd(indent + 2) + `$ ${name} `)
        : ''
    )
  );
}
