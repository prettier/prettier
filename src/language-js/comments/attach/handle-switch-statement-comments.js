import {
  addDanglingComment,
  addLeadingComment,
  addTrailingComment,
} from "../../../main/comments/utilities.js";
import getNextNonSpaceNonCommentCharacter from "../../../utilities/get-next-non-space-non-comment-character.js";
import { locEnd } from "../../location/index.js";

/**
@import {CommentContext} from "../handle-comments.js"
*/

/**
@param {CommentContext} param0
*/
function handleSwitchStatementComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
  text,
}) {
  if (!(
    enclosingNode?.type === "SwitchStatement" &&
    enclosingNode.cases.length === 0 &&
    !followingNode &&
    precedingNode === enclosingNode.discriminant
  )) {
    return false;
  }

  const nextCharacter = getNextNonSpaceNonCommentCharacter(
    text,
    locEnd(comment),
  );

  if (nextCharacter !== ")") {
    addDanglingComment(enclosingNode, comment);
    return true;
  }

  return false;
}

export { handleSwitchStatementComments };
