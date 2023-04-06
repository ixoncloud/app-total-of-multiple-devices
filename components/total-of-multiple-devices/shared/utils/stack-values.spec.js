import { stackValues } from './stack-values';

describe('convert', () => {
  it('converts', () => {
    const input = [
      [1000, 2000, 3000, 4000, 5000], // timestamps
      [-100, 100, -125, 125, 0, 100, -100],
      [-200, 200, -75, 75, 0, -150, 150],
    ];

    const result = stackValues(input, 7, 2);

    expect(result).toHaveSize(2);
    expect(result[0].y0).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(result[0].y1).toEqual([-100, 100, -125, 125, 0, 100, -100]);
    expect(result[1].y0).toEqual([-100, 100, -125, 125, 0, 0, 0]);
    expect(result[1].y1).toEqual([-300, 300, -200, 200, 0, -150, 150]);
  });

  it('specific case', () => {
    const data = [
      [4000, 5000], // timestamps
      [100, -100],
      [-150, 150],
      [150, -150],
      [-50, 50],
    ];
    const dataPointCount = data[0].length;
    const seriesCount = data.length - 1;

    const result = stackValues(data, dataPointCount, seriesCount);

    expect(result).toHaveSize(4);
    expect(result[0].y0).toEqual([0, 0]);
    expect(result[0].y1).toEqual([100, -100]);
    expect(result[1].y0).toEqual([0, 0]);
    expect(result[1].y1).toEqual([-150, 150]);
    expect(result[2].y0).toEqual([100, -100]);
    expect(result[2].y1).toEqual([250, -250]);
    expect(result[3].y0).toEqual([-150, 150]);
    expect(result[3].y1).toEqual([-200, 200]);
  });
});
