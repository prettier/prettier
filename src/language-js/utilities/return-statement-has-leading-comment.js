import hasNewlineInRange from "../../utilities/has-newline-in-range.js";
import { locEnd, locStart } from "../loc.js";
import {
  CommentCheckFlags,
  getLeftSide,
  hasComment,
  hasLeadingOwnLineComment,
  hasNakedLeftSide,
  isJsxElement,
} from "./index.js";

// This recurses the return argument, looking for the first token
// (the leftmost leaf node) and, if it (or its parents) has any
// leadingComments, returns true (so it can be wrapped in parens).
function returnArgumentHasLeadingCommentWithoutCache(node, options) {
  if (
    hasLeadingOwnLineComment(options.originalText, node) ||
    (hasComment(node, CommentCheckFlags.Leading, (comment) =>
      hasNewlineInRange(
        options.originalText,
        locStart(comment),
        locEnd(comment),
      ),
    ) &&
      !isJsxElement(node))
  ) {
    return true;
  }

  if (hasNakedLeftSide(node)) {
    let leftMost = node;
    let newLeftMost;
    while ((newLeftMost = getLeftSide(leftMost))) {
      leftMost = newLeftMost;

      if (hasLeadingOwnLineComment(options.originalText, leftMost)) {
        return true;
      }
    }
  }

  return false;
}

const cache = new WeakMap();
function returnArgumentHasLeadingComment(node, options) {
  if (!cache.has(node)) {
    cache.set(node, returnArgumentHasLeadingCommentWithoutCache(node, options));
  }

  return cache.get(node);
}

export { returnArgumentHasLeadingComment };
