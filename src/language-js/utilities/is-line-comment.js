import createTypeCheckFunction from "./create-type-check-function.js";

/**
 * @import {Comment} from "../types/estree.js"
 */

/**
 * @param {Comment} comment
 * @returns {boolean}
 */
const isLineComment = createTypeCheckFunction([
  "Line",
  "CommentLine",
  // `meriyah` has `SingleLine`, `HashbangComment`, `HTMLOpen`, and `HTMLClose`
  "SingleLine",
  "HashbangComment",
  "HTMLOpen",
  "HTMLClose",
  // `espree`, and `oxc`(with `{astType: 'ts'}`)
  "Hashbang",
  // `babel` and `flow` hashbang
  "InterpreterDirective",
]);

export default isLineComment;
