import createTypeCheckFunction from "./create-type-check-function.js";
/**
 * @import {Comment} from "../types/estree.js"
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
