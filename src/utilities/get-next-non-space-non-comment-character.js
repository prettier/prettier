import getNextNonSpaceNonCommentCharacterIndex from "./get-next-non-space-non-comment-character-index.js";

/**
 * @param {string} text
 * @param {number} startIndex
 * @returns {string}
 */
function getNextNonSpaceNonCommentCharacter(text, startIndex) {
  const index = getNextNonSpaceNonCommentCharacterIndex(text, startIndex);
  return index === false ? "" : text.charAt(index);
}

export default getNextNonSpaceNonCommentCharacter;
