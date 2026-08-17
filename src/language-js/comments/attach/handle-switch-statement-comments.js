import { addDanglingComment } from "../../../main/comments/utilities.js";
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
  if (
    enclosingNode?.type !== "SwitchStatement" ||
    precedingNode !== enclosingNode.discriminant
  ) {
    return false;
  }

  const nextCharacter = getNextNonSpaceNonCommentCharacter(
    text,
    locEnd(comment),
  );

  // Between the discriminant and the body, where every other block statement
  // keeps it: `switch (a) /* comment */ {`. Without this the comment attaches
  // to the discriminant and is printed inside the parentheses.
  if (nextCharacter === "{") {
    addDanglingComment(enclosingNode, comment, "body");
    return true;
  }

  if (
    nextCharacter === "}" &&
    enclosingNode.cases.length === 0 &&
    !followingNode
  ) {
    addDanglingComment(enclosingNode, comment);
    return true;
  }

  return false;
}

export { handleSwitchStatementComments };
