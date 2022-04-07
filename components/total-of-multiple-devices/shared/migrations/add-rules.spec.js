import { addRules } from '@/shared/migrations/add-rules';

describe('addRules', () => {
  it('adds an empty rules array', () => {
    const inputs = { header: { title: 'test', subtitle: 'test2' } };
    const actual = addRules(inputs);
    expect(actual).toEqual({
      header: { title: 'test', subtitle: 'test2' },
      rules: [],
    });
  });

  it('does not change existing rules', () => {
    const inputs = {
      header: { title: 'test', subtitle: 'test2' },
      rules: [{ rule: 'one' }, { rule: 'two' }],
    };
    const actual = addRules(inputs);
    expect(actual).toEqual(inputs);
  });
});
