import escapeStringRegexp from "escape-string-regexp";

/**
 * Calculates the minimum `n` (>= 1) where `searchString.repeat(n)` is not present in `text`.
 * @param {string} text
 * @param {string} searchString
 * @example getMinNotPresentContinuousCount("```", "`") // 1
 * @example getMinNotPresentContinuousCount("``` `", "`") // 2 (1 is occupied)
 * @example getMinNotPresentContinuousCount("``` ` ``", "`") // 4 (1-3 are occupied)
 * @returns {number} 1 if not exists, see the above example otherwise
 */
function getMinNotPresentContinuousCount(text, searchString) {
  const matches = text.match(
    new RegExp(`(${escapeStringRegexp(searchString)})+`, "g"),
  );

  if (matches === null) {
    return 1;
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
