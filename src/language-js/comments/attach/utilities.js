import {
  addDanglingComment,
  addLeadingComment,
} from "../../../main/comments/utilities.js";
import hasNewlineInRange from "../../../utilities/has-newline-in-range.js";
import { locEnd, locStart } from "../../loc.js";
import { isLineComment } from "../../utilities/is-line-comment.js";

/**
@import {Node, Comment, NodeMap} from "../../types/estree.js";
*/

/**
@param {Comment} comment
@param {string} text
@returns {boolean}
*/
const isSingleLineComment = (comment, text) =>
  isLineComment(comment) ||
  !hasNewlineInRange(text, locStart(comment), locEnd(comment));

/**
 * @param {Node} node
 * @returns {void}
 */
function addBlockOrNotComment(node, comment) {
  if (node.type === "BlockStatement") {
    addBlockStatementFirstComment(node, comment);
  } else {
    addLeadingComment(node, comment);
  }
}

/**
 * @param {Node} node
 * @returns {void}
 */
function addBlockStatementFirstComment(node, comment) {
  // @ts-expect-error
  const firstNonEmptyNode = (node.body || node.properties).find(
    ({ type }) => type !== "EmptyStatement",
  );
  if (firstNonEmptyNode) {
    addLeadingComment(firstNonEmptyNode, comment);
  } else {
    addDanglingComment(node, comment);
  }
}

export {
  addBlockOrNotComment,
  addBlockStatementFirstComment,
  isSingleLineComment,
};
