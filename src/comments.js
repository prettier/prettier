var assert = require("assert");
var types = require("ast-types");
var n = types.namedTypes;
var isArray = types.builtInTypes.array;
var isObject = types.builtInTypes.object;
var docBuilders = require("./doc-builders");
var fromString = docBuilders.fromString;
var concat = docBuilders.concat;
var hardline = docBuilders.hardline;
var breakParent = docBuilders.breakParent;
var indent = docBuilders.indent;
var lineSuffix = docBuilders.lineSuffix;
var util = require("./util");
var comparePos = util.comparePos;
var childNodesCacheKey = Symbol("child-nodes");
var locStart = util.locStart;
var locEnd = util.locEnd;

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
      // This reverse insertion sort almost always takes constant
      // time because we almost always (maybe always?) append the
      // nodes in order anyway.
      for (var i = resultArray.length - 1; i >= 0; --i) {
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

  var names;
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

  for (var i = 0, nameCount = names.length; i < nameCount; ++i) {
    getSortedChildNodes(node[names[i]], text, resultArray);
  }

  return resultArray;
}

// As efficiently as possible, decorate the comment object with
// .precedingNode, .enclosingNode, and/or .followingNode properties, at
// least one of which is guaranteed to be defined.
function decorateComment(node, comment, text) {
  var childNodes = getSortedChildNodes(node, text);
  var precedingNode, followingNode;
  // Time to dust off the old binary search robes and wizard hat.
  var left = 0, right = childNodes.length;
  while (left < right) {
    var middle = left + right >> 1;
    var child = childNodes[middle];

    if (
      locStart(child) - locStart(comment) <= 0 &&
        locEnd(comment) - locEnd(child) <= 0
    ) {
      // The comment is completely contained by this child node.
      comment.enclosingNode = child;

      if (middle > 0) {
        // Store the global preceding node separately from
        // `precedingNode` because they mean different things. This is
        // the previous node, ignoring any delimiters/blocks/etc.
        comment.globalPrecedingNode = childNodes[middle - 1];
      }

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

function attach(comments, ast, text) {
  if (!isArray.check(comments)) {
    return;
  }

  var tiesToBreak = [];

  comments.forEach(function(comment) {
    decorateComment(ast, comment, text);

    const precedingNode = comment.precedingNode;
    const globalPrecedingNode = comment.globalPrecedingNode;
    const enclosingNode = comment.enclosingNode;
    const followingNode = comment.followingNode;
    const isStartOfFile = comment.loc.start.line === 1;

    if (
      util.hasNewline(text, locStart(comment), { backwards: true }) ||
        isStartOfFile
    ) {
      // If a comment exists on its own line, prefer a leading comment.
      // We also need to check if it's the first line of the file.

      if (handleIfStatementComments(enclosingNode, followingNode, comment)) {
        // We're good
      } else if (followingNode) {
        // Always a leading comment.
        addLeadingComment(followingNode, comment);
      } else if (precedingNode) {
        addTrailingComment(precedingNode, comment);
      } else if (enclosingNode) {
        addDanglingComment(enclosingNode, comment);
      } else {
        // TODO: If there are no nodes at all, we should still somehow
        // print the comment.
      }
    } else if (util.hasNewline(text, locEnd(comment))) {
      // There is content before this comment on the same line, but
      // none after it, so prefer a trailing comment. A trailing
      // comment *always* attaches itself to the previous node, no
      // matter if there's any syntax between them.
      const lastNode = precedingNode || globalPrecedingNode;
      if (lastNode) {
        // Always a trailing comment
        addTrailingComment(lastNode, comment);
      } else {
        throw new Error("Preceding node not found");
      }
    } else {
      // Otherwise, text exists both before and after the comment on
      // the same line. If there is both a preceding and following
      // node, use a tie-breaking algorithm to determine if it should
      // be attached to the next or previous node. In the last case,
      // simply attach the right node;
      if (precedingNode && followingNode) {
        const tieCount = tiesToBreak.length;
        if (tieCount > 0) {
          var lastTie = tiesToBreak[tieCount - 1];
          if (lastTie.followingNode !== comment.followingNode) {
            breakTies(tiesToBreak, text);
          }
        }
        tiesToBreak.push(comment);
      } else if (precedingNode) {
        addTrailingComment(precedingNode, comment);
      } else if (followingNode) {
        addLeadingComment(followingNode, comment);
      } else if (enclosingNode) {
        addDanglingComment(enclosingNode, comment);
      }
    }
  });

  breakTies(tiesToBreak, text);

  comments.forEach(function(comment) {
    // These node references were useful for breaking ties, but we
    // don't need them anymore, and they create cycles in the AST that
    // may lead to infinite recursion if we don't delete them here.
    delete comment.precedingNode;
    delete comment.enclosingNode;
    delete comment.followingNode;
  });
}

function breakTies(tiesToBreak, text) {
  var tieCount = tiesToBreak.length;
  if (tieCount === 0) {
    return;
  }

  var precedingNode = tiesToBreak[0].precedingNode;
  var followingNode = tiesToBreak[0].followingNode;
  var gapEndPos = locStart(followingNode);

  // Iterate backwards through tiesToBreak, examining the gaps
  // between the tied comments. In order to qualify as leading, a
  // comment must be separated from followingNode by an unbroken series of
  // whitespace-only gaps (or other comments).
  for (
    var indexOfFirstLeadingComment = tieCount;
    indexOfFirstLeadingComment > 0;
    --indexOfFirstLeadingComment
  ) {
    var comment = tiesToBreak[indexOfFirstLeadingComment - 1];
    assert.strictEqual(comment.precedingNode, precedingNode);
    assert.strictEqual(comment.followingNode, followingNode);

    var gap = text.slice(locEnd(comment), gapEndPos);
    if (/\S/.test(gap)) {
      // The gap string contained something other than whitespace.
      break;
    }

    gapEndPos = locStart(comment);
  }

  tiesToBreak.forEach(function(comment, i) {
    if (i < indexOfFirstLeadingComment) {
      addTrailingComment(precedingNode, comment);
    } else {
      addLeadingComment(followingNode, comment);
    }
  });

  tiesToBreak.length = 0;
}

function addCommentHelper(node, comment) {
  var comments = node.comments || (node.comments = []);
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

function addBlockStatementFirstComment(node, comment) {
  if (node.body.length === 0) {
    addDanglingComment(node, comment);
  } else {
    addLeadingComment(node.body[0], comment);
  }
}

// There are often comments before the else clause of if statements like
//
//   if (1) { ... }
//   // comment
//   else { ... }
//
// They are being attached as leading comments of the BlockExpression which
// is not well printed. What we want is to instead move the comment inside
// of the block and make it leadingComment of the first element of the block
// or dangling comment of the block if there is nothing inside
//
//   if (1) { ... }
//   else {
//     // comment
//     ...  
//   }
function handleIfStatementComments(enclosingNode, followingNode, comment) {
  if (!enclosingNode || enclosingNode.type !== "IfStatement" || !followingNode) {
    return false;
  }

  if (followingNode.type === "BlockStatement") {
    addBlockStatementFirstComment(followingNode, comment);
    return true;
  }

  if (followingNode.type === "IfStatement") {
    if (followingNode.consequent.type === "BlockStatement") {
      addBlockStatementFirstComment(followingNode.consequent, comment);
    } else {
      addLeadingComment(followingNode.consequent, comment);
    }
    return true;
  }

  return false;
}

function printComment(commentPath) {
  const comment = commentPath.getValue();

  switch (comment.type) {
    case "CommentBlock":
    case "Block":
      return "/*" + comment.value + "*/";
    case "CommentLine":
    case "Line":
      return "//" + comment.value;
    default:
      throw new Error("Not a comment: " + JSON.stringify(comment));
  }
}

function printLeadingComment(commentPath, print, options) {
  const comment = commentPath.getValue();
  const contents = printComment(commentPath);
  const text = options.originalText;
  const isBlock = comment.type === "Block" || comment.type === "CommentBlock";

  // Leading block comments should see if they need to stay on the
  // same line or not.
  if (isBlock) {
    return concat([
      contents,
      util.hasNewline(options.originalText, locEnd(comment)) ? hardline : " "
    ]);
  }

  return concat([contents, hardline]);
}

function printTrailingComment(commentPath, print, options, parentNode) {
  const comment = commentPath.getValue();
  const contents = printComment(commentPath);
  const isBlock = comment.type === "Block" || comment.type === "CommentBlock";

  if (
    util.hasNewline(options.originalText, locStart(comment), {
      backwards: true
    })
  ) {
    // This allows comments at the end of nested structures:
    // {
    //   x: 1,
    //   y: 2
    //   // A comment
    // }
    // Those kinds of comments are almost always leading comments, but
    // here it doesn't go "outside" the block and turns it into a
    // trailing comment for `2`. We can simulate the above by checking
    // if this a comment on its own line; normal trailing comments are
    // always at the end of another expression.
    return concat([hardline, contents]);
  } else if (isBlock) {
    // Trailing block comments never need a newline
    return concat([" ", contents]);
  }

  return concat([lineSuffix(" " + contents), !isBlock ? breakParent : ""]);
}

function printDanglingComments(path, options, noIndent) {
  const text = options.originalText;
  const parts = [];
  const node = path.getValue();

  if (!node || !node.comments) {
    return "";
  }

  path.each(
    commentPath => {
      const comment = commentPath.getValue();
      if (!comment.leading && !comment.trailing) {
        if (util.hasNewline(text, locStart(comment), { backwards: true })) {
          parts.push(hardline);
        }
        parts.push(printComment(commentPath));
      }
    },
    "comments"
  );

  if (!noIndent) {
    return indent(1, concat(parts));
  }
  return concat(parts);
}

function printComments(path, print, options) {
  var value = path.getValue();
  var parent = path.getParentNode();
  var printed = print(path);
  var comments = n.Node.check(value) && types.getFieldValue(value, "comments");

  if (!comments || comments.length === 0) {
    return printed;
  }

  var leadingParts = [];
  var trailingParts = [printed];

  path.each(
    function(commentPath) {
      var comment = commentPath.getValue();
      var leading = types.getFieldValue(comment, "leading");
      var trailing = types.getFieldValue(comment, "trailing");

      if (leading) {
        leadingParts.push(printLeadingComment(commentPath, print, options));

        const text = options.originalText;
        if (
          util.hasNewline(text, util.skipNewline(text, util.locEnd(comment)))
        ) {
          leadingParts.push(hardline);
        }
      } else if (trailing) {
        trailingParts.push(
          printTrailingComment(commentPath, print, options, parent)
        );
      }
    },
    "comments"
  );

  return concat(leadingParts.concat(trailingParts));
}

module.exports = { attach, printComments, printDanglingComments };
