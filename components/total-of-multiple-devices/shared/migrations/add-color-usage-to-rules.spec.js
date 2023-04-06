import { addColorUsageToRules } from '@/shared/migrations/add-color-usage-to-rules';

describe('addColorUsageToRules', () => {
  it('accepts missing rules', () => {
    const input = {};
    const expected = {};
    const actual = addColorUsageToRules(input);
    expect(actual).toEqual(expected);
  });

  it('accepts empty rules', () => {
    const input = { rules: [] };
    const expected = { rules: [] };
    const actual = addColorUsageToRules(input);
    expect(actual).toEqual(expected);
  });

  it('adds colorUsage to all entries in rules', () => {
    const input = {
      rules: [
        { rule: { label: 'first' } },
        {
          rule: {
            label: 'second',
          },
        },
      ],
    };
    const expected = {
      rules: [{ rule: { label: 'first', colorUsage: 'text' } }, { rule: { label: 'second', colorUsage: 'text' } }],
    };
    const actual = addColorUsageToRules(input);
    expect(actual).toEqual(expected);
  });

  it('does not change existing colorUsage in rules', () => {
    const input = {
      rules: [
        { rule: { colorUsage: 'background', label: 'first' } },
        { rule: { colorUsage: 'text', label: 'second' } },
        { rule: { label: 'third' } },
      ],
    };
    const expected = {
      rules: [
        { rule: { label: 'first', colorUsage: 'background' } },
        { rule: { label: 'second', colorUsage: 'text' } },
        { rule: { label: 'third', colorUsage: 'text' } },
      ],
    };
    const actual = addColorUsageToRules(input);
    expect(actual).toEqual(expected);
  });
});
