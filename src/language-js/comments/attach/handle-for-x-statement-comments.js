import {
  addLeadingComment,
  addTrailingComment,
} from "../../../main/comments/utilities.js";
import { locStart } from "../../location/index.js";
import { stripComments } from "../../utilities/strip-comments.js";

function handleForXStatementComments({
  comment,
  enclosingNode,
  followingNode,
  options,
}) {
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
      addLeadingComment(followingNode, comment);
      return true;
    }
  }

  return false;
}

/*
The head of a for-in or for-of statement has no line to put an own line comment
on, so printing one moves it to the end of the line anyway. Attaching it to
`left` gets there in one format instead of two.
*/
function handleForXStatementHeadComments({
  comment,
  enclosingNode,
  precedingNode,
  followingNode,
}) {
  if (
    (enclosingNode?.type === "ForInStatement" ||
      enclosingNode?.type === "ForOfStatement") &&
    precedingNode === enclosingNode.left &&
    followingNode === enclosingNode.right
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  return false;
}

export { handleForXStatementComments, handleForXStatementHeadComments };
