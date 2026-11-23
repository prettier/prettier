import {
  addLeadingComment,
  addTrailingComment,
} from "../../../main/comments/utilities.js";
import { locEnd, locStart } from "../../location/index.js";
import { stripComments } from "../../utilities/strip-comments.js";

function handleForXStatementComments({
  comment,
  enclosingNode,
  precedingNode,
  followingNode,
  options,
}) {
  if (
    (enclosingNode?.type === "ForInStatement" ||
      enclosingNode?.type === "ForOfStatement") &&
    precedingNode === enclosingNode.left &&
    followingNode === enclosingNode.right
  ) {
    const keywordIndex = stripComments(options).indexOf(
      enclosingNode.type === "ForInStatement" ? "in" : "of",
      locEnd(precedingNode),
    );

    if (locStart(comment) > keywordIndex) {
      addLeadingComment(followingNode, comment);
    } else {
      addTrailingComment(precedingNode, comment);
    }

    return true;
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
