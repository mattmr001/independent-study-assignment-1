// ABOUTME: Tests for coded participant ID generation
// ABOUTME: Verifies sequential P001-style ID formatting

import { generateCodedId } from './codedId';

describe('generateCodedId', () => {
  it('generates P001 for first participant', () => {
    expect(generateCodedId(0)).toBe('P001');
  });

  it('generates P003 for third participant', () => {
    expect(generateCodedId(2)).toBe('P003');
  });

  it('generates P100 for 100th participant', () => {
    expect(generateCodedId(99)).toBe('P100');
  });
});
