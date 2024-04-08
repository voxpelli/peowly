import type { AnyFlag } from "./flag-types.d.ts";

export interface HelpListBasicItem {
  listGroup?: string;
  description: string;
}
export type HelpListBasic = Record<string, HelpListBasicItem>;

export type HelpListItem = AnyFlag | HelpListBasicItem;
export type HelpList = Record<string, HelpListItem | string>;
