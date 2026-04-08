/**
 * @param {string} text
 * @param {number} startIndex
 * @param {number} endIndex
 * @returns {boolean}
 */
function hasNewlineInRange(text, startIndex, endIndex) {
  for (let i = startIndex; i < endIndex; ++i) {
    if (text.charAt(i) === "\n") {
      return true;
    }
  }
  return false;
}

export default hasNewlineInRange;
