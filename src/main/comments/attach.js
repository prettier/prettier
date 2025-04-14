import assert from "node:assert";
import { getChildren } from "../../utils/ast-utils.js";
import hasNewline from "../../utils/has-newline.js";
import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import createGetVisitorKeysFunction from "../create-get-visitor-keys-function.js";
import {
  addDanglingComment,
  addLeadingComment,
  addTrailingComment,
} from "./utils.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 */

const childNodesCache = new WeakMap();
function getSortedChildNodes(node, options) {
  if (childNodesCache.has(node)) {
    return childNodesCache.get(node);
  }

  const {
    printer: {
      getCommentChildNodes,
      canAttachComment,
      getVisitorKeys: printerGetVisitorKeys,
    },
    locStart,
    locEnd,
  } = options;

  if (!canAttachComment) {
    return [];
  }

  const childNodes = (
    getCommentChildNodes?.(node, options) ?? [
      ...getChildren(node, {
        getVisitorKeys: createGetVisitorKeysFunction(printerGetVisitorKeys),
      }),
    ]
  ).flatMap((node) =>
    canAttachComment(node) ? [node] : getSortedChildNodes(node, options),
  );
  // Sort by `start` location first, then `end` location
  childNodes.sort(
    (nodeA, nodeB) =>
      locStart(nodeA) - locStart(nodeB) || locEnd(nodeA) - locEnd(nodeB),
  );

  childNodesCache.set(node, childNodes);
  return childNodes;
}

// As efficiently as possible, decorate the comment object with
// .precedingNode, .enclosingNode, and/or .followingNode properties, at
// least one of which is guaranteed to be defined.
function decorateComment(node, comment, options, enclosingNode) {
  const { locStart, locEnd } = options;
  const commentStart = locStart(comment);
  const commentEnd = locEnd(comment);

  const childNodes = getSortedChildNodes(node, options);
  let precedingNode;
  let followingNode;
  // Time to dust off the old binary search robes and wizard hat.
  let left = 0;
  let right = childNodes.length;
  while (left < right) {
    const middle = (left + right) >> 1;
    const child = childNodes[middle];
    const start = locStart(child);
    const end = locEnd(child);

    // The comment is completely contained by this child node.
    if (start <= commentStart && commentEnd <= end) {
      // Abandon the binary search at this level.
      return decorateComment(child, comment, options, child);
    }

    if (end <= commentStart) {
      // This child node falls completely before the comment.
      // Because we will never consider this node or any nodes
      // before it again, this node must be the closest preceding
      // node we have encountered so far.
      precedingNode = child;
      left = middle + 1;
      continue;
    }

    if (commentEnd <= start) {
      // This child node falls completely after the comment.
      // Because we will never consider this node or any nodes after
      // it again, this node must be the closest following node we
      // have encountered so far.
      followingNode = child;
      right = middle;
      continue;
    }

    /* c8 ignore next */
    throw new Error("Comment location overlaps with node location");
  }

  // We don't want comments inside of different expressions inside of the same
  // template literal to move to another expression.
  if (enclosingNode?.type === "TemplateLiteral") {
    const { quasis } = enclosingNode;
    const commentIndex = findExpressionIndexForComment(
      quasis,
      comment,
      options,
    );

    if (
      precedingNode &&
      findExpressionIndexForComment(quasis, precedingNode, options) !==
        commentIndex
    ) {
      precedingNode = null;
    }
    if (
      followingNode &&
      findExpressionIndexForComment(quasis, followingNode, options) !==
        commentIndex
    ) {
      followingNode = null;
    }
  }

  return { enclosingNode, precedingNode, followingNode };
}

