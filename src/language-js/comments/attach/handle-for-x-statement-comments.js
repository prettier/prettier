import { addLeadingComment } from "../../../main/comments/utilities.js";
import { locStart } from "../../location/index.js";
import { isLineComment } from "../../utilities/comment-types.js";
import { stripComments } from "../../utilities/strip-comments.js";
import { addCommentToPossibleBlockStatement } from "./utilities.js";

function handleForXStatementComments(context) {
  const { comment, enclosingNode, followingNode, options } = context;

  if (
    (enclosingNode?.type === "ForInStatement" ||
      enclosingNode?.type === "ForOfStatement" ||
      enclosingNode?.type === "ForStatement") &&
    followingNode &&
    followingNode === enclosingNode.body
  ) {
    const closingParenthesisIndex = stripComments(options).lastIndexOf(
      ")",
      locStart(followingNode),
    );

    if (locStart(comment) > closingParenthesisIndex) {
      return addLeadingComment(followingNode, comment);
    }
  }

  if (
    (enclosingNode?.type === "ForInStatement" ||
      enclosingNode?.type === "ForOfStatement") &&
    followingNode &&
    followingNode === enclosingNode.right &&
    comment.placement === "endOfLine" &&
    isLineComment(comment) &&
    enclosingNode.body &&
    enclosingNode.body.type !== "EmptyStatement"
  ) {
    return addCommentToPossibleBlockStatement(enclosingNode.body, comment);
  }

  return false;
}

export { handleForXStatementComments };
