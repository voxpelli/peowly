/**
 * @typedef HelpListOptions
 * @property {boolean} [fixedPadName] When set to true, padName will be treated as a fixed rather than minimum padding
 * @property {string} [keyPrefix] A prefix for the name, eg. "--"
 * @property {number} [padName] The minimum padding between names and descriptions
 * @property {string} [shortFlagPrefix] A prefix for the shortFlag, defaults to "-"
 * @property {number} [maxDefaultDisplayLength] Max length of a default value before truncation with ellipsis, defaults to 20
 */

/**
 * Default max length of a default value shown in help text before truncation.
 * Long defaults are truncated with an ellipsis to avoid pushing descriptions
 * too far right.
 */
const DEFAULT_MAX_DISPLAY_LENGTH = 20;

/**
 * Formats the default value of a flag item into a `[default: value]` annotation
 * string, or returns `undefined` if no default should be shown.
 *
 * - Boolean `default: true` → `'on'` (paired with the `[no-]` prefix)
 * - Boolean `default: false` → `undefined` (trivial default, not shown)
 * - String with truthy default → the value (or comma-joined for multiple)
 * - Number with defined default → the value (or comma-joined for arrays)
 *
 * Values longer than `maxDefaultDisplayLength` (default: {@link DEFAULT_MAX_DISPLAY_LENGTH}) are truncated with `…`.
 *
 * @param {import('./flag-types.d.ts').AnyFlag} item
 * @param {number} [maxDisplayLength] Max length before truncation, defaults to {@link DEFAULT_MAX_DISPLAY_LENGTH}
 * @returns {string | undefined}
 */
function formatDefault (item, maxDisplayLength = DEFAULT_MAX_DISPLAY_LENGTH) {
  const { 'default': value, type } = item;

  /** @type {string | undefined} */
  let displayValue;

  if (type === 'boolean') {
    displayValue = value === true ? 'on' : undefined;
  } else if (type === 'string' && value) {
    displayValue = Array.isArray(value) ? value.join(', ') : value;
  } else if (type === 'number' && value !== undefined) {
    displayValue = Array.isArray(value) ? value.join(', ') : String(value);
  }

  if (displayValue !== undefined && displayValue.length > maxDisplayLength) {
    return displayValue.slice(0, maxDisplayLength - 1) + '…';
  }

  return displayValue;
}

/**
 * Computes the display name for a help list item, applying the `[no-]` prefix
 * for boolean flags with `default: true` (the git convention for negatable flags).
 *
 * Default value annotations (`[default: value]`) are handled separately by
 * `formatDisplayName` so they can be right-aligned in the flag area.
 *
 * @param {string} name
 * @param {string|import('./help-list-types.d.ts').HelpListItem|undefined} item
 * @returns {string}
 */
function getDisplayName (name, item) {
  if (!item || typeof item === 'string' || !('type' in item)) {
    return name;
  }

  // Boolean flags with default: true get the [no-] prefix to show the canonical
  // flag name and indicate a negation variant exists (git convention).
  return item.type === 'boolean' && item.default === true
    ? `[no-]${name}`
    : name;
}

/**
 * Formats an already-computed display name with short flag prefix, key prefix,
 * padding, and right-aligned `[default: value]` suffix.
 *
 * Layout: `-c, --flag   [default: value]`
 * When the flag name is long enough to reach the default column, the default
 * follows with a single space separator (padEnd collapses naturally).
 *
 * @param {string} displayName
 * @param {string|import('./help-list-types.d.ts').HelpListItem|undefined} item
 * @param {Readonly<Pick<HelpListOptions, 'keyPrefix'|'padName'|'shortFlagPrefix'|'maxDefaultDisplayLength'>>} options
 * @returns {string}
 */
function formatDisplayName (displayName, item, options = {}) {
  const {
    keyPrefix = '',
    maxDefaultDisplayLength = DEFAULT_MAX_DISPLAY_LENGTH,
    padName = 0,
    shortFlagPrefix = '-',
  } = options;

  // Short flag as left-aligned prefix: `-c, ` or 4-space pad when keyPrefix is set
  const hasShort = typeof item === 'object' && 'type' in item && item.short;
  const shortPrefix = hasShort
    ? `${shortFlagPrefix}${item.short}, `
    : (keyPrefix
        ? '    '
        : '');

  // Default annotation as right-aligned suffix
  const defaultStr = typeof item === 'object' && 'type' in item
    ? formatDefault(item, maxDefaultDisplayLength)
    : undefined;
  const defaultAnnotation = defaultStr ? `[default: ${defaultStr}]` : '';

  const name = shortPrefix + keyPrefix + displayName;
  if (defaultAnnotation) {
    // Ensure at least 2 spaces between the name and the default annotation
    const targetWidth = Math.max(padName - defaultAnnotation.length, name.length + 2);
    return name.padEnd(targetWidth) + defaultAnnotation;
  }
  return name.padEnd(padName);
}

/**
 * @param {string} name
 * @param {string|import('./help-list-types.d.ts').HelpListItem|undefined} item
 * @param {Readonly<Pick<HelpListOptions, 'keyPrefix'|'padName'|'shortFlagPrefix'|'maxDefaultDisplayLength'>>} options
 * @returns {string}
 */
function formatHelpListName (name, item, options = {}) {
  if (!item) {
    return '';
  }

  return formatDisplayName(getDisplayName(name, item), item, options);
}

/**
 * @param {import('./help-list-types.d.ts').HelpList} list
 * @param {Readonly<Pick<HelpListOptions, 'keyPrefix'|'padName'|'shortFlagPrefix'|'maxDefaultDisplayLength'>>} options
 * @returns {number}
 */
