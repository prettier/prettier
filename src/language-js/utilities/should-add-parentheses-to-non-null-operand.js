import hasNewline from "../../utilities/has-newline.js";
import hasNewlineInRange from "../../utilities/has-newline-in-range.js";
import { locEnd, locStart } from "../location/index.js";
import { isBlockComment } from "./comment-types.js";
import { CommentCheckFlags, hasComment } from "./comments.js";
import { hasNodeIgnoreComment } from "./has-node-ignore-comment.js";
import { isJsxElement } from "./node-types.js";

function shouldAddParenthesesToNonNullOperand(path, options) {
  const { node, key, parent } = path;

  if (key !== "expression" || parent.type !== "TSNonNullExpression") {
    return false;
  }

  if (isJsxElement(node) || hasNodeIgnoreComment(node)) {
    return false;
  }

  return hasComment(
    node,
    CommentCheckFlags.Trailing,
    (comment) =>
      isBlockComment(comment) &&
      hasNewlineInRange(
        options.originalText,
        locStart(comment),
        locEnd(comment),
      ) &&
      !hasNewline(options.originalText, locStart(comment), {
        backwards: true,
      }),
  );
}

export { shouldAddParenthesesToNonNullOperand };
