import { addDefaultColor } from '@/shared/migrations/add-default-color';

describe('addDefaultColor', () => {
  it('adds rainbow palette colors to all matching elements given `rules[].rule.color`', () => {
    const migrationFunc = addDefaultColor('rules[].rule.color');
    expect(
      migrationFunc({
        rules: [
          { rule: { name: 'Rule #1' } },
          { rule: { name: 'Rule #2' } },
          { rule: { name: 'Rule #3', color: 'white' } },
          { rule: { name: 'Rule #4' } },
        ],
      }),
    ).toEqual({
      rules: [
        { rule: { name: 'Rule #1', color: 'rgb(110, 64, 170)' } },
        { rule: { name: 'Rule #2', color: 'rgb(255, 94, 99)' } },
        { rule: { name: 'Rule #3', color: 'white' } },
        { rule: { name: 'Rule #4', color: 'rgb(26, 199, 194)' } },
      ],
    });
  });

  it('adds rainbow palette colors to all matching elements given `bars[].bar.color`', () => {
    const migrationFunc = addDefaultColor('bars[].bar.color');
    expect(migrationFunc({ bars: [{ bar: { name: 'Rule #1' } }, { bar: { name: 'Rule #2' } }] })).toEqual({
      bars: [
        { bar: { name: 'Rule #1', color: 'rgb(110, 64, 170)' } },
        { bar: { name: 'Rule #2', color: 'rgb(175, 240, 91)' } },
      ],
    });
  });

  it('adds rainbow palette colors to all matching elements given `lines[].line.color`', () => {
    const migrationFunc = addDefaultColor('lines[].line.color');
    expect(
      migrationFunc({
        lines: [
          { line: { name: 'Rule #1' } },
          { line: { name: 'Rule #2' } },
          { line: { name: 'Rule #3' } },
          { line: { name: 'Rule #4' } },
          { line: { name: 'Rule #5' } },
        ],
      }),
    ).toEqual({
      lines: [
        { line: { name: 'Rule #1', color: 'rgb(110, 64, 170)' } },
        { line: { name: 'Rule #2', color: 'rgb(254, 75, 131)' } },
        { line: { name: 'Rule #3', color: 'rgb(226, 183, 47)' } },
        { line: { name: 'Rule #4', color: 'rgb(82, 246, 103)' } },
        { line: { name: 'Rule #5', color: 'rgb(35, 171, 216)' } },
      ],
    });
  });

  it('adds rainbow palette colors to all matching elements given `thresholds[].threshold.color`', () => {
    const migrationFunc = addDefaultColor('thresholds[].threshold.color');
    expect(
      migrationFunc({
        thresholds: [{ threshold: { name: 'Rule #1', color: '#aabbcc' } }, { threshold: { name: 'Rule #2' } }],
      }),
    ).toEqual({
      thresholds: [
        { threshold: { name: 'Rule #1', color: '#aabbcc' } },
        { threshold: { name: 'Rule #2', color: 'rgb(175, 240, 91)' } },
      ],
    });
  });

  it('adds rainbow palette colors to all matching elements given `rows[].dataSource.rules[].rule.color`', () => {
    const migrationFunc = addDefaultColor('rows[].dataSource.rules[].rule.color');
    const inputs = {
      rows: [
        { dataSource: { rules: [{ rule: { name: 'Rule #1-1' } }, { rule: { name: 'Rule #1-2' } }] } },
        { dataSource: { rules: [{ rule: { name: 'Rule #2-1' } }, { rule: { name: 'Rule #2-2' } }] } },
      ],
    };
    const expected = {
      rows: [
        {
          dataSource: {
            rules: [
              { rule: { name: 'Rule #1-1', color: 'rgb(110, 64, 170)' } },
              { rule: { name: 'Rule #1-2', color: 'rgb(175, 240, 91)' } },
            ],
          },
        },
        {
          dataSource: {
            rules: [
              { rule: { name: 'Rule #2-1', color: 'rgb(110, 64, 170)' } },
              { rule: { name: 'Rule #2-2', color: 'rgb(175, 240, 91)' } },
            ],
          },
        },
      ],
    };
    expect(migrationFunc(inputs)).toEqual(expected);
  });
});