export function getHelpListMaxNamePadding (list, options = {}) {
  let longestLength = 0;

  for (const name in list) {
    const item = list[name];
    const itemName = formatHelpListName(name, item, options);

    if (longestLength < itemName.length) {
      longestLength = itemName.length;
    }
  }

  return longestLength;
}

/**
 * Formats a help list into a string. Each line is indented with `indent` spaces.
 * The result is trimmed of trailing whitespace (e.g. the final newline) but
 * preserves leading indentation on the first line.
 *
 * @param {import('./help-list-types.d.ts').HelpList} list
 * @param {number} indent
 * @param {HelpListOptions} options
 * @returns {string}
 */
export function formatHelpList (list, indent, options = {}) {
  const {
    fixedPadName = false,
    padName = 0,
  } = options;

  // Pre-compute display names once for sorting, padding, and printing.
  // Sort by canonical key name (not display name) so that boolean flags with
  // default: true (displayed as --[no-]flag) sort under their canonical name
  // (e.g. "color" under 'c') rather than under the [no-] prefix, matching git.
  const entries = Object.keys(list)
    .map(name => ({ name, displayName: getDisplayName(name, list[name]) }))
    .toSorted((a, b) => a.name < b.name ? -1 : (a.name > b.name ? 1 : 0));

  // Mirrors getHelpListMaxNamePadding but reuses pre-computed display names
  let maxNameLength = 0;
  if (!fixedPadName) {
    for (const { displayName, name } of entries) {
      const formatted = formatDisplayName(displayName, list[name], options);
      if (formatted.length > maxNameLength) maxNameLength = formatted.length;
    }
  }
  const calculatedPadName = fixedPadName ? padName : Math.max(padName, maxNameLength);

  let result = '';

  for (const { displayName, name } of entries) {
    const item = list[name];

    const description = typeof item === 'object' ? item.description : item;
    const rawAliases = typeof item === 'object' && 'aliases' in item && item.showAliasInHelp
      ? item.aliases
      : undefined;
    const aliasAnnotation = rawAliases && rawAliases.length > 0
      ? `  [${rawAliases.length === 1 ? 'alias' : 'aliases'}: ${rawAliases.map(a => `--${a}`).join(', ')}]`
      : '';

    result += ''.padEnd(indent) +
      formatDisplayName(displayName, item, { ...options, padName: calculatedPadName }) + '  ' +
      description + aliasAnnotation + '\n';
  }

  return result.trimEnd();
}

/**
 * @typedef HelpListGroupOptionsExtras
 * @property {boolean} [alignWithinGroups]
 * @property {string} [defaultGroupName]
 * @property {boolean} [defaultGroupOrderFirst]
 */

/** @typedef {Readonly<HelpListOptions & HelpListGroupOptionsExtras>} HelpListGroupOptions */

/**
 * @param {import('./help-list-types.d.ts').HelpList} list
 * @param {number} indent
 * @param {HelpListGroupOptions} options
 * @returns {string}
 */
export function formatGroupedHelpList (list, indent, options = {}) {
  const {
    alignWithinGroups = false,
    defaultGroupName = 'Default',
    defaultGroupOrderFirst = false,

    fixedPadName = false,
    padName = 0,

    ...incomingListOptions
  } = options;

  const calculatedPadName = (alignWithinGroups || fixedPadName)
    ? undefined
    : Math.max(padName, getHelpListMaxNamePadding(list, options));

  const defaultGroupSymbol = Symbol('Default group');

  const {
    [defaultGroupSymbol]: defaultGroup,
    ...groups
  } = Object.groupBy(
    Object.entries(list),
    ([, item]) => (typeof item === 'object' && item.listGroup) || defaultGroupSymbol
  );

  const sortedGroupNames = Object.keys(groups).toSorted();
  const groupNames = defaultGroup
    ? (
        defaultGroupOrderFirst
          ? /** @type {const} */ ([defaultGroupSymbol, ...sortedGroupNames])
          : /** @type {const} */ ([...sortedGroupNames, defaultGroupSymbol])
      )
    : sortedGroupNames;

  /** @type {HelpListOptions} */
  const listOptions = {
    ...incomingListOptions,
    fixedPadName: calculatedPadName === undefined ? fixedPadName : true, // Avoids redoing calculation
    padName: calculatedPadName || padName,
  };
  const flagIndent = indent + 2;

  let result = '';

  for (const groupKey of groupNames) {
    const groupItem = groupKey === defaultGroupSymbol ? defaultGroup : groups[groupKey];
    const groupList = Object.fromEntries(groupItem || []);
    const groupName = groupKey === defaultGroupSymbol ? defaultGroupName : groupKey;

    result += '\n' + ''.padEnd(indent) + groupName + '\n';
    result += formatHelpList(groupList, flagIndent, listOptions) + '\n';
  }

  return result;
}

/**
 * @param {import('./help-list-types.d.ts').HelpList} list
 * @param {number} indent
 * @param {Readonly<HelpListOptions>} options
 * @returns {string}
 */
export function formatFlagList (list, indent, options = {}) {
  return formatHelpList(list, indent, { keyPrefix: '--', ...options });
}

/**
 * @param {import('./help-list-types.d.ts').HelpList} list
 * @param {number} indent
 * @param {HelpListGroupOptions} options
 * @returns {string}
 */
export function formatGroupedFlagList (list, indent, options = {}) {
  return formatGroupedHelpList(list, indent, { defaultGroupName: 'Options', keyPrefix: '--', ...options });
}
