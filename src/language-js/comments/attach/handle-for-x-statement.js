import { addLeadingComment } from "../../../main/comments/utilities.js";
import { locStart } from "../../loc.js";
import { stripComments } from "../../utilities/strip-comments.js";

function handleForXComments({
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
      addLeadingComment(enclosingNode, comment);
      return true;
    }
  }

  return false;
}

export { handleForXComments };
