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
    enclosingNode &&
    precedingNode &&
    !followingNode &&
    ((enclosingNode.type === "SwitchStatement" &&
      precedingNode === enclosingNode.discriminant) ||
      ((enclosingNode.type === "MatchExpression" ||
        enclosingNode.type === "MatchStatement") &&
        precedingNode === enclosingNode.argument)) &&
    enclosingNode.cases.length === 0
  ) {
    const nextCharacter = getNextNonSpaceNonCommentCharacter(
      text,
      locEnd(comment),
    );

    if (nextCharacter === "}") {
      return addDanglingComment(enclosingNode, comment);
    }
  }

  return false;
}

export { handleSwitchStatementComments };
