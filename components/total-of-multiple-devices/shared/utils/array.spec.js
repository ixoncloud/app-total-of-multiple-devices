import { sortedFindIndex } from './array';

describe('sortedFindIndex', () => {
  describe('splice ascending', () => {
    let array;
    beforeEach(() => {
      array = [0, 1, 3, 5, 9];
    });

    [
      { input: -5, output: [-5, 0, 1, 3, 5, 9] },
      { input: -1, output: [-1, 0, 1, 3, 5, 9] },
      { input: 0, output: [0, 0, 1, 3, 5, 9] },
      { input: 1, output: [0, 1, 1, 3, 5, 9] },
      { input: 2, output: [0, 1, 2, 3, 5, 9] },
      { input: 3, output: [0, 1, 3, 3, 5, 9] },
      { input: 4, output: [0, 1, 3, 4, 5, 9] },
      { input: 6, output: [0, 1, 3, 5, 6, 9] },
      { input: 11, output: [0, 1, 3, 5, 9, 11] },
    ].forEach(({ input, output }) => {
      it(`insert ${input} => [${output}]`, () => {
        const index = sortedFindIndex(array, (v) => v >= input);
        array.splice(index, 0, input);
        expect(array).toEqual(output);
      });
    });
  });

  describe('splice descending', () => {
    let array;
    beforeEach(() => {
      array = [9, 5, 3, 1, 0];
    });

    [
      { input: -5, output: [9, 5, 3, 1, 0, -5] },
      { input: -1, output: [9, 5, 3, 1, 0, -1] },
      { input: 0, output: [9, 5, 3, 1, 0, 0] },
      { input: 1, output: [9, 5, 3, 1, 1, 0] },
      { input: 2, output: [9, 5, 3, 2, 1, 0] },
      { input: 3, output: [9, 5, 3, 3, 1, 0] },
      { input: 4, output: [9, 5, 4, 3, 1, 0] },
      { input: 6, output: [9, 6, 5, 3, 1, 0] },
      { input: 11, output: [11, 9, 5, 3, 1, 0] },
    ].forEach(({ input, output }) => {
      it(`insert ${input} => [${output}]`, () => {
        const index = sortedFindIndex(array, (v) => v <= input);
        array.splice(index, 0, input);
        expect(array).toEqual(output);
      });
    });
  });

  describe('splice descending objects', () => {
    let array;
    beforeEach(() => {
      array = [{ time: 9 }, { time: 5 }, { time: 3 }, { time: 1 }, { time: 0 }];
    });

    [
      { input: { time: -5 }, output: [{ time: 9 }, { time: 5 }, { time: 3 }, { time: 1 }, { time: 0 }, { time: -5 }] },
      { input: { time: -1 }, output: [{ time: 9 }, { time: 5 }, { time: 3 }, { time: 1 }, { time: 0 }, { time: -1 }] },
      { input: { time: 0 }, output: [{ time: 9 }, { time: 5 }, { time: 3 }, { time: 1 }, { time: 0 }, { time: 0 }] },
      { input: { time: 1 }, output: [{ time: 9 }, { time: 5 }, { time: 3 }, { time: 1 }, { time: 1 }, { time: 0 }] },
      { input: { time: 2 }, output: [{ time: 9 }, { time: 5 }, { time: 3 }, { time: 2 }, { time: 1 }, { time: 0 }] },
      { input: { time: 3 }, output: [{ time: 9 }, { time: 5 }, { time: 3 }, { time: 3 }, { time: 1 }, { time: 0 }] },
      { input: { time: 4 }, output: [{ time: 9 }, { time: 5 }, { time: 4 }, { time: 3 }, { time: 1 }, { time: 0 }] },
      { input: { time: 6 }, output: [{ time: 9 }, { time: 6 }, { time: 5 }, { time: 3 }, { time: 1 }, { time: 0 }] },
      { input: { time: 11 }, output: [{ time: 11 }, { time: 9 }, { time: 5 }, { time: 3 }, { time: 1 }, { time: 0 }] },
    ].forEach(({ input, output }) => {
      it(`insert ${input.time} => [${output.map((v) => v.time)}]`, () => {
        const index = sortedFindIndex(array, (v) => v.time <= input.time);
        array.splice(index, 0, input);
        expect(array).toEqual(output);
      });
    });
  });
});
