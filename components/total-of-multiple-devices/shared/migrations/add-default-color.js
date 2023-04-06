import { interpolateRainbow } from 'd3-scale-chromatic';

/**
 * Adds a default value for the 'color' field of various components.
 *
 * Affected components:
 * - Line Graph
 * - (Live) Line Graph
 * - Multi Value
 * - Period Barchart
 * - (Live) Status
 * - Statusbar
 *
 * Not affected:
 * - (Live) Gauge because "no color" is a valid value
 * - (Live) Tank because "no color" is a valid value
 *
 * @param {string} path the path where the default color should be inserted
 * @returns {Object} (possibly) migrated inputs
 */
export function addDefaultColor(path = '') {
  if (path === 'rows[].dataSource.rules[].rule.color') {
    return (inputs) => {
      const inputsClone = JSON.parse(JSON.stringify(inputs));
      if ('rows' in inputsClone) {
        for (let i = 0; i < inputsClone.rows.length; i++) {
          const rowsItem = inputsClone.rows[i];
          if ('dataSource' in rowsItem) {
            const dataSource = rowsItem.dataSource;
            const colorset = dataSource.rules ? getSeriesColorset(dataSource.rules.length) : [];
            addFieldToItemInArray(dataSource, colorset, 'rules', 'rule');
          }
        }
      }

      return inputsClone;
    };
  } else if (path === 'rules[].rule.color') {
    return addAtTopLevel('rules', 'rule');
  } else if (path === 'bars[].bar.color') {
    return addAtTopLevel('bars', 'bar');
  } else if (path === 'lines[].line.color') {
    return addAtTopLevel('lines', 'line');
  } else if (path === 'thresholds[].threshold.color') {
    return addAtTopLevel('thresholds', 'threshold');
  }
  return (inputs) => inputs;
}

/**
 * Add 'color' to an element `second` in an array `first` in the `inputs`.
 *
 * @param first
 * @param second
 * @return {function(*=): any}
 */
function addAtTopLevel(first, second) {
  return (inputs) => {
    const inputsClone = JSON.parse(JSON.stringify(inputs));
    const colorset = inputs[first] ? getSeriesColorset(inputs[first].length) : [];
    addFieldToItemInArray(inputsClone, colorset, first, second);
    return inputsClone;
  };
}

/**
 * Add `third` with value `defaultValue` to an element `second` in an array `first` in the `inputs`.
 *
 * @param inputs the inputs
 * @param colorset an array containing the colors to use
 * @param first the key at the first level
 * @param second the key at the second level
 * @param third the key at the third level
 * @returns the modified inputs
 */
function addFieldToItemInArray(inputs, colorset, first = 'rules', second = 'rule', third = 'color') {
  if (first in inputs) {
    for (let i = 0; i < inputs[first].length; i++) {
      const rulesItem = inputs[first][i];
      if (second in rulesItem) {
        const rule = rulesItem[second];
        if (!(third in rule)) {
          rule[third] = colorset[i];
        }
      }
    }
  }
  return inputs;
}

function getSeriesColorset(dataLength) {
  var colorRange = 1 - 0;
  var intervalSize = colorRange / dataLength;
  var i, colorPoint;
  var colorArray = [];

  for (i = 0; i < dataLength; i++) {
    colorPoint = i * intervalSize;
    colorArray.push(interpolateRainbow(colorPoint));
  }

  return colorArray;
}
