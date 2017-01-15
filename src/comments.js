const assert = require("assert");
const types = require("ast-types");
const n = types.namedTypes;
const isArray = types.builtInTypes.array;
const isObject = types.builtInTypes.object;
const pp = require("./pp");
const fromString = pp.fromString;
const concat = pp.concat;
const hardline = pp.hardline;
const util = require("./util");
const comparePos = util.comparePos;
const childNodesCacheKey = require("private").makeUniqueKey();
const locStart = util.locStart;
const locEnd = util.locEnd;

// TODO Move a non-caching implementation of this function into ast-types,
// and implement a caching wrapper function here.
function getSortedChildNodes(node, text, resultArray) {
  if (!node) {
    return;
  }

  // The loc checks below are sensitive to some of the problems that
  // are fixed by this utility function.
  util.fixFaultyLocations(node, text);

  if (resultArray) {
    if (n.Node.check(node)) {
      let i
      // This reverse insertion sort almost always takes constant
      // time because we almost always (maybe always?) append the
      // nodes in order anyway.
      for (i = resultArray.length - 1; i >= 0; --i) {
        if (locEnd(resultArray[i]) - locStart(node) <= 0) {
          break;
        }
      }

      resultArray.splice(i + 1, 0, node);

      return;
    }
  } else if (node[childNodesCacheKey]) {
    return node[childNodesCacheKey];
  }

  let names;

  if (isArray.check(node)) {
    names = Object.keys(node);
  } else if (isObject.check(node)) {
    names = types.getFieldNames(node);
  } else {
    return;
  }

  if (!resultArray) {
    Object.defineProperty(node, childNodesCacheKey, {
      value: resultArray = [],
      enumerable: false
    });
  }

  for (let i = 0, nameCount = names.length; i < nameCount; ++i) {
    getSortedChildNodes(node[names[i]], text, resultArray);
  }

  return resultArray;
}

// As efficiently as possible, decorate the comment object with
// .precedingNode, .enclosingNode, and/or .followingNode properties, at
// least one of which is guaranteed to be defined.
function decorateComment(node, comment, text) {
  const childNodes = getSortedChildNodes(node, text);

  // Time to dust off the old binary search robes and wizard hat.
  let left = 0, right = childNodes.length;

  let precedingNode, followingNode;

  while (left < right) {
    const middle = left + right >> 1;
    const child = childNodes[middle];

    if (
      locStart(child) - locStart(comment) <= 0 &&
        locEnd(comment) - locEnd(child) <= 0
    ) {
      // The comment is completely contained by this child node.
      comment.enclosingNode = child;
      decorateComment(child, comment, text);

      return; // Abandon the binary search at this level.
    }

    if (locEnd(child) - locStart(comment) <= 0) {
      // This child node falls completely before the comment.
      // Because we will never consider this node or any nodes
      // before it again, this node must be the closest preceding
      // node we have encountered so far.
      precedingNode = child;

      left = middle + 1;
      continue;
    }

    if (locEnd(comment) - locStart(child) <= 0) {
      // This child node falls completely after the comment.
      // Because we will never consider this node or any nodes after
      // it again, this node must be the closest following node we
      // have encountered so far.
      followingNode = child;

      right = middle;
      continue;
    }

    throw new Error("Comment location overlaps with node location");
  }

  if (precedingNode) {
    comment.precedingNode = precedingNode;
  }

  if (followingNode) {
    comment.followingNode = followingNode;
  }
}

exports.attach = function(comments, ast, text) {
  if (!isArray.check(comments)) {
    return;
  }

  let tiesToBreak = [];

  comments.forEach(comment => {
    decorateComment(ast, comment, text);

    const pn = comment.precedingNode;
    const en = comment.enclosingNode;
    const fn = comment.followingNode;

    if (pn && fn) {
      const tieCount = tiesToBreak.length;

      if (tieCount > 0) {
        const lastTie = tiesToBreak[tieCount - 1];

        assert.strictEqual(
          lastTie.precedingNode === comment.precedingNode,
          lastTie.followingNode === comment.followingNode
        );

        if (lastTie.followingNode !== comment.followingNode) {
          breakTies(tiesToBreak, text);
        }
      }

      tiesToBreak.push(comment);
    } else if (pn) {
      // No contest: we have a trailing comment.
      breakTies(tiesToBreak, text);
      addTrailingComment(pn, comment);
    } else if (fn) {
      // No contest: we have a leading comment.
      breakTies(tiesToBreak, text);
      addLeadingComment(fn, comment);
    } else if (en) {
      // The enclosing node has no child nodes at all, so what we
      // have here is a dangling comment, e.g. [/* crickets */].
      breakTies(tiesToBreak, text);
      addDanglingComment(en, comment);
    }
  });

  breakTies(tiesToBreak, text);

  comments.forEach(comment => {
    // These node references were useful for breaking ties, but we
    // don't need them anymore, and they create cycles in the AST that
    // may lead to infinite recursion if we don't delete them here.
    delete comment.precedingNode;
    delete comment.enclosingNode;
    delete comment.followingNode;
  });
};

