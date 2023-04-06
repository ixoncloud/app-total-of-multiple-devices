/**
 * The "mode" is the number that is repeated most often.
 *
 * For example, the "mode" of [3, 5, 4, 4, 1, 1, 2, 3] is [1, 3, 4].
 *
 * @param {Array} numbers An array of numbers.
 * @return {Array} The mode of the specified numbers.
 */
export function mode(numbers) {
  // as result can be bimodal or multi-modal,
  // the returned result is provided as an array
  // mode of [3, 5, 4, 4, 1, 1, 2, 3] = [1, 3, 4]
  const modes = [];
  const count = {};
  let number;
  let maxIndex = 0;
  for (let i = 0; i < numbers.length; i += 1) {
    number = numbers[i];
    count[number.toString()] = (count[number.toString()] || 0) + 1;
    if (count[number.toString()] > maxIndex) {
      maxIndex = count[number.toString()];
    }
  }
  for (const key in count) {
    if (count.hasOwnProperty(key)) {
      if (count[key] === maxIndex) {
        modes.push(Number(key) || key);
      }
    }
  }
  return modes;
}
