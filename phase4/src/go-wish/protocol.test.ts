// ABOUTME: Tests for Go Wish protocol definition
// ABOUTME: Verifies 36 cards and Sanders demographic schema

import { GO_WISH_PROTOCOL } from './protocol';

describe('Go Wish protocol', () => {
  it('defines exactly 36 cards', () => {
    const cards = GO_WISH_PROTOCOL.instruments[0].referenceItems;
    expect(cards).toHaveLength(36);
  });

  it('includes the Wild Card', () => {
    const cards = GO_WISH_PROTOCOL.instruments[0].referenceItems;
    expect(cards).toContain('Wild Card');
  });

  it('defines Sanders demographic fields', () => {
    const fields = GO_WISH_PROTOCOL.participantSchema;
    const fieldNames = fields.map(f => f.name);
    expect(fieldNames).toContain('age');
    expect(fieldNames).toContain('race');
    expect(fieldNames).toContain('medicalConditions');
    expect(fieldNames).toContain('education');
    expect(fieldNames).toContain('householdIncome');
    expect(fieldNames).toContain('selfAssessedHealth');
  });

  it('has correct field types', () => {
    const fields = GO_WISH_PROTOCOL.participantSchema;
    const age = fields.find(f => f.name === 'age');
    const race = fields.find(f => f.name === 'race');
    const conditions = fields.find(f => f.name === 'medicalConditions');

    expect(age?.type).toBe('number');
    expect(race?.type).toBe('select');
    expect(conditions?.type).toBe('multiselect');
  });

  it('defines a card matching strategy', () => {
    expect(GO_WISH_PROTOCOL.strategies).toHaveLength(1);
    expect(GO_WISH_PROTOCOL.strategies[0].prompt).toBeTruthy();
  });
});
