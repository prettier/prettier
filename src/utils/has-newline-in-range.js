function validateIndex(value, name) {
  if (Number.isInteger(value) && value >= 0) {
    return;
  }

  throw new TypeError(
    `Expected "${name}" to be zero or a positive integer. Received "${value}".`,
  );
}

/**
 * @param {string} text
 * @param {number} startIndex
 * @param {number} endIndex
 * @returns {boolean}
 */
function hasNewlineInRange(text, startIndex, endIndex) {
  if (typeof text !== "string") {
    throw new TypeError(
      `Expected "text" to be string. Received type "${typeof text}".`,
    );
  }

  validateIndex(startIndex, "startIndex");
  validateIndex(endIndex, "endIndex");

  if (startIndex > endIndex) {
    throw new TypeError(
      '"startIndex" should be less or equal than "endIndex".',
    );
  }

  for (let index = startIndex; index < endIndex; index++) {
    if (text.charAt(index) === "\n") {
      return true;
    }
  }
  return false;
}

export default hasNewlineInRange;
