import { addLeadingComment } from "../../../main/comments/utilities.js";
import { locEnd, locStart } from "../../location/index.js";
import { isLineComment } from "../../utilities/comment-types.js";
import { stripComments } from "../../utilities/strip-comments.js";
import { addCommentToPossibleBlockStatement } from "./utilities.js";

function handleForXStatementComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
  options,
}) {
  if (
    (enclosingNode?.type === "ForInStatement" ||
      enclosingNode?.type === "ForOfStatement") &&
    isLineComment(comment) &&
    precedingNode === enclosingNode.left &&
    followingNode === enclosingNode.right &&
    enclosingNode.body.type !== "EmptyStatement"
  ) {
    const keywordIndex = stripComments(options).indexOf(
      enclosingNode.type === "ForOfStatement" ? "of" : "in",
      locEnd(precedingNode),
    );

    if (locEnd(comment) <= keywordIndex) {
      return addCommentToPossibleBlockStatement(enclosingNode.body, comment);
    }
  }

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

  return false;
}

export { handleForXStatementComments };
