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
import { isEnumBody } from "../../utilities/node-types.js";

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
@param {Node} node
@returns {true}
*/
function addCommentToPossibleBlockStatement(node, comment) {
  if (node.type === "BlockStatement") {
    return addBlockFirstComment(node, comment);
  }

  return addLeadingComment(node, comment);
}

/**
@param {
  | NodeMap["BlockStatement"]
  | NodeMap["ClassBody"]
  | NodeMap["TSInterfaceBody"]
  | NodeMap["TSModuleBlock"]
  | NodeMap["ObjectTypeAnnotation"]
  | NodeMap["TSEnumBody"]
  | NodeMap["EnumDeclaration"]["body"]
} node
@returns {true}
*/
function addBlockFirstComment(node, comment) {
  let child;

  // eslint-disable-next-line unicorn/prefer-switch
  if (node.type === "BlockStatement" || node.type === "TSModuleBlock") {
    child = node.body.find(({ type }) => type !== "EmptyStatement");
  } else if (node.type === "ClassBody" || node.type === "TSInterfaceBody") {
    child = node.body[0];
  } else if (node.type === "ObjectTypeAnnotation") {
    child = node.properties[0];
  } else if (isEnumBody(node)) {
    child = node.members[0];
  }

  if (child) {
    addLeadingComment(child, comment);
  } else {
    addDanglingComment(node, comment);
  }

  return true;
}

export {
  addBlockFirstComment,
  addCommentToPossibleBlockStatement,
  isSingleLineBlockComment,
  isSingleLineComment,
};
