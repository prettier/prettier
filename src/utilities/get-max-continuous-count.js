import escapeStringRegexp from "escape-string-regexp";

/**
 * @param {string} text
 * @param {string} searchString
 * @returns {number}
 */
function getMaxContinuousCount(text, searchString) {
  let results = text.matchAll(
    new RegExp(`(?:${escapeStringRegexp(searchString)})+`, "gu"),
  );

  // TODO: Use `Iterator#reduce` when we drop support for Node.js < 22
  if (!results.reduce) {
    // @ts-expect-error -- Safe
    results = [...results];
  }

  return (
    results.reduce(
      (maxCount, [result]) => Math.max(maxCount, result.length),
      0,
    ) / searchString.length
  );
}

export default getMaxContinuousCount;
