import escapeStringRegexp from "escape-string-regexp";

/**
 * @param {string} text
 * @param {string} searchString
 * @returns {number}
 */
function getMaxContinuousCount(text, searchString) {
  const results = text.matchAll(
    new RegExp(`(?<result>(?:${escapeStringRegexp(searchString)})+)`, "gu"),
  );

  return results.reduce(
    (maxCount, { groups: { result } }) =>
      Math.max(maxCount, result.length / searchString.length),
    0,
  );
}

export default getMaxContinuousCount;