const returnFalse = () => false;
function attachComments(ast, options) {
  const { comments } = ast;
  delete ast.comments;

  if (!isNonEmptyArray(comments) || !options.printer.canAttachComment) {
    return;
  }

  const tiesToBreak = [];
  const {
    printer: {
      experimentalFeatures: {
        // TODO: Make this as default behavior
        avoidAstMutation = false,
      } = {},
      handleComments = {},
    },
    originalText: text,
  } = options;
  const {
    ownLine: handleOwnLineComment = returnFalse,
    endOfLine: handleEndOfLineComment = returnFalse,
    remaining: handleRemainingComment = returnFalse,
  } = handleComments;

  const decoratedComments = comments.map((comment, index) => ({
    ...decorateComment(ast, comment, options),
    comment,
    text,
    options,
    ast,
    isLastComment: comments.length - 1 === index,
  }));

  for (const [index, context] of decoratedComments.entries()) {
    const {
      comment,
      precedingNode,
      enclosingNode,
      followingNode,
      text,
      options,
      ast,
      isLastComment,
    } = context;

    let args;
    if (avoidAstMutation) {
      args = [context];
    } else {
      comment.enclosingNode = enclosingNode;
      comment.precedingNode = precedingNode;
      comment.followingNode = followingNode;
      args = [comment, text, options, ast, isLastComment];
    }

    if (isOwnLineComment(text, options, decoratedComments, index)) {
      comment.placement = "ownLine";
      // If a comment exists on its own line, prefer a leading comment.
      // We also need to check if it's the first line of the file.
      if (handleOwnLineComment(...args)) {
        // We're good
      } else if (followingNode) {
        // Always a leading comment.
        addLeadingComment(followingNode, comment);
      } else if (precedingNode) {
        addTrailingComment(precedingNode, comment);
      } else if (enclosingNode) {
        addDanglingComment(enclosingNode, comment);
      } else {
        // There are no nodes, let's attach it to the root of the ast
        /* c8 ignore next */
        addDanglingComment(ast, comment);
      }
    } else if (isEndOfLineComment(text, options, decoratedComments, index)) {
      comment.placement = "endOfLine";
      if (handleEndOfLineComment(...args)) {
        // We're good
      } else if (precedingNode) {
        // There is content before this comment on the same line, but
        // none after it, so prefer a trailing comment of the previous node.
        addTrailingComment(precedingNode, comment);
      } else if (followingNode) {
        addLeadingComment(followingNode, comment);
      } else if (enclosingNode) {
        addDanglingComment(enclosingNode, comment);
      } else {
        // There are no nodes, let's attach it to the root of the ast
        /* c8 ignore next */
        addDanglingComment(ast, comment);
      }
    } else {
      comment.placement = "remaining";
      if (handleRemainingComment(...args)) {
        // We're good
      } else if (precedingNode && followingNode) {
        // Otherwise, text exists both before and after the comment on
        // the same line. If there is both a preceding and following
        // node, use a tie-breaking algorithm to determine if it should
        // be attached to the next or previous node. In the last case,
        // simply attach the right node;
        const tieCount = tiesToBreak.length;
        if (tieCount > 0) {
          const lastTie = tiesToBreak[tieCount - 1];
          if (lastTie.followingNode !== followingNode) {
            breakTies(tiesToBreak, options);
          }
        }
        tiesToBreak.push(context);
      } else if (precedingNode) {
        addTrailingComment(precedingNode, comment);
      } else if (followingNode) {
        addLeadingComment(followingNode, comment);
      } else if (enclosingNode) {
        addDanglingComment(enclosingNode, comment);
      } else {
        // There are no nodes, let's attach it to the root of the ast
        /* c8 ignore next */
        addDanglingComment(ast, comment);
      }
    }
  }

  breakTies(tiesToBreak, options);

  if (!avoidAstMutation) {
    for (const comment of comments) {
      // These node references were useful for breaking ties, but we
      // don't need them anymore, and they create cycles in the AST that
      // may lead to infinite recursion if we don't delete them here.
      delete comment.precedingNode;
      delete comment.enclosingNode;
      delete comment.followingNode;
    }
  }
}

