/**
 * Binary search version of Array.prototype.findIndex(). The sortedFindIndex() method returns the index of the first
 * element in the array that satisfies the provided testing function. Otherwise, it returns -1, indicating that no
 * element passed the test. The assumption is that the predicate is false for a contiguous segment of array, then
 * becomes true for the rest of the array. The binary search algorithm finds the turnover point.
 *
 * @param array an array that is sorted such that the predicate returns false for a contiguous segment of array and true for the rest of the array
 * @param predicate a predicate which returns false for all indices before the one to be found, and true for all indices after (and including) the one to be found
 * @returns the first index of the array for which the predicate is true
 */
export function sortedFindIndex(array, predicate) {
  let s = 0;
  let e = array.length - 1;

  while (s <= e) {
    const h = Math.floor((e + s) / 2);
    if (predicate(array[h])) {
      e = h - 1;
    } else {
      s = h + 1;
    }
  }

  return e + 1;
}
