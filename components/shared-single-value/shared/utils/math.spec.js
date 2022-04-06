import { mode } from './math';

describe('mode', () => {
  it('returns the element that occurs most often in the input', () => {
    expect(mode([1, 2, 3, 4, 5, 5, 5, 5, 6, 6, 6])).toEqual([5]);
  });
  it('can deal with bimodal distributions', () => {
    expect(mode([1, 2, 3, 4, 5, 5, 5, 6, 6, 6])).toEqual([5, 6]);
  });
  it('also works for strings', () => {
    expect(
      mode(['alice', 'bob', 'charlie', 'devon', 'alice', 'bob', 'alice']),
    ).toEqual(['alice']);
  });
});
