import type { HelpListBasicItem } from './help-list-types.d.ts';

type ParseArgsOptionConfigType = 'string' | 'boolean';
type ParseArgsOptionConfigDefault = string | boolean | string[] | boolean[] | undefined;

// Borrowed from @types/node
interface ParseArgsOptionConfig {
  type: ParseArgsOptionConfigType;
  multiple?: boolean | undefined;
  // "shortFlag" in meow
  'short'?: string | undefined;
  'default'?: ParseArgsOptionConfigDefault;
}

type TypeMap = {
  'string': string,
  'boolean': boolean,
  'number': number,
};

// Meow extensions
// interface FlagExtensions {
//   readonly choices?: Type extends unknown[] ? Type : Type[];
//   readonly isRequired?: boolean;
// }

interface FlagAliasConfig {
  aliases?: string[] | undefined;
  showAliasInHelp?: boolean | undefined;
  'short'?: string | undefined;
}

interface BaseFlag extends ParseArgsOptionConfig, HelpListBasicItem, FlagAliasConfig {
}

interface Flag<
  PrimitiveType extends ParseArgsOptionConfigType,
  DefaultType extends TypeMap[PrimitiveType]
> extends BaseFlag {
  type: PrimitiveType,
  'default'?: DefaultType,
  multiple?: false | undefined,
}

interface MultiFlag<
  PrimitiveType extends ParseArgsOptionConfigType,
  DefaultType extends ParseArgsOptionConfigDefault
> extends BaseFlag {
  type: PrimitiveType,
  'default'?: DefaultType,
  multiple: true,
}

export type StringFlag = Flag<'string', string> | MultiFlag<'string', string[]>;
export type BooleanFlag = Flag<'boolean', false>;

// NumberFlag does not extend BaseFlag/ParseArgsOptionConfig because parseArgs()
// only accepts type:'string'|'boolean'. peowly coerces number flags internally.
interface NumberFlag extends HelpListBasicItem, FlagAliasConfig {
  type: 'number',
  'default'?: number | undefined,
  multiple?: false | undefined,
}
interface NumberMultiFlag extends HelpListBasicItem, FlagAliasConfig {
  type: 'number',
  'default'?: number[] | undefined,
  multiple: true,
}

export type AnyFlag = StringFlag | BooleanFlag | NumberFlag | NumberMultiFlag;
export type AnyFlags = Record<string, AnyFlag>;

// Internal: flags that parseArgs() understands (no 'number' type)
export type ParseArgsCompatibleFlag = StringFlag | BooleanFlag;
