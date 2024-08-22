/** @typedef {import("../builders.js").Doc} Doc */

/**
 * This class is a wrapper around an array that provides optimized subset of methods
 * - constructor(array) - creates a new instance of the class with the given array with O(1) complexity
 * - get length() - returns the length of the list with O(1) complexity
 * - at(index) - returns the element at the given index with O(1) complexity
 * - slice(start) - returns a new instance of the class with the underlying array sliced from the given index with O(1) complexity without changing the original list
 */
class ListOptimizedToPrintFill {
  /** @param {Doc[]} array */
  constructor(array) {
    this.underlyingArray = array;
    this.indexOffset = 0;
  }

  /** @returns {number} */
  get length() {
    return this.underlyingArray.length - this.indexOffset;
  }

  /**
   * @param {number} index negative index is not supported (undefined behavior)
   * @returns {Doc | undefined}
   */
  at(index) {
    return this.underlyingArray[index + this.indexOffset];
  }

  /**
   * @param {number} start
   * @returns {ListOptimizedToPrintFill}
   */
  slice(start) {
    const clone = new ListOptimizedToPrintFill(this.underlyingArray);
    clone.indexOffset = this.indexOffset + start;
    return clone;
  }
}

export { ListOptimizedToPrintFill };
