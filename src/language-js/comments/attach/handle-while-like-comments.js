import {
  addLeadingComment,
  addTrailingComment,
} from "../../../main/comments/utilities.js";
import getNextNonSpaceNonCommentCharacter from "../../../utilities/get-next-non-space-non-comment-character.js";
import { locEnd } from "../../loc.js";
import { addBlockStatementFirstComment } from "./utilities.js";

/**
@import {CommentContext} from "../handle-comments.js"
*/

/**
@param {CommentContext} param0
*/
function handleWhileLikeComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
  text,
}) {
  if (
    !(
      (enclosingNode?.type === "WhileStatement" ||
        enclosingNode?.type === "WithStatement") &&
      followingNode
    )
  ) {
    return false;
  }

  // We unfortunately have no way using the AST or location of nodes to know
  // if the comment is positioned before the condition parenthesis:
  //   while (a /* comment */) {}
  // The only workaround I found is to look at the next character to see if
  // it is a ).
  const nextCharacter = getNextNonSpaceNonCommentCharacter(
    text,
    locEnd(comment),
  );
  if (nextCharacter === ")") {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  if (followingNode.type === "BlockStatement") {
    addBlockStatementFirstComment(followingNode, comment);
    return true;
  }

  if (enclosingNode.body === followingNode) {
    addLeadingComment(followingNode, comment);
    return true;
  }

  return false;
}

export { handleWhileLikeComments };
