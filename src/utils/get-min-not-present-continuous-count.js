import escapeStringRegexp from "escape-string-regexp";

/**
 * @param {string} text
 * @param {string} searchString
 * @returns {number}
 */
function getMinNotPresentContinuousCount(text, searchString) {
  const matches = text.match(
    new RegExp(`(${escapeStringRegexp(searchString)})+`, "gu"),
  );

  if (matches === null) {
    return 0;
  }

  const countPresent = new Map();
  let max = 0;

  for (const match of matches) {
    const count = match.length / searchString.length;
    countPresent.set(count, true);
    if (count > max) {
      max = count;
    }
  }

  for (let i = 1; i < max; i++) {
    if (!countPresent.get(i)) {
      return i;
    }
  }

  return max + 1;
}

export default getMinNotPresentContinuousCount;
