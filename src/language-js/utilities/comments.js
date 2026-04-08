import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { isBlockComment, isLineComment } from "./comment-types.js";
import { isPrettierIgnoreComment } from "./is-prettier-ignore-comment.js";

/**
@import {
  Node,
  Comment,
} from "../types/estree.js";
@import AstPath from "../../common/ast-path.js";
*/

/** @enum {number} */
const CommentCheckFlags = {
  /** Check comment is a leading comment */
  Leading: 1 << 1,
  /** Check comment is a trailing comment */
  Trailing: 1 << 2,
  /** Check comment is a dangling comment */
  Dangling: 1 << 3,
  /** Check comment is a block comment */
  Block: 1 << 4,
  /** Check comment is a line comment */
  Line: 1 << 5,
  /** Check comment is a `prettier-ignore` comment */
  PrettierIgnore: 1 << 6,
  /** Check comment is the first attached comment */
  First: 1 << 7,
  /** Check comment is the last attached comment */
  Last: 1 << 8,
};

const getCommentTestFunction = (flags, fn) => {
  if (typeof flags === "function") {
    fn = flags;
    flags = 0;
  }
  if (flags || fn) {
    return (comment, index, comments) =>
      !(
        (flags & CommentCheckFlags.Leading && !comment.leading) ||
        (flags & CommentCheckFlags.Trailing && !comment.trailing) ||
        (flags & CommentCheckFlags.Dangling &&
          (comment.leading || comment.trailing)) ||
        (flags & CommentCheckFlags.Block && !isBlockComment(comment)) ||
        (flags & CommentCheckFlags.Line && !isLineComment(comment)) ||
        (flags & CommentCheckFlags.First && index !== 0) ||
        (flags & CommentCheckFlags.Last && index !== comments.length - 1) ||
        (flags & CommentCheckFlags.PrettierIgnore &&
          !isPrettierIgnoreComment(comment)) ||
        (fn && !fn(comment))
      );
  }
};
/**
 * @param {Node} node
 * @param {number | ((comment: Comment) => boolean)} [flags]
 * @param {(comment: Comment) => boolean} [fn]
 * @returns {boolean}
 */
function hasComment(node, flags, fn) {
  if (!isNonEmptyArray(node?.comments)) {
    return false;
  }
  const test = getCommentTestFunction(flags, fn);
  return test ? node.comments.some(test) : true;
}

/**
 * @param {Node} node
 * @param {number | ((comment: Comment) => boolean)} [flags]
 * @param {(comment: Comment) => boolean} [fn]
 * @returns {Comment[]}
 */
function getComments(node, flags, fn) {
  if (!Array.isArray(node?.comments)) {
    return [];
  }
  const test = getCommentTestFunction(flags, fn);
  return test ? node.comments.filter(test) : node.comments;
}

export { CommentCheckFlags, getComments, hasComment };
