import hasNewline from "../../utilities/has-newline.js";
import hasNewlineInRange from "../../utilities/has-newline-in-range.js";
import { locEnd, locStart } from "../location/index.js";
import { isBlockComment } from "./comment-types.js";
import { CommentCheckFlags, hasComment } from "./comments.js";
import { isJsxElement } from "./node-types.js";

function shouldAddParenthesesToNonNullOperand(node, options) {
  return (
    !isJsxElement(node) &&
    hasComment(
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
    )
  );
}

export { shouldAddParenthesesToNonNullOperand };