function breakTies(tiesToBreak, text) {
  const tieCount = tiesToBreak.length;

  if (tieCount === 0) {
    return;
  }

  const pn = tiesToBreak[(0)].precedingNode;
  const fn = tiesToBreak[(0)].followingNode;
  let gapEndPos = locStart(fn);
  let indexOfFirstLeadingComment;
  // Iterate backwards through tiesToBreak, examining the gaps
  // between the tied comments. In order to qualify as leading, a
  // comment must be separated from fn by an unbroken series of
  // whitespace-only gaps (or other comments).
  for (
    indexOfFirstLeadingComment = tieCount;
    indexOfFirstLeadingComment > 0;
    --indexOfFirstLeadingComment
  ) {
    const comment = tiesToBreak[indexOfFirstLeadingComment - 1];

    assert.strictEqual(comment.precedingNode, pn);
    assert.strictEqual(comment.followingNode, fn);

    const gap = text.slice(locEnd(comment), gapEndPos);

    if (/\S/.test(gap)) {
      // The gap string contained something other than whitespace.
      break;
    }

    gapEndPos = locStart(comment);
  }

  // while (indexOfFirstLeadingComment <= tieCount &&
  //        (comment = tiesToBreak[indexOfFirstLeadingComment]) &&
  //        // If the comment is a //-style comment and indented more
  //        // deeply than the node itself, reconsider it as trailing.
  //        (comment.type === "Line" || comment.type === "CommentLine") &&
  //        comment.loc.start.column > fn.loc.start.column) {
  //   ++indexOfFirstLeadingComment;
  // }
  tiesToBreak.forEach((comment, i) => {
    if (i < indexOfFirstLeadingComment) {
      addTrailingComment(pn, comment);
    } else {
      addLeadingComment(fn, comment);
    }
  });

  tiesToBreak.length = 0;
}

function addCommentHelper(node, comment) {
  let comments = node.comments || (node.comments = []);

  comments.push(comment);
}

function addLeadingComment(node, comment) {
  comment.leading = true;
  comment.trailing = false;
  addCommentHelper(node, comment);
}

function addDanglingComment(node, comment) {
  comment.leading = false;
  comment.trailing = false;
  addCommentHelper(node, comment);
}

function addTrailingComment(node, comment) {
  comment.leading = false;
  comment.trailing = true;
  addCommentHelper(node, comment);
}

function printLeadingComment(commentPath, print) {
  let comment = commentPath.getValue();

  n.Comment.assert(comment);

  return concat([ print(commentPath), hardline ]);
}

function printTrailingComment(commentPath, print, options) {
  const comment = commentPath.getValue(commentPath);

  n.Comment.assert(comment);

  const text = options.originalText;

  return concat([
    util.newlineExistsBefore(text, locStart(comment)) ? hardline : " ",
    print(commentPath)
  ]);
}

exports.printComments = (path, print, options) => {
  const value = path.getValue();
  const parent = path.getParentNode();
  const printed = print(path);
  const comments = n.Node.check(value) && types.getFieldValue(value, "comments");
  const isFirstInProgram = n.Program.check(parent) && parent.body[(0)] === value;

  if (!comments || comments.length === 0) {
    return printed;
  }

  const leadingParts = [];
  const trailingParts = [ printed ];

  path.each(commentPath => {
    const comment = commentPath.getValue();
    const leading = types.getFieldValue(comment, "leading");
    const trailing = types.getFieldValue(comment, "trailing");

    if (
      leading ||
        trailing &&
        !(n.Statement.check(value) || comment.type === "Block" ||
          comment.type === "CommentBlock")
    ) {
      leadingParts.push(printLeadingComment(commentPath, print));

      // Support a special case where a comment exists at the very top
      // of the file. Allow the user to add spacing between that file
      // and any code beneath it.
      if (
        isFirstInProgram &&
          util.newlineExistsAfter(options.originalText, util.locEnd(comment))
      ) {
        leadingParts.push(hardline);
      }
    } else if (trailing) {
      trailingParts.push(printTrailingComment(commentPath, print, options));
    }
  }, "comments");

  leadingParts.push.apply(leadingParts, trailingParts);

  return concat(leadingParts);
};
