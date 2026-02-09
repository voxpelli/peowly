import { describe, expect, it } from 'tstyche';

import type {
  HelpListGroupOptions,
  HelpMessageInfo,
} from '../index.js';

describe('HelpMessageInfo', () => {
  it('should have optional properties', () => {
    const options: HelpMessageInfo = {
      flags: {
        output: {
          type: 'string',
          description: 'Output file',
        },
      },
    };

    expect(options).type.toBeAssignableTo<HelpMessageInfo>();
  });

  it('should accept all optional properties', () => {
    const options: HelpMessageInfo = {
      flags: {},
      aliases: {},
      commands: {},
      usage: '<input>',
      examples: ['example 1', 'example 2'],
    };

    expect(options).type.toBeAssignableTo<HelpMessageInfo>();
  });
});

describe('HelpListGroupOptions', () => {
  it('should extend HelpListOptions with group properties', () => {
    const options: HelpListGroupOptions = {
      alignWithinGroups: true,
      defaultGroupName: 'Options',
      defaultGroupOrderFirst: false,
    };

    expect(options).type.toBeAssignableTo<HelpListGroupOptions>();
  });
});
