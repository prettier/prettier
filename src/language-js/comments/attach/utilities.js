import {
  addDanglingComment,
  addLeadingComment,
} from "../../../main/comments/utilities.js";
import hasNewlineInRange from "../../../utilities/has-newline-in-range.js";
import { locEnd, locStart } from "../../location/index.js";
import {
  isBlockComment,
  isLineComment,
} from "../../utilities/comment-types.js";

/**
@import {Node, Comment, NodeMap} from "../../types/estree.js";
*/

/**
@param {Comment} comment
@param {string} text
@returns {boolean}
*/
const isSingleLineBlockComment = (comment, text) =>
  isBlockComment(comment) &&
  !hasNewlineInRange(text, locStart(comment), locEnd(comment));

/**
@param {Comment} comment
@param {string} text
@returns {boolean}
*/
const isSingleLineComment = (comment, text) =>
  isLineComment(comment) || isSingleLineBlockComment(comment, text);

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
@param {NodeMap["BlockStatement"]} node
@returns {true}
*/
function addBlockStatementFirstComment(node, comment) {
  const firstNonEmptyNode = node.body.find(
    ({ type }) => type !== "EmptyStatement",
  );
  if (firstNonEmptyNode) {
    addLeadingComment(firstNonEmptyNode, comment);
  } else {
    addDanglingComment(node, comment);
  }

  return true;
}

/**
@param {
  | NodeMap["TSEnumBody"]
  | NodeMap["EnumBody"]
  | NodeMap["EnumBooleanBody"]
  | NodeMap["EnumNumberBody"]
  | NodeMap["EnumBigIntBody"]
  | NodeMap["EnumStringBody"]
  | NodeMap["EnumSymbolBody"]
} node
@param {Comment} comment
@returns {true}
*/
function addEnumBodyFirstComment(node, comment) {
  if (node.members.length > 0) {
    addLeadingComment(node.members[0], comment);
  } else {
    addDanglingComment(node, comment);
  }

  return true;
}

export {
  addBlockOrNotComment,
  addBlockStatementFirstComment,
  addEnumBodyFirstComment,
  isSingleLineBlockComment,
  isSingleLineComment,
};
