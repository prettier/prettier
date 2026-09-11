import { addLeadingComment } from "../../../main/comments/utilities.js";
import { locEnd, locStart } from "../../location/index.js";
import { stripComments } from "../../utilities/strip-comments.js";

function handleForXStatementComments({
  comment,
  enclosingNode,
  followingNode,
  options,
}) {
  if (
    (enclosingNode?.type === "ForInStatement" ||
      enclosingNode?.type === "ForOfStatement") &&
    followingNode === enclosingNode.right &&
    locStart(comment) >
      stripComments(options).indexOf(
        enclosingNode.type === "ForOfStatement" ? "of" : "in",
        locEnd(enclosingNode.left),
      )
  ) {
    addLeadingComment(followingNode, comment);
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
      addLeadingComment(followingNode, comment);
      return true;
    }
  }

  return false;
}

export { handleForXStatementComments };
