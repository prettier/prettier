import getAlignmentSize from "./get-alignment-size.js";

/**
 * @param {string} value
 * @param {number} tabWidth
 * @returns {number}
 */
function getIndentSize(value, tabWidth) {
  const lastNewlineIndex = value.lastIndexOf("\n");
  /* c8 ignore next 3 */
  if (lastNewlineIndex === -1) {
    return 0;
  }

  return getAlignmentSize(
    /^(?<leadingSpace>[\t ]*)/.exec(value.slice(lastNewlineIndex + 1)).groups
      .leadingSpace,
    tabWidth,
  );
}

export default getIndentSize;
