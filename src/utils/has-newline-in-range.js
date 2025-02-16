/**
 * @param {string} text
 * @param {number} startIndex
 * @param {number} endIndex
 * @returns {boolean}
 */
function hasNewlineInRange(text, startIndex, endIndex) {
  if (startIndex > endIndex) {
    [startIndex, endIndex] = [endIndex, startIndex];
  }

  startIndex = Math.max(0, startIndex);
  endIndex = Math.min(text.length, endIndex);

  for (let index = startIndex; index < endIndex; index++) {
    if (text.charAt(index) === "\n") {
      return true;
    }
  }
  return false;
}

export default hasNewlineInRange;
