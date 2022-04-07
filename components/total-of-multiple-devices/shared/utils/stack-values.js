import { times } from 'lodash-es';

/**
 * Converts data into y0/y1 array pairs. Each bar gets such a pair of Y values.
 * The value in the y0 array denotes the start of a bar, the value in the y1
 * array denotes the end of a bar.
 *
 * When stacking bars, one must take into account the 'sign' of the value.
 * If it's positive, it should go on top of all previous positive bars. If it's
 * negative, it should go below all previous negative bars.
 *
 * @param data
 * @param dataPointCount the number of data points in `data`
 * @param seriesCount the number of series in `data`
 * @return {Array}
 */
export function stackValues(data, dataPointCount, seriesCount) {
  return times(seriesCount, (sidx) => {
    const stackValues = (didx) =>
      data
        // take values for one bar
        .map((d) => d[didx])
        // look only at already stacked values
        .slice(1, sidx + 1)
        // add together all values of the same sign as the value we're looking at
        .reduce((acc, e) => (Math.sign(data[sidx + 1][didx]) === Math.sign(e) ? acc + e : acc), 0);

    return {
      // represent the starts of the bars
      y0: times(dataPointCount, stackValues),
      // represent the ends of the bars
      y1: times(dataPointCount, (didx) => stackValues(didx) + data[sidx + 1][didx]),
    };
  });
}
