import createTypeCheckFunction from "./create-type-check-function.js";
/**
 * @typedef {import("../types/estree.js").Comment} Comment
 */

/**
 * @param {Comment} comment
 * @returns {boolean}
 */
const isBlockComment = createTypeCheckFunction([
  "Block",
  "CommentBlock",
  // `meriyah`
  "MultiLine",
]);

export default isBlockComment;
