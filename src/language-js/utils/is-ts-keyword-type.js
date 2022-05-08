/**
 * @returns {boolean}
 */
function isTsKeywordType({ type }) {
  return type.startsWith("TS") && type.endsWith("Keyword");
}

export default isTsKeywordType;