const isAllEmptyAndNoLineBreak = (text) => !/[\S\n\u2028\u2029]/u.test(text);
function isOwnLineComment(text, options, decoratedComments, commentIndex) {
  const { comment, precedingNode } = decoratedComments[commentIndex];
  const { locStart, locEnd } = options;
  let start = locStart(comment);

  if (precedingNode) {
    // Find first comment on the same line
    for (let index = commentIndex - 1; index >= 0; index--) {
      const { comment, precedingNode: currentCommentPrecedingNode } =
        decoratedComments[index];
      if (
        currentCommentPrecedingNode !== precedingNode ||
        !isAllEmptyAndNoLineBreak(text.slice(locEnd(comment), start))
      ) {
        break;
      }
      start = locStart(comment);
    }
  }

  return hasNewline(text, start, { backwards: true });
}

function isEndOfLineComment(text, options, decoratedComments, commentIndex) {
  const { comment, followingNode } = decoratedComments[commentIndex];
  const { locStart, locEnd } = options;
  let end = locEnd(comment);

  if (followingNode) {
    // Find last comment on the same line
    for (
      let index = commentIndex + 1;
      index < decoratedComments.length;
      index++
    ) {
      const { comment, followingNode: currentCommentFollowingNode } =
        decoratedComments[index];
      if (
        currentCommentFollowingNode !== followingNode ||
        !isAllEmptyAndNoLineBreak(text.slice(end, locStart(comment)))
      ) {
        break;
      }
      end = locEnd(comment);
    }
  }

  return hasNewline(text, end);
}

function breakTies(tiesToBreak, options) {
  const tieCount = tiesToBreak.length;
  if (tieCount === 0) {
    return;
  }
  const { precedingNode, followingNode } = tiesToBreak[0];

  let gapEndPos = options.locStart(followingNode);

  // Iterate backwards through tiesToBreak, examining the gaps between the tied
  // comments. In order to qualify as leading, a comment must be separated from
  // followingNode by an unbroken series of gaps (or other comments). By
  // default, gaps should only contain whitespace or open parentheses.
  // printer.isGap can be used to define custom logic for checking gaps.
  let indexOfFirstLeadingComment;
  for (
    indexOfFirstLeadingComment = tieCount;
    indexOfFirstLeadingComment > 0;
    --indexOfFirstLeadingComment
  ) {
    const {
      comment,
      precedingNode: currentCommentPrecedingNode,
      followingNode: currentCommentFollowingNode,
    } = tiesToBreak[indexOfFirstLeadingComment - 1];
    assert.strictEqual(currentCommentPrecedingNode, precedingNode);
    assert.strictEqual(currentCommentFollowingNode, followingNode);

    const gap = options.originalText.slice(options.locEnd(comment), gapEndPos);

    if (options.printer.isGap?.(gap, options) ?? /^[\s(]*$/u.test(gap)) {
      gapEndPos = options.locStart(comment);
    } else {
      // The gap string contained something other than whitespace or open
      // parentheses.
      break;
    }
  }

  for (const [i, { comment }] of tiesToBreak.entries()) {
    if (i < indexOfFirstLeadingComment) {
      addTrailingComment(precedingNode, comment);
    } else {
      addLeadingComment(followingNode, comment);
    }
  }

  for (const node of [precedingNode, followingNode]) {
    if (node.comments && node.comments.length > 1) {
      node.comments.sort((a, b) => options.locStart(a) - options.locStart(b));
    }
  }

  tiesToBreak.length = 0;
}

function findExpressionIndexForComment(quasis, comment, options) {
  const startPos = options.locStart(comment) - 1;

  for (let i = 1; i < quasis.length; ++i) {
    if (startPos < options.locStart(quasis[i])) {
      return i - 1;
    }
  }

  // We haven't found it, it probably means that some of the locations are off.
  // Let's just return the first one.
  /* c8 ignore next */
  return 0;
}

export { attachComments, getSortedChildNodes };
