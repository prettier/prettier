import escapeStringRegexp from "escape-string-regexp";

/**
 * @param {string} text
 * @param {string} searchString
 * @returns {number}
 */
function getMaxContinuousCount(text, searchString) {
  const results = text.match(
    new RegExp(`(${escapeStringRegexp(searchString)})+`, "gu"),
  );

  if (results === null) {
    return 0;
  }

  return results.reduce(
    (maxCount, result) =>
      Math.max(maxCount, result.length / searchString.length),
    0,
  );
}

export default getMaxContinuousCount;
