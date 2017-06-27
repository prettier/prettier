'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopDefault(ex) {
  return ex && (typeof ex === 'undefined' ? 'undefined' : _typeof(ex)) === 'object' && 'default' in ex ? ex['default'] : ex;
}

var require$$0 = _interopDefault(require('assert'));
var path = _interopDefault(require('path'));

function assertDoc(val) {
  if (!(typeof val === "string" || val != null && typeof val.type === "string")) {
    throw new Error("Value " + JSON.stringify(val) + " is not a valid document");
  }
}

function concat$1(parts) {
  parts.forEach(assertDoc);

  // We cannot do this until we change `printJSXElement` to not
  // access the internals of a document directly.
  // if(parts.length === 1) {
  //   // If it's a single document, no need to concat it.
  //   return parts[0];
  // }
  return { type: "concat", parts: parts };
}

function indent$1(contents) {
  assertDoc(contents);

  return { type: "indent", contents: contents };
}

function align(n, contents) {
  assertDoc(contents);

  return { type: "align", contents: contents, n: n };
}

function group(contents, opts) {
  opts = opts || {};

  assertDoc(contents);

  return {
    type: "group",
    contents: contents,
    break: !!opts.shouldBreak,
    expandedStates: opts.expandedStates
  };
}

function conditionalGroup(states, opts) {
  return group(states[0], Object.assign(opts || {}, { expandedStates: states }));
}

function fill(parts) {
  parts.forEach(assertDoc);

  return { type: "fill", parts: parts };
}

function ifBreak(breakContents, flatContents) {
  if (breakContents) {
    assertDoc(breakContents);
  }
  if (flatContents) {
    assertDoc(flatContents);
  }

  return { type: "if-break", breakContents: breakContents, flatContents: flatContents };
}

function lineSuffix$1(contents) {
  assertDoc(contents);
  return { type: "line-suffix", contents: contents };
}

var lineSuffixBoundary = { type: "line-suffix-boundary" };
var breakParent$1 = { type: "break-parent" };
var line = { type: "line" };
var softline = { type: "line", soft: true };
var hardline$1 = concat$1([{ type: "line", hard: true }, breakParent$1]);
var literalline = concat$1([{ type: "line", hard: true, literal: true }, breakParent$1]);
var cursor$1 = { type: "cursor", placeholder: Symbol() };

function join$1(sep, arr) {
  var res = [];

  for (var i = 0; i < arr.length; i++) {
    if (i !== 0) {
      res.push(sep);
    }

    res.push(arr[i]);
  }

  return concat$1(res);
}

function addAlignmentToDoc(doc, size, tabWidth) {
  var aligned = doc;
  if (size > 0) {
    // Use indent to add tabs for all the levels of tabs we need
    for (var i = 0; i < Math.floor(size / tabWidth); ++i) {
      aligned = indent$1(aligned);
    }
    // Use align for all the spaces that are needed
    aligned = align(size % tabWidth, aligned);
    // size is absolute from 0 and not relative to the current
    // indentation, so we use -Infinity to reset the indentation to 0
    aligned = align(-Infinity, aligned);
  }
  return aligned;
}

var docBuilders$1 = {
  concat: concat$1,
  join: join$1,
  line: line,
  softline: softline,
  hardline: hardline$1,
  literalline: literalline,
  group: group,
  conditionalGroup: conditionalGroup,
  fill: fill,
  lineSuffix: lineSuffix$1,
  lineSuffixBoundary: lineSuffixBoundary,
  cursor: cursor$1,
  breakParent: breakParent$1,
  ifBreak: ifBreak,
  indent: indent$1,
  align: align,
  addAlignmentToDoc: addAlignmentToDoc
};

function isExportDeclaration(node) {
  if (node) {
    switch (node.type) {
      case "ExportDeclaration":
      case "ExportDefaultDeclaration":
      case "ExportDefaultSpecifier":
      case "DeclareExportDeclaration":
      case "ExportNamedDeclaration":
      case "ExportAllDeclaration":
        return true;
    }
  }

  return false;
}

function getParentExportDeclaration(path$$1) {
  var parentNode = path$$1.getParentNode();
  if (path$$1.getName() === "declaration" && isExportDeclaration(parentNode)) {
    return parentNode;
  }

  return null;
}

function getPenultimate(arr) {
  if (arr.length > 1) {
    return arr[arr.length - 2];
  }
  return null;
}

function getLast(arr) {
  if (arr.length > 0) {
    return arr[arr.length - 1];
  }
  return null;
}

function skip(chars) {
  return function (text, index, opts) {
    var backwards = opts && opts.backwards;

    // Allow `skip` functions to be threaded together without having
    // to check for failures (did someone say monads?).
    if (index === false) {
      return false;
    }

    var length = text.length;
    var cursor = index;
    while (cursor >= 0 && cursor < length) {
      var c = text.charAt(cursor);
      if (chars instanceof RegExp) {
        if (!chars.test(c)) {
          return cursor;
        }
      } else if (chars.indexOf(c) === -1) {
        return cursor;
      }

      backwards ? cursor-- : cursor++;
    }

    if (cursor === -1 || cursor === length) {
      // If we reached the beginning or end of the file, return the
      // out-of-bounds cursor. It's up to the caller to handle this
      // correctly. We don't want to indicate `false` though if it
      // actually skipped valid characters.
      return cursor;
    }
    return false;
  };
}

var skipWhitespace = skip(/\s/);
var skipSpaces = skip(" \t");
var skipToLineEnd = skip(",; \t");
var skipEverythingButNewLine = skip(/[^\r\n]/);

function skipInlineComment(text, index) {
  if (index === false) {
    return false;
  }

  if (text.charAt(index) === "/" && text.charAt(index + 1) === "*") {
    for (var i = index + 2; i < text.length; ++i) {
      if (text.charAt(i) === "*" && text.charAt(i + 1) === "/") {
        return i + 2;
      }
    }
  }
  return index;
}

function skipTrailingComment(text, index) {
  if (index === false) {
    return false;
  }

  if (text.charAt(index) === "/" && text.charAt(index + 1) === "/") {
    return skipEverythingButNewLine(text, index);
  }
  return index;
}

// This one doesn't use the above helper function because it wants to
// test \r\n in order and `skip` doesn't support ordering and we only
// want to skip one newline. It's simple to implement.
function skipNewline(text, index, opts) {
  var backwards = opts && opts.backwards;
  if (index === false) {
    return false;
  }

  var atIndex = text.charAt(index);
  if (backwards) {
    if (text.charAt(index - 1) === "\r" && atIndex === "\n") {
      return index - 2;
    }
    if (atIndex === "\n" || atIndex === "\r" || atIndex === '\u2028' || atIndex === '\u2029') {
      return index - 1;
    }
  } else {
    if (atIndex === "\r" && text.charAt(index + 1) === "\n") {
      return index + 2;
    }
    if (atIndex === "\n" || atIndex === "\r" || atIndex === '\u2028' || atIndex === '\u2029') {
      return index + 1;
    }
  }

  return index;
}

function hasNewline(text, index, opts) {
  opts = opts || {};
  var idx = skipSpaces(text, opts.backwards ? index - 1 : index, opts);
  var idx2 = skipNewline(text, idx, opts);
  return idx !== idx2;
}

function hasNewlineInRange(text, start, end) {
  for (var i = start; i < end; ++i) {
    if (text.charAt(i) === "\n") {
      return true;
    }
  }
  return false;
}

// Note: this function doesn't ignore leading comments unlike isNextLineEmpty
function isPreviousLineEmpty(text, node) {
  var idx = locStart$1(node) - 1;
  idx = skipSpaces(text, idx, { backwards: true });
  idx = skipNewline(text, idx, { backwards: true });
  idx = skipSpaces(text, idx, { backwards: true });
  var idx2 = skipNewline(text, idx, { backwards: true });
  return idx !== idx2;
}

function isNextLineEmpty(text, node) {
  var oldIdx = null;
  var idx = locEnd$1(node);
  while (idx !== oldIdx) {
    // We need to skip all the potential trailing inline comments
    oldIdx = idx;
    idx = skipToLineEnd(text, idx);
    idx = skipInlineComment(text, idx);
    idx = skipSpaces(text, idx);
  }
  idx = skipTrailingComment(text, idx);
  idx = skipNewline(text, idx);
  return hasNewline(text, idx);
}

function getNextNonSpaceNonCommentCharacter$1(text, node) {
  var oldIdx = null;
  var idx = locEnd$1(node);
  while (idx !== oldIdx) {
    oldIdx = idx;
    idx = skipSpaces(text, idx);
    idx = skipInlineComment(text, idx);
    idx = skipTrailingComment(text, idx);
    idx = skipNewline(text, idx);
  }
  return text.charAt(idx);
}

function hasSpaces(text, index, opts) {
  opts = opts || {};
  var idx = skipSpaces(text, opts.backwards ? index - 1 : index, opts);
  return idx !== index;
}

function locStart$1(node) {
  // Handle nodes with decorators. They should start at the first decorator
  if (node.declaration && node.declaration.decorators && node.declaration.decorators.length > 0) {
    return locStart$1(node.declaration.decorators[0]);
  }
  if (node.decorators && node.decorators.length > 0) {
    return locStart$1(node.decorators[0]);
  }

  if (node.__location) {
    return node.__location.startOffset;
  }
  if (node.range) {
    return node.range[0];
  }
  if (typeof node.start === "number") {
    return node.start;
  }
  if (node.source) {
    return lineColumnToIndex(node.source.start, node.source.input.css) - 1;
  }
  if (node.loc) {
    return node.loc.start;
  }
}

function locEnd$1(node) {
  var loc = void 0;
  if (node.range) {
    loc = node.range[1];
  } else if (typeof node.end === "number") {
    loc = node.end;
  } else if (node.source) {
    loc = lineColumnToIndex(node.source.end, node.source.input.css);
  }

  if (node.__location) {
    return node.__location.endOffset;
  }
  if (node.typeAnnotation) {
    return Math.max(loc, locEnd$1(node.typeAnnotation));
  }

  if (node.loc && !loc) {
    return node.loc.end;
  }

  return loc;
}

// Super inefficient, needs to be cached.
function lineColumnToIndex(lineColumn, text) {
  var index = 0;
  for (var i = 0; i < lineColumn.line - 1; ++i) {
    index = text.indexOf("\n", index) + 1;
    if (index === -1) {
      return -1;
    }
  }
  return index + lineColumn.column;
}

function setLocStart(node, index) {
  if (node.range) {
    node.range[0] = index;
  } else {
    node.start = index;
  }
}

function setLocEnd(node, index) {
  if (node.range) {
    node.range[1] = index;
  } else {
    node.end = index;
  }
}

var PRECEDENCE = {};
[["||"], ["&&"], ["|"], ["^"], ["&"], ["==", "===", "!=", "!=="], ["<", ">", "<=", ">=", "in", "instanceof"], [">>", "<<", ">>>"], ["+", "-"], ["*", "/", "%"], ["**"]].forEach(function (tier, i) {
  tier.forEach(function (op) {
    PRECEDENCE[op] = i;
  });
});

function getPrecedence(op) {
  return PRECEDENCE[op];
}

// Tests if an expression starts with `{`, or (if forbidFunctionAndClass holds) `function` or `class`.
// Will be overzealous if there's already necessary grouping parentheses.
function startsWithNoLookaheadToken(node, forbidFunctionAndClass) {
  node = getLeftMost(node);
  switch (node.type) {
    // Hack. Remove after https://github.com/eslint/typescript-eslint-parser/issues/331
    case "ObjectPattern":
      return !forbidFunctionAndClass;
    case "FunctionExpression":
    case "ClassExpression":
      return forbidFunctionAndClass;
    case "ObjectExpression":
      return true;
    case "MemberExpression":
      return startsWithNoLookaheadToken(node.object, forbidFunctionAndClass);
    case "TaggedTemplateExpression":
      if (node.tag.type === "FunctionExpression") {
        // IIFEs are always already parenthesized
        return false;
      }
      return startsWithNoLookaheadToken(node.tag, forbidFunctionAndClass);
    case "CallExpression":
      if (node.callee.type === "FunctionExpression") {
        // IIFEs are always already parenthesized
        return false;
      }
      return startsWithNoLookaheadToken(node.callee, forbidFunctionAndClass);
    case "ConditionalExpression":
      return startsWithNoLookaheadToken(node.test, forbidFunctionAndClass);
    case "UpdateExpression":
      return !node.prefix && startsWithNoLookaheadToken(node.argument, forbidFunctionAndClass);
    case "BindExpression":
      return node.object && startsWithNoLookaheadToken(node.object, forbidFunctionAndClass);
    case "SequenceExpression":
      return startsWithNoLookaheadToken(node.expressions[0], forbidFunctionAndClass);
    case "TSAsExpression":
      return startsWithNoLookaheadToken(node.expression, forbidFunctionAndClass);
    default:
      return false;
  }
}

function getLeftMost(node) {
  if (node.left) {
    return getLeftMost(node.left);
  }
  return node;
}

function hasBlockComments(node) {
  return node.comments && node.comments.some(isBlockComment);
}

function isBlockComment(comment) {
  return comment.type === "Block" || comment.type === "CommentBlock";
}

function getAlignmentSize(value, tabWidth, startIndex) {
  startIndex = startIndex || 0;

  var size = 0;
  for (var i = startIndex; i < value.length; ++i) {
    if (value[i] === "\t") {
      // Tabs behave in a way that they are aligned to the nearest
      // multiple of tabWidth:
      // 0 -> 4, 1 -> 4, 2 -> 4, 3 -> 4
      // 4 -> 8, 5 -> 8, 6 -> 8, 7 -> 8 ...
      size = size + tabWidth - size % tabWidth;
    } else {
      size++;
    }
  }

  return size;
}

var util$2 = {
  getPrecedence: getPrecedence,
  isExportDeclaration: isExportDeclaration,
  getParentExportDeclaration: getParentExportDeclaration,
  getPenultimate: getPenultimate,
  getLast: getLast,
  getNextNonSpaceNonCommentCharacter: getNextNonSpaceNonCommentCharacter$1,
  skipWhitespace: skipWhitespace,
  skipSpaces: skipSpaces,
  skipNewline: skipNewline,
  isNextLineEmpty: isNextLineEmpty,
  isPreviousLineEmpty: isPreviousLineEmpty,
  hasNewline: hasNewline,
  hasNewlineInRange: hasNewlineInRange,
  hasSpaces: hasSpaces,
  locStart: locStart$1,
  locEnd: locEnd$1,
  setLocStart: setLocStart,
  setLocEnd: setLocEnd,
  startsWithNoLookaheadToken: startsWithNoLookaheadToken,
  hasBlockComments: hasBlockComments,
  isBlockComment: isBlockComment,
  getAlignmentSize: getAlignmentSize
};

var assert = require$$0;
var docBuilders = docBuilders$1;
var concat = docBuilders.concat;
var hardline = docBuilders.hardline;
var breakParent = docBuilders.breakParent;
var indent = docBuilders.indent;
var lineSuffix = docBuilders.lineSuffix;
var join = docBuilders.join;
var cursor = docBuilders.cursor;
var util$1 = util$2;
var childNodesCacheKey = Symbol("child-nodes");
var locStart = util$1.locStart;
var locEnd = util$1.locEnd;
var getNextNonSpaceNonCommentCharacter = util$1.getNextNonSpaceNonCommentCharacter;

function getSortedChildNodes(node, text, resultArray) {
  if (!node) {
    return;
  }

  if (resultArray) {
    if (node && (node.type && node.type !== "CommentBlock" && node.type !== "CommentLine" && node.type !== "Line" && node.type !== "Block" && node.type !== "EmptyStatement" && node.type !== "TemplateElement" || node.kind && node.kind !== "Comment")) {
      // This reverse insertion sort almost always takes constant
      // time because we almost always (maybe always?) append the
      // nodes in order anyway.
      var i = void 0;
      for (i = resultArray.length - 1; i >= 0; --i) {
        if (locStart(resultArray[i]) <= locStart(node) && locEnd(resultArray[i]) <= locEnd(node)) {
          break;
        }
      }
      resultArray.splice(i + 1, 0, node);
      return;
    }
  } else if (node[childNodesCacheKey]) {
    return node[childNodesCacheKey];
  }

  var names = void 0;
  if (node && (typeof node === 'undefined' ? 'undefined' : _typeof(node)) === "object") {
    names = Object.keys(node).filter(function (n) {
      return n !== "enclosingNode" && n !== "precedingNode" && n !== "followingNode";
    });
  } else {
    return;
  }

  if (!resultArray) {
    Object.defineProperty(node, childNodesCacheKey, {
      value: resultArray = [],
      enumerable: false
    });
  }

  for (var _i2 = 0, nameCount = names.length; _i2 < nameCount; ++_i2) {
    getSortedChildNodes(node[names[_i2]], text, resultArray);
  }

  return resultArray;
}

// As efficiently as possible, decorate the comment object with
// .precedingNode, .enclosingNode, and/or .followingNode properties, at
// least one of which is guaranteed to be defined.
function decorateComment(node, comment, text) {
  var childNodes = getSortedChildNodes(node, text);
  var precedingNode = void 0,
      followingNode = void 0;
  // Time to dust off the old binary search robes and wizard hat.
  var left = 0,
      right = childNodes.length;
  while (left < right) {
    var middle = left + right >> 1;
    var child = childNodes[middle];

    if (locStart(child) - locStart(comment) <= 0 && locEnd(comment) - locEnd(child) <= 0) {
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

  // We don't want comments inside of different expressions inside of the same
  // template literal to move to another expression.
  if (comment.enclosingNode && comment.enclosingNode.type === "TemplateLiteral") {
    var quasis = comment.enclosingNode.quasis;
    var commentIndex = findExpressionIndexForComment(quasis, comment);

    if (precedingNode && findExpressionIndexForComment(quasis, precedingNode) !== commentIndex) {
      precedingNode = null;
    }
    if (followingNode && findExpressionIndexForComment(quasis, followingNode) !== commentIndex) {
      followingNode = null;
    }
  }

  if (precedingNode) {
    comment.precedingNode = precedingNode;
  }

  if (followingNode) {
    comment.followingNode = followingNode;
  }
}

function attach(comments, ast, text) {
  if (!Array.isArray(comments)) {
    return;
  }

  var tiesToBreak = [];

  comments.forEach(function (comment, i) {
    decorateComment(ast, comment, text);

    var precedingNode = comment.precedingNode;
    var enclosingNode = comment.enclosingNode;
    var followingNode = comment.followingNode;

    var isLastComment = comments.length - 1 === i;

    if (util$1.hasNewline(text, locStart(comment), { backwards: true })) {
      // If a comment exists on its own line, prefer a leading comment.
      // We also need to check if it's the first line of the file.
      if (handleLastFunctionArgComments(text, precedingNode, enclosingNode, followingNode, comment) || handleMemberExpressionComments(enclosingNode, followingNode, comment) || handleIfStatementComments(text, precedingNode, enclosingNode, followingNode, comment) || handleTryStatementComments(enclosingNode, followingNode, comment) || handleClassComments(enclosingNode, comment) || handleImportSpecifierComments(enclosingNode, comment) || handleObjectPropertyComments(enclosingNode, comment) || handleForComments(enclosingNode, precedingNode, comment) || handleUnionTypeComments(precedingNode, enclosingNode, followingNode, comment) || handleOnlyComments(enclosingNode, ast, comment, isLastComment) || handleImportDeclarationComments(text, enclosingNode, precedingNode, comment) || handleAssignmentPatternComments(enclosingNode, comment)) {
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
        addDanglingComment(ast, comment);
      }
    } else if (util$1.hasNewline(text, locEnd(comment))) {
      if (handleLastFunctionArgComments(text, precedingNode, enclosingNode, followingNode, comment) || handleConditionalExpressionComments(enclosingNode, precedingNode, followingNode, comment, text) || handleImportSpecifierComments(enclosingNode, comment) || handleIfStatementComments(text, precedingNode, enclosingNode, followingNode, comment) || handleClassComments(enclosingNode, comment) || handleLabeledStatementComments(enclosingNode, comment) || handleCallExpressionComments(precedingNode, enclosingNode, comment) || handlePropertyComments(enclosingNode, comment) || handleExportNamedDeclarationComments(enclosingNode, comment) || handleOnlyComments(enclosingNode, ast, comment, isLastComment) || handleClassMethodComments(enclosingNode, comment) || handleTypeAliasComments(enclosingNode, followingNode, comment) || handleVariableDeclaratorComments(enclosingNode, followingNode, comment)) {
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
        addDanglingComment(ast, comment);
      }
    } else {
      if (handleIfStatementComments(text, precedingNode, enclosingNode, followingNode, comment) || handleObjectPropertyAssignment(enclosingNode, precedingNode, comment) || handleCommentInEmptyParens(text, enclosingNode, comment) || handleMethodNameComments(enclosingNode, precedingNode, comment) || handleOnlyComments(enclosingNode, ast, comment, isLastComment)) {
        // We're good
      } else if (precedingNode && followingNode) {
        // Otherwise, text exists both before and after the comment on
        // the same line. If there is both a preceding and following
        // node, use a tie-breaking algorithm to determine if it should
        // be attached to the next or previous node. In the last case,
        // simply attach the right node;
        var tieCount = tiesToBreak.length;
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
      } else {
        // There are no nodes, let's attach it to the root of the ast
        addDanglingComment(ast, comment);
      }
    }
  });

  breakTies(tiesToBreak, text);

  comments.forEach(function (comment) {
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
  var indexOfFirstLeadingComment = void 0;
  for (indexOfFirstLeadingComment = tieCount; indexOfFirstLeadingComment > 0; --indexOfFirstLeadingComment) {
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

  tiesToBreak.forEach(function (comment, i) {
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
  comment.printed = false;

  // For some reason, TypeScript parses `// x` inside of JSXText as a comment
  // We already "print" it via the raw text, we don't need to re-print it as a
  // comment
  if (node.type === "JSXText") {
    comment.printed = true;
  }
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
  var body = node.body.filter(function (n) {
    return n.type !== "EmptyStatement";
  });
  if (body.length === 0) {
    addDanglingComment(node, comment);
  } else {
    addLeadingComment(body[0], comment);
  }
}

function addBlockOrNotComment(node, comment) {
  if (node.type === "BlockStatement") {
    addBlockStatementFirstComment(node, comment);
  } else {
    addLeadingComment(node, comment);
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
function handleIfStatementComments(text, precedingNode, enclosingNode, followingNode, comment) {
  if (!enclosingNode || enclosingNode.type !== "IfStatement" || !followingNode) {
    return false;
  }

  // We unfortunately have no way using the AST or location of nodes to know
  // if the comment is positioned before or after the condition parenthesis:
  //   if (a /* comment */) {}
  //   if (a) /* comment */ {}
  // The only workaround I found is to look at the next character to see if
  // it is a ).
  if (getNextNonSpaceNonCommentCharacter(text, comment) === ")") {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  if (followingNode.type === "BlockStatement") {
    addBlockStatementFirstComment(followingNode, comment);
    return true;
  }

  if (followingNode.type === "IfStatement") {
    addBlockOrNotComment(followingNode.consequent, comment);
    return true;
  }

  return false;
}

// Same as IfStatement but for TryStatement
function handleTryStatementComments(enclosingNode, followingNode, comment) {
  if (!enclosingNode || enclosingNode.type !== "TryStatement" || !followingNode) {
    return false;
  }

  if (followingNode.type === "BlockStatement") {
    addBlockStatementFirstComment(followingNode, comment);
    return true;
  }

  if (followingNode.type === "TryStatement") {
    addBlockOrNotComment(followingNode.finalizer, comment);
    return true;
  }

  if (followingNode.type === "CatchClause") {
    addBlockOrNotComment(followingNode.body, comment);
    return true;
  }

  return false;
}

function handleMemberExpressionComments(enclosingNode, followingNode, comment) {
  if (enclosingNode && enclosingNode.type === "MemberExpression" && followingNode && followingNode.type === "Identifier") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }

  return false;
}

function handleConditionalExpressionComments(enclosingNode, precedingNode, followingNode, comment, text) {
  var isSameLineAsPrecedingNode = precedingNode && !util$1.hasNewlineInRange(text, locEnd(precedingNode), locStart(comment));

  if ((!precedingNode || !isSameLineAsPrecedingNode) && enclosingNode && enclosingNode.type === "ConditionalExpression" && followingNode) {
    addLeadingComment(followingNode, comment);
    return true;
  }
  return false;
}

function handleObjectPropertyAssignment(enclosingNode, precedingNode, comment) {
  if (enclosingNode && (enclosingNode.type === "ObjectProperty" || enclosingNode.type === "Property") && enclosingNode.shorthand && enclosingNode.key === precedingNode && enclosingNode.value.type === "AssignmentPattern") {
    addTrailingComment(enclosingNode.value.left, comment);
    return true;
  }
  return false;
}

function handleMethodNameComments(enclosingNode, precedingNode, comment) {
  // This is only needed for estree parsers (flow, typescript) to attach
  // after a method name:
  // obj = { fn /*comment*/() {} };
  if (enclosingNode && precedingNode && (enclosingNode.type === "Property" || enclosingNode.type === "MethodDefinition") && precedingNode.type === "Identifier" && enclosingNode.key === precedingNode) {
    addTrailingComment(precedingNode, comment);
    return true;
  }
  return false;
}

function handleCommentInEmptyParens(text, enclosingNode, comment) {
  if (getNextNonSpaceNonCommentCharacter(text, comment) !== ")") {
    return false;
  }

  // Only add dangling comments to fix the case when no params are present,
  // i.e. a function without any argument.
  if (enclosingNode && ((enclosingNode.type === "FunctionDeclaration" || enclosingNode.type === "FunctionExpression" || enclosingNode.type === "ArrowFunctionExpression" || enclosingNode.type === "ClassMethod" || enclosingNode.type === "ObjectMethod") && enclosingNode.params.length === 0 || enclosingNode.type === "CallExpression" && enclosingNode.arguments.length === 0)) {
    addDanglingComment(enclosingNode, comment);
    return true;
  }
  if (enclosingNode && enclosingNode.type === "MethodDefinition" && enclosingNode.value.params.length === 0) {
    addDanglingComment(enclosingNode.value, comment);
    return true;
  }
  return false;
}

function handleLastFunctionArgComments(text, precedingNode, enclosingNode, followingNode, comment) {
  // Type definitions functions
  if (precedingNode && precedingNode.type === "FunctionTypeParam" && enclosingNode && enclosingNode.type === "FunctionTypeAnnotation" && followingNode && followingNode.type !== "FunctionTypeParam") {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  // Real functions
  if (precedingNode && (precedingNode.type === "Identifier" || precedingNode.type === "AssignmentPattern") && enclosingNode && (enclosingNode.type === "ArrowFunctionExpression" || enclosingNode.type === "FunctionExpression" || enclosingNode.type === "FunctionDeclaration" || enclosingNode.type === "ObjectMethod" || enclosingNode.type === "ClassMethod") && getNextNonSpaceNonCommentCharacter(text, comment) === ")") {
    addTrailingComment(precedingNode, comment);
    return true;
  }
  return false;
}

function handleClassComments(enclosingNode, comment) {
  if (enclosingNode && (enclosingNode.type === "ClassDeclaration" || enclosingNode.type === "ClassExpression")) {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleImportSpecifierComments(enclosingNode, comment) {
  if (enclosingNode && enclosingNode.type === "ImportSpecifier") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleObjectPropertyComments(enclosingNode, comment) {
  if (enclosingNode && enclosingNode.type === "ObjectProperty") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleLabeledStatementComments(enclosingNode, comment) {
  if (enclosingNode && enclosingNode.type === "LabeledStatement") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleCallExpressionComments(precedingNode, enclosingNode, comment) {
  if (enclosingNode && enclosingNode.type === "CallExpression" && precedingNode && enclosingNode.callee === precedingNode && enclosingNode.arguments.length > 0) {
    addLeadingComment(enclosingNode.arguments[0], comment);
    return true;
  }
  return false;
}

function handleUnionTypeComments(precedingNode, enclosingNode, followingNode, comment) {
  if (enclosingNode && (enclosingNode.type === "UnionTypeAnnotation" || enclosingNode.type === "TSUnionType")) {
    addTrailingComment(precedingNode, comment);
    return true;
  }
  return false;
}

function handlePropertyComments(enclosingNode, comment) {
  if (enclosingNode && (enclosingNode.type === "Property" || enclosingNode.type === "ObjectProperty")) {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleExportNamedDeclarationComments(enclosingNode, comment) {
  if (enclosingNode && enclosingNode.type === "ExportNamedDeclaration") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleOnlyComments(enclosingNode, ast, comment, isLastComment) {
  // With Flow the enclosingNode is undefined so use the AST instead.
  if (ast && ast.body && ast.body.length === 0) {
    if (isLastComment) {
      addDanglingComment(ast, comment);
    } else {
      addLeadingComment(ast, comment);
    }
    return true;
  } else if (enclosingNode && enclosingNode.type === "Program" && enclosingNode.body.length === 0 && enclosingNode.directives && enclosingNode.directives.length === 0) {
    if (isLastComment) {
      addDanglingComment(enclosingNode, comment);
    } else {
      addLeadingComment(enclosingNode, comment);
    }
    return true;
  }
  return false;
}

function handleForComments(enclosingNode, precedingNode, comment) {
  if (enclosingNode && (enclosingNode.type === "ForInStatement" || enclosingNode.type === "ForOfStatement")) {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleImportDeclarationComments(text, enclosingNode, precedingNode, comment) {
  if (precedingNode && enclosingNode && enclosingNode.type === "ImportDeclaration" && util$1.hasNewline(text, util$1.locEnd(comment))) {
    addTrailingComment(precedingNode, comment);
    return true;
  }
  return false;
}

function handleAssignmentPatternComments(enclosingNode, comment) {
  if (enclosingNode && enclosingNode.type === "AssignmentPattern") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleClassMethodComments(enclosingNode, comment) {
  if (enclosingNode && enclosingNode.type === "ClassMethod") {
    addTrailingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleTypeAliasComments(enclosingNode, followingNode, comment) {
  if (enclosingNode && enclosingNode.type === "TypeAlias") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleVariableDeclaratorComments(enclosingNode, followingNode, comment) {
  if (enclosingNode && enclosingNode.type === "VariableDeclarator" && followingNode && (followingNode.type === "ObjectExpression" || followingNode.type === "ArrayExpression")) {
    addLeadingComment(followingNode, comment);
    return true;
  }
  return false;
}

function printComment(commentPath, options) {
  var comment = commentPath.getValue();
  comment.printed = true;

  switch (comment.type || comment.kind) {
    case "Comment":
      return "#" + comment.value;
    case "CommentBlock":
    case "Block":
      return "/*" + comment.value + "*/";
    case "CommentLine":
    case "Line":
      // Print shebangs with the proper comment characters
      if (options.originalText.slice(util$1.locStart(comment)).startsWith("#!")) {
        return "#!" + comment.value;
      }
      return "//" + comment.value;
    default:
      throw new Error("Not a comment: " + JSON.stringify(comment));
  }
}

function findExpressionIndexForComment(quasis, comment) {
  var startPos = locStart(comment) - 1;

  for (var i = 1; i < quasis.length; ++i) {
    if (startPos < getQuasiRange(quasis[i]).start) {
      return i - 1;
    }
  }

  // We haven't found it, it probably means that some of the locations are off.
  // Let's just return the first one.
  return 0;
}

function getQuasiRange(expr) {
  if (expr.start !== undefined) {
    // Babylon
    return { start: expr.start, end: expr.end };
  }
  // Flow
  return { start: expr.range[0], end: expr.range[1] };
}

function printLeadingComment(commentPath, print, options) {
  var comment = commentPath.getValue();
  var contents = printComment(commentPath, options);
  if (!contents) {
    return "";
  }
  var isBlock = util$1.isBlockComment(comment);

  // Leading block comments should see if they need to stay on the
  // same line or not.
  if (isBlock) {
    return concat([contents, util$1.hasNewline(options.originalText, locEnd(comment)) ? hardline : " "]);
  }

  return concat([contents, hardline]);
}

function printTrailingComment(commentPath, print, options) {
  var comment = commentPath.getValue();
  var contents = printComment(commentPath, options);
  if (!contents) {
    return "";
  }
  var isBlock = util$1.isBlockComment(comment);

  if (util$1.hasNewline(options.originalText, locStart(comment), {
    backwards: true
  })) {
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

    var isLineBeforeEmpty = util$1.isPreviousLineEmpty(options.originalText, comment);

    return lineSuffix(concat([hardline, isLineBeforeEmpty ? hardline : "", contents]));
  } else if (isBlock) {
    // Trailing block comments never need a newline
    return concat([" ", contents]);
  }

  return concat([lineSuffix(" " + contents), !isBlock ? breakParent : ""]);
}

function printDanglingComments(path$$1, options, sameIndent) {
  var parts = [];
  var node = path$$1.getValue();

  if (!node || !node.comments) {
    return "";
  }

  path$$1.each(function (commentPath) {
    var comment = commentPath.getValue();
    if (comment && !comment.leading && !comment.trailing) {
      parts.push(printComment(commentPath, options));
    }
  }, "comments");

  if (parts.length === 0) {
    return "";
  }

  if (sameIndent) {
    return join(hardline, parts);
  }
  return indent(concat([hardline, join(hardline, parts)]));
}

function prependCursorPlaceholder(path$$1, options, printed) {
  if (path$$1.getNode() === options.cursorNode && path$$1.getValue()) {
    return concat([cursor, printed]);
  }
  return printed;
}

function printComments(path$$1, print, options, needsSemi) {
  var value = path$$1.getValue();
  var printed = print(path$$1);
  var comments = value && value.comments;

  if (!comments || comments.length === 0) {
    return prependCursorPlaceholder(path$$1, options, printed);
  }

  var leadingParts = [];
  var trailingParts = [needsSemi ? ";" : "", printed];

  path$$1.each(function (commentPath) {
    var comment = commentPath.getValue();
    var leading = comment.leading;
    var trailing = comment.trailing;

    if (leading) {
      var contents = printLeadingComment(commentPath, print, options);
      if (!contents) {
        return;
      }
      leadingParts.push(contents);

      var text = options.originalText;
      if (util$1.hasNewline(text, util$1.skipNewline(text, util$1.locEnd(comment)))) {
        leadingParts.push(hardline);
      }
    } else if (trailing) {
      trailingParts.push(printTrailingComment(commentPath, print, options));
    }
  }, "comments");

  return prependCursorPlaceholder(path$$1, options, concat(leadingParts.concat(trailingParts)));
}

var comments$1 = {
  attach: attach,
  printComments: printComments,
  printDanglingComments: printDanglingComments,
  getSortedChildNodes: getSortedChildNodes
};

var name = "prettier";
var version$1 = "1.5.1";
var description = "Prettier is an opinionated JavaScript formatter";
var bin = { "prettier": "./bin/prettier.js" };
var repository = "prettier/prettier";
var author = "James Long";
var license = "MIT";
var main = "./index.js";
var dependencies = { "babel-code-frame": "7.0.0-alpha.12", "babylon": "7.0.0-beta.13", "chalk": "1.1.3", "diff": "3.2.0", "esutils": "2.0.2", "flow-parser": "0.47.0", "get-stream": "3.0.0", "glob": "7.1.2", "graphql": "0.10.1", "jest-validate": "20.0.3", "json-to-ast": "2.0.0-alpha1.2", "minimist": "1.2.0", "parse5": "3.0.2", "postcss": "^6.0.1", "postcss-less": "^1.0.0", "postcss-media-query-parser": "0.2.3", "postcss-scss": "1.0.0", "postcss-selector-parser": "2.2.3", "postcss-values-parser": "git://github.com/shellscape/postcss-values-parser.git#5e351360479116f3fe309602cdd15b0a233bc29f", "typescript": "2.5.0-dev.20170617", "typescript-eslint-parser": "git://github.com/eslint/typescript-eslint-parser.git#cfddbfe3ebf550530aef2f1c6c4ea1d9e738d9c1" };
var devDependencies = { "babel-cli": "6.24.1", "babel-preset-es2015": "6.24.1", "cross-spawn": "5.1.0", "eslint": "3.19.0", "eslint-friendly-formatter": "3.0.0", "eslint-plugin-prettier": "2.1.1", "jest": "20.0.0", "mkdirp": "^0.5.1", "prettier": "1.4.2", "rimraf": "2.6.1", "rollup": "0.41.1", "rollup-plugin-commonjs": "7.0.0", "rollup-plugin-json": "2.1.0", "rollup-plugin-node-builtins": "2.0.0", "rollup-plugin-node-globals": "1.1.0", "rollup-plugin-node-resolve": "2.0.0", "rollup-plugin-replace": "1.1.1", "sw-toolbox": "3.6.0", "uglify-es": "3.0.15", "webpack": "2.6.1" };
var scripts = { "test": "jest", "test-integration": "jest tests_integration", "lint": "EFF_NO_LINK_RULES=true eslint . --format 'node_modules/eslint-friendly-formatter'", "build": "./scripts/build/build.sh" };
var jest = { "setupFiles": ["<rootDir>/tests_config/run_spec.js"], "snapshotSerializers": ["<rootDir>/tests_config/raw-serializer.js"], "testRegex": "jsfmt\\.spec\\.js$|__tests__/.*\\.js$", "testPathIgnorePatterns": ["tests/new_react", "tests/more_react"] };
var _package = {
  name: name,
  version: version$1,
  description: description,
  bin: bin,
  repository: repository,
  author: author,
  license: license,
  main: main,
  dependencies: dependencies,
  devDependencies: devDependencies,
  scripts: scripts,
  jest: jest
};

var _package$1 = Object.freeze({
  name: name,
  version: version$1,
  description: description,
  bin: bin,
  repository: repository,
  author: author,
  license: license,
  main: main,
  dependencies: dependencies,
  devDependencies: devDependencies,
  scripts: scripts,
  jest: jest,
  default: _package
});

var assert$2 = require$$0;
var util$5 = util$2;
var startsWithNoLookaheadToken$1 = util$5.startsWithNoLookaheadToken;

function FastPath$1(value) {
  assert$2.ok(this instanceof FastPath$1);
  this.stack = [value];
}

// The name of the current property is always the penultimate element of
// this.stack, and always a String.
FastPath$1.prototype.getName = function getName() {
  var s = this.stack;
  var len = s.length;
  if (len > 1) {
    return s[len - 2];
  }
  // Since the name is always a string, null is a safe sentinel value to
  // return if we do not know the name of the (root) value.
  return null;
};

// The value of the current property is always the final element of
// this.stack.
FastPath$1.prototype.getValue = function getValue() {
  var s = this.stack;
  return s[s.length - 1];
};

function getNodeHelper(path$$1, count) {
  var s = path$$1.stack;

  for (var i = s.length - 1; i >= 0; i -= 2) {
    var value = s[i];

    if (value && !Array.isArray(value) && --count < 0) {
      return value;
    }
  }

  return null;
}

FastPath$1.prototype.getNode = function getNode(count) {
  return getNodeHelper(this, ~~count);
};

FastPath$1.prototype.getParentNode = function getParentNode(count) {
  return getNodeHelper(this, ~~count + 1);
};

// Temporarily push properties named by string arguments given after the
// callback function onto this.stack, then call the callback with a
// reference to this (modified) FastPath object. Note that the stack will
// be restored to its original state after the callback is finished, so it
// is probably a mistake to retain a reference to the path.
FastPath$1.prototype.call = function call(callback /*, name1, name2, ... */) {
  var s = this.stack;
  var origLen = s.length;
  var value = s[origLen - 1];
  var argc = arguments.length;
  for (var i = 1; i < argc; ++i) {
    var _name = arguments[i];
    value = value[_name];
    s.push(_name, value);
  }
  var result = callback(this);
  s.length = origLen;
  return result;
};

// Similar to FastPath.prototype.call, except that the value obtained by
// accessing this.getValue()[name1][name2]... should be array-like. The
// callback will be called with a reference to this path object for each
// element of the array.
FastPath$1.prototype.each = function each(callback /*, name1, name2, ... */) {
  var s = this.stack;
  var origLen = s.length;
  var value = s[origLen - 1];
  var argc = arguments.length;

  for (var i = 1; i < argc; ++i) {
    var _name2 = arguments[i];
    value = value[_name2];
    s.push(_name2, value);
  }

  for (var _i3 = 0; _i3 < value.length; ++_i3) {
    if (_i3 in value) {
      s.push(_i3, value[_i3]);
      // If the callback needs to know the value of i, call
      // path.getName(), assuming path is the parameter name.
      callback(this);
      s.length -= 2;
    }
  }

  s.length = origLen;
};

// Similar to FastPath.prototype.each, except that the results of the
// callback function invocations are stored in an array and returned at
// the end of the iteration.
FastPath$1.prototype.map = function map(callback /*, name1, name2, ... */) {
  var s = this.stack;
  var origLen = s.length;
  var value = s[origLen - 1];
  var argc = arguments.length;

  for (var i = 1; i < argc; ++i) {
    var _name3 = arguments[i];
    value = value[_name3];
    s.push(_name3, value);
  }

  var result = new Array(value.length);

  for (var _i4 = 0; _i4 < value.length; ++_i4) {
    if (_i4 in value) {
      s.push(_i4, value[_i4]);
      result[_i4] = callback(this, _i4);
      s.length -= 2;
    }
  }

  s.length = origLen;

  return result;
};

FastPath$1.prototype.needsParens = function (options) {
  var _this = this;

  var parent = this.getParentNode();
  if (!parent) {
    return false;
  }

  var name = this.getName();
  var node = this.getNode();

  // If the value of this path is some child of a Node and not a Node
  // itself, then it doesn't need parentheses. Only Node objects (in
  // fact, only Expression nodes) need parentheses.
  if (this.getValue() !== node) {
    return false;
  }

  // Only statements don't need parentheses.
  if (isStatement(node)) {
    return false;
  }

  // Identifiers never need parentheses.
  if (node.type === "Identifier") {
    return false;
  }

  if (parent.type === "ParenthesizedExpression") {
    return false;
  }

  // Add parens around the extends clause of a class. It is needed for almost
  // all expressions.
  if ((parent.type === "ClassDeclaration" || parent.type === "ClassExpression") && parent.superClass === node && (node.type === "ArrowFunctionExpression" || node.type === "AssignmentExpression" || node.type === "AwaitExpression" || node.type === "BinaryExpression" || node.type === "ConditionalExpression" || node.type === "LogicalExpression" || node.type === "NewExpression" || node.type === "ObjectExpression" || node.type === "ParenthesizedExpression" || node.type === "SequenceExpression" || node.type === "TaggedTemplateExpression" || node.type === "UnaryExpression" || node.type === "UpdateExpression" || node.type === "YieldExpression")) {
    return true;
  }

  if (parent.type === "ArrowFunctionExpression" && parent.body === node && startsWithNoLookaheadToken$1(node, /* forbidFunctionAndClass */false) || parent.type === "ExpressionStatement" && startsWithNoLookaheadToken$1(node, /* forbidFunctionAndClass */true)) {
    return true;
  }

  switch (node.type) {
    case "CallExpression":
      {
        var firstParentNotMemberExpression = parent;
        var i = 0;
        while (firstParentNotMemberExpression && firstParentNotMemberExpression.type === "MemberExpression") {
          firstParentNotMemberExpression = this.getParentNode(++i);
        }

        if (firstParentNotMemberExpression.type === "NewExpression" && firstParentNotMemberExpression.callee === this.getParentNode(i - 1)) {
          return true;
        }
        return false;
      }

    case "SpreadElement":
    case "SpreadProperty":
      return parent.type === "MemberExpression" && name === "object" && parent.object === node;

    case "UpdateExpression":
      if (parent.type === "UnaryExpression") {
        return node.prefix && (node.operator === "++" && parent.operator === "+" || node.operator === "--" && parent.operator === "-");
      }
    // else fallthrough
    case "UnaryExpression":
      switch (parent.type) {
        case "UnaryExpression":
          return node.operator === parent.operator && (node.operator === "+" || node.operator === "-");

        case "MemberExpression":
          return name === "object" && parent.object === node;

        case "TaggedTemplateExpression":
          return true;

        case "NewExpression":
        case "CallExpression":
          return name === "callee" && parent.callee === node;

        case "BinaryExpression":
          return parent.operator === "**" && name === "left";

        default:
          return false;
      }

    case "BinaryExpression":
      {
        if (parent.type === "UpdateExpression") {
          return true;
        }

        var isLeftOfAForStatement = function isLeftOfAForStatement(node) {
          var i = 0;
          while (node) {
            var _parent = _this.getParentNode(i++);
            if (!_parent) {
              return false;
            }
            if (_parent.type === "ForStatement" && _parent.init === node) {
              return true;
            }
            node = _parent;
          }
          return false;
        };
        if (node.operator === "in" && isLeftOfAForStatement(node)) {
          return true;
        }
      }
    // fallthrough
    case "TSTypeAssertionExpression":
    case "TSAsExpression":
    case "LogicalExpression":
      switch (parent.type) {
        case "CallExpression":
        case "NewExpression":
          return name === "callee" && parent.callee === node;

        case "ClassDeclaration":
          return name === "superClass" && parent.superClass === node;
        case "TSTypeAssertionExpression":
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "SpreadElement":
        case "SpreadProperty":
        case "AwaitExpression":
        case "TSAsExpression":
        case "TSNonNullExpression":
          return true;

        case "MemberExpression":
          return name === "object" && parent.object === node;

        case "BinaryExpression":
        case "LogicalExpression":
          {
            if (!node.operator) {
              return true;
            }

            var po = parent.operator;
            var pp = util$5.getPrecedence(po);
            var no = node.operator;
            var np = util$5.getPrecedence(no);

            if (po === "||" && no === "&&") {
              return true;
            }

            if (pp > np) {
              return true;
            }

            if (no === "**" && po === "**") {
              return name === "left";
            }

            if (pp === np && name === "right") {
              assert$2.strictEqual(parent.right, node);
              return true;
            }

            // Add parenthesis when working with binary operators
            // It's not stricly needed but helps with code understanding
            if (["|", "^", "&", ">>", "<<", ">>>"].indexOf(po) !== -1) {
              return true;
            }

            return false;
          }

        default:
          return false;
      }

    case "TSParenthesizedType":
      {
        if ((parent.type === "TypeParameter" || parent.type === "VariableDeclarator" || parent.type === "TypeAnnotation" || parent.type === "GenericTypeAnnotation") && node.typeAnnotation.type === "TypeAnnotation" && node.typeAnnotation.typeAnnotation.type !== "TSFunctionType") {
          return false;
        }
        // Delegate to inner TSParenthesizedType
        if (node.typeAnnotation.type === "TSParenthesizedType") {
          return false;
        }
        return true;
      }

    case "SequenceExpression":
      switch (parent.type) {
        case "ReturnStatement":
          return false;

        case "ForStatement":
          // Although parentheses wouldn't hurt around sequence
          // expressions in the head of for loops, traditional style
          // dictates that e.g. i++, j++ should not be wrapped with
          // parentheses.
          return false;

        case "ExpressionStatement":
          return name !== "expression";

        default:
          // Otherwise err on the side of overparenthesization, adding
          // explicit exceptions above if this proves overzealous.
          return true;
      }

    case "YieldExpression":
      if (parent.type === "UnaryExpression" || parent.type === "AwaitExpression" || parent.type === "TSAsExpression" || parent.type === "TSNonNullExpression") {
        return true;
      }
    // else fallthrough
    case "AwaitExpression":
      switch (parent.type) {
        case "TaggedTemplateExpression":
        case "BinaryExpression":
        case "LogicalExpression":
        case "SpreadElement":
        case "SpreadProperty":
        case "TSAsExpression":
        case "TSNonNullExpression":
          return true;

        case "MemberExpression":
          return parent.object === node;

        case "NewExpression":
        case "CallExpression":
          return parent.callee === node;

        case "ConditionalExpression":
          return parent.test === node;

        default:
          return false;
      }

    case "ArrayTypeAnnotation":
      return parent.type === "NullableTypeAnnotation";

    case "IntersectionTypeAnnotation":
    case "UnionTypeAnnotation":
      return parent.type === "ArrayTypeAnnotation" || parent.type === "NullableTypeAnnotation" || parent.type === "IntersectionTypeAnnotation" || parent.type === "UnionTypeAnnotation";

    case "NullableTypeAnnotation":
      return parent.type === "ArrayTypeAnnotation";

    case "FunctionTypeAnnotation":
      return parent.type === "UnionTypeAnnotation" || parent.type === "IntersectionTypeAnnotation";

    case "StringLiteral":
    case "NumericLiteral":
    case "Literal":
      if (typeof node.value === "string" && parent.type === "ExpressionStatement" && (
      // TypeScript workaround for eslint/typescript-eslint-parser#267
      // See corresponding workaround in printer.js case: "Literal"
      options.parser !== "typescript" && !parent.directive || options.parser === "typescript" && options.originalText.substr(util$5.locStart(node) - 1, 1) === "(")) {
        // To avoid becoming a directive
        var grandParent = this.getParentNode(1);

        return grandParent.type === "Program" || grandParent.type === "BlockStatement";
      }

      return parent.type === "MemberExpression" && typeof node.value === "number" && name === "object" && parent.object === node;

    case "AssignmentExpression":
      {
        var _grandParent = this.getParentNode(1);

        if (parent.type === "ArrowFunctionExpression" && parent.body === node) {
          return true;
        } else if (parent.type === "ClassProperty" && parent.key === node && parent.computed) {
          return false;
        } else if (parent.type === "TSPropertySignature" && parent.name === node) {
          return false;
        } else if (parent.type === "ForStatement" && (parent.init === node || parent.update === node)) {
          return false;
        } else if (parent.type === "ExpressionStatement") {
          return node.left.type === "ObjectPattern";
        } else if (parent.type === "TSPropertySignature" && parent.key === node) {
          return false;
        } else if (parent.type === "AssignmentExpression") {
          return false;
        } else if (parent.type === "SequenceExpression" && _grandParent && _grandParent.type === "ForStatement" && (_grandParent.init === parent || _grandParent.update === parent)) {
          return false;
        }
        return true;
      }
    case "ConditionalExpression":
      switch (parent.type) {
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "SpreadElement":
        case "SpreadProperty":
        case "BinaryExpression":
        case "LogicalExpression":
        case "ExportDefaultDeclaration":
        case "AwaitExpression":
        case "JSXSpreadAttribute":
        case "TSTypeAssertionExpression":
        case "TSAsExpression":
        case "TSNonNullExpression":
          return true;

        case "NewExpression":
        case "CallExpression":
          return name === "callee" && parent.callee === node;

        case "ConditionalExpression":
          return name === "test" && parent.test === node;

        case "MemberExpression":
          return name === "object" && parent.object === node;

        default:
          return false;
      }

    case "FunctionExpression":
      switch (parent.type) {
        case "CallExpression":
          return name === "callee"; // Not strictly necessary, but it's clearer to the reader if IIFEs are wrapped in parentheses.
        case "TaggedTemplateExpression":
          return true; // This is basically a kind of IIFE.
        case "ExportDefaultDeclaration":
          return true;
        default:
          return false;
      }

    case "ArrowFunctionExpression":
      switch (parent.type) {
        case "CallExpression":
          return name === "callee";

        case "NewExpression":
          return name === "callee";

        case "MemberExpression":
          return name === "object";

        case "TSAsExpression":
        case "BindExpression":
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "LogicalExpression":
        case "BinaryExpression":
        case "AwaitExpression":
        case "TSTypeAssertionExpression":
          return true;

        case "ConditionalExpression":
          return name === "test";

        default:
          return false;
      }

    case "ClassExpression":
      return parent.type === "ExportDefaultDeclaration";
  }

  return false;
};

function isStatement(node) {
  return node.type === "BlockStatement" || node.type === "BreakStatement" || node.type === "ClassBody" || node.type === "ClassDeclaration" || node.type === "ClassMethod" || node.type === "ClassProperty" || node.type === "ContinueStatement" || node.type === "DebuggerStatement" || node.type === "DeclareClass" || node.type === "DeclareExportAllDeclaration" || node.type === "DeclareExportDeclaration" || node.type === "DeclareFunction" || node.type === "DeclareInterface" || node.type === "DeclareModule" || node.type === "DeclareModuleExports" || node.type === "DeclareVariable" || node.type === "DoWhileStatement" || node.type === "ExportAllDeclaration" || node.type === "ExportDefaultDeclaration" || node.type === "ExportNamedDeclaration" || node.type === "ExpressionStatement" || node.type === "ForAwaitStatement" || node.type === "ForInStatement" || node.type === "ForOfStatement" || node.type === "ForStatement" || node.type === "FunctionDeclaration" || node.type === "IfStatement" || node.type === "ImportDeclaration" || node.type === "InterfaceDeclaration" || node.type === "LabeledStatement" || node.type === "MethodDefinition" || node.type === "ReturnStatement" || node.type === "SwitchStatement" || node.type === "ThrowStatement" || node.type === "TryStatement" || node.type === "TSAbstractClassDeclaration" || node.type === "TSEnumDeclaration" || node.type === "TSImportEqualsDeclaration" || node.type === "TSInterfaceDeclaration" || node.type === "TSModuleDeclaration" || node.type === "TSNamespaceExportDeclaration" || node.type === "TSNamespaceFunctionDeclaration" || node.type === "TypeAlias" || node.type === "VariableDeclaration" || node.type === "WhileStatement" || node.type === "WithStatement";
}

var fastPath = FastPath$1;

function traverseDoc(doc, onEnter, onExit, shouldTraverseConditionalGroups) {
  function traverseDocRec(doc) {
    var shouldRecurse = true;
    if (onEnter) {
      if (onEnter(doc) === false) {
        shouldRecurse = false;
      }
    }

    if (shouldRecurse) {
      if (doc.type === "concat" || doc.type === "fill") {
        for (var i = 0; i < doc.parts.length; i++) {
          traverseDocRec(doc.parts[i]);
        }
      } else if (doc.type === "if-break") {
        if (doc.breakContents) {
          traverseDocRec(doc.breakContents);
        }
        if (doc.flatContents) {
          traverseDocRec(doc.flatContents);
        }
      } else if (doc.type === "group" && doc.expandedStates) {
        if (shouldTraverseConditionalGroups) {
          doc.expandedStates.forEach(traverseDocRec);
        } else {
          traverseDocRec(doc.contents);
        }
      } else if (doc.contents) {
        traverseDocRec(doc.contents);
      }
    }

    if (onExit) {
      onExit(doc);
    }
  }

  traverseDocRec(doc);
}

function mapDoc(doc, func) {
  doc = func(doc);

  if (doc.type === "concat" || doc.type === "fill") {
    return Object.assign({}, doc, {
      parts: doc.parts.map(function (d) {
        return mapDoc(d, func);
      })
    });
  } else if (doc.type === "if-break") {
    return Object.assign({}, doc, {
      breakContents: doc.breakContents && mapDoc(doc.breakContents, func),
      flatContents: doc.flatContents && mapDoc(doc.flatContents, func)
    });
  } else if (doc.contents) {
    return Object.assign({}, doc, { contents: mapDoc(doc.contents, func) });
  }
  return doc;
}

function findInDoc(doc, fn, defaultValue) {
  var result = defaultValue;
  var hasStopped = false;
  traverseDoc(doc, function (doc) {
    var maybeResult = fn(doc);
    if (maybeResult !== undefined) {
      hasStopped = true;
      result = maybeResult;
    }
    if (hasStopped) {
      return false;
    }
  });
  return result;
}

function isEmpty$1(n) {
  return typeof n === "string" && n.length === 0;
}

function isLineNext$1(doc) {
  return findInDoc(doc, function (doc) {
    if (typeof doc === "string") {
      return false;
    }
    if (doc.type === "line") {
      return true;
    }
  }, false);
}

function willBreak$1(doc) {
  return findInDoc(doc, function (doc) {
    if (doc.type === "group" && doc.break) {
      return true;
    }
    if (doc.type === "line" && doc.hard) {
      return true;
    }
    if (doc.type === "break-parent") {
      return true;
    }
  }, false);
}

function breakParentGroup(groupStack) {
  if (groupStack.length > 0) {
    var parentGroup = groupStack[groupStack.length - 1];
    // Breaks are not propagated through conditional groups because
    // the user is expected to manually handle what breaks.
    if (!parentGroup.expandedStates) {
      parentGroup.break = true;
    }
  }
  return null;
}

function propagateBreaks(doc) {
  var alreadyVisited = new Map();
  var groupStack = [];
  traverseDoc(doc, function (doc) {
    if (doc.type === "break-parent") {
      breakParentGroup(groupStack);
    }
    if (doc.type === "group") {
      groupStack.push(doc);
      if (alreadyVisited.has(doc)) {
        return false;
      }
      alreadyVisited.set(doc, true);
    }
  }, function (doc) {
    if (doc.type === "group") {
      var _group = groupStack.pop();
      if (_group.break) {
        breakParentGroup(groupStack);
      }
    }
  },
  /* shouldTraverseConditionalGroups */true);
}

function removeLines(doc) {
  // Force this doc into flat mode by statically converting all
  // lines into spaces (or soft lines into nothing). Hard lines
  // should still output because there's too great of a chance
  // of breaking existing assumptions otherwise.
  return mapDoc(doc, function (d) {
    if (d.type === "line" && !d.hard) {
      return d.soft ? "" : " ";
    } else if (d.type === "if-break") {
      return d.flatContents || "";
    }
    return d;
  });
}

function rawText$1(node) {
  return node.extra ? node.extra.raw : node.raw;
}

var docUtils$2 = {
  isEmpty: isEmpty$1,
  willBreak: willBreak$1,
  isLineNext: isLineNext$1,
  traverseDoc: traverseDoc,
  mapDoc: mapDoc,
  propagateBreaks: propagateBreaks,
  removeLines: removeLines,
  rawText: rawText$1
};

function createCommonjsModule(fn, module) {
  return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var index$4 = createCommonjsModule(function (module, exports) {
  // Copyright 2014, 2015, 2016, 2017 Simon Lydell
  // License: MIT. (See LICENSE.)

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  // This regex comes from regex.coffee, and is inserted here by generate-index.js
  // (run `npm run build`).
  exports.default = /((['"])(?:(?!\2|\\).|\\(?:\r\n|[\s\S]))*(\2)?|`(?:[^`\\$]|\\[\s\S]|\$(?!\{)|\$\{(?:[^{}]|\{[^}]*\}?)*\}?)*(`)?)|(\/\/.*)|(\/\*(?:[^*]|\*(?!\/))*(\*\/)?)|(\/(?!\*)(?:\[(?:(?![\]\\]).|\\.)*\]|(?![\/\]\\]).|\\.)+\/(?:(?!\s*(?:\b|[\u0080-\uFFFF$\\'"~({]|[+\-!](?!=)|\.?\d))|[gmiyu]{1,5}\b(?![\u0080-\uFFFF$\\]|\s*(?:[+\-*%&|^<>!=?({]|\/(?![\/*])))))|(0[xX][\da-fA-F]+|0[oO][0-7]+|0[bB][01]+|(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?)|((?!\d)(?:(?!\s)[$\w\u0080-\uFFFF]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]+\})+)|(--|\+\+|&&|\|\||=>|\.{3}|(?:[+\-\/%&|^]|\*{1,2}|<{1,2}|>{1,3}|!=?|={1,2})=?|[?~.,:;[\](){}])|(\s+)|(^$|[\s\S])/g;

  exports.matchToToken = function (match) {
    var token = { type: "invalid", value: match[0] };
    if (match[1]) token.type = "string", token.closed = !!(match[3] || match[4]);else if (match[5]) token.type = "comment";else if (match[6]) token.type = "comment", token.closed = !!match[7];else if (match[8]) token.type = "regex";else if (match[9]) token.type = "number";else if (match[10]) token.type = "name";else if (match[11]) token.type = "punctuator";else if (match[12]) token.type = "whitespace";
    return token;
  };
});

var ast = createCommonjsModule(function (module) {
  /*
    Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>
  
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.
      * Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.
  
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS'
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
    ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
    THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  */

  (function () {
    'use strict';

    function isExpression(node) {
      if (node == null) {
        return false;
      }
      switch (node.type) {
        case 'ArrayExpression':
        case 'AssignmentExpression':
        case 'BinaryExpression':
        case 'CallExpression':
        case 'ConditionalExpression':
        case 'FunctionExpression':
        case 'Identifier':
        case 'Literal':
        case 'LogicalExpression':
        case 'MemberExpression':
        case 'NewExpression':
        case 'ObjectExpression':
        case 'SequenceExpression':
        case 'ThisExpression':
        case 'UnaryExpression':
        case 'UpdateExpression':
          return true;
      }
      return false;
    }

    function isIterationStatement(node) {
      if (node == null) {
        return false;
      }
      switch (node.type) {
        case 'DoWhileStatement':
        case 'ForInStatement':
        case 'ForStatement':
        case 'WhileStatement':
          return true;
      }
      return false;
    }

    function isStatement(node) {
      if (node == null) {
        return false;
      }
      switch (node.type) {
        case 'BlockStatement':
        case 'BreakStatement':
        case 'ContinueStatement':
        case 'DebuggerStatement':
        case 'DoWhileStatement':
        case 'EmptyStatement':
        case 'ExpressionStatement':
        case 'ForInStatement':
        case 'ForStatement':
        case 'IfStatement':
        case 'LabeledStatement':
        case 'ReturnStatement':
        case 'SwitchStatement':
        case 'ThrowStatement':
        case 'TryStatement':
        case 'VariableDeclaration':
        case 'WhileStatement':
        case 'WithStatement':
          return true;
      }
      return false;
    }

    function isSourceElement(node) {
      return isStatement(node) || node != null && node.type === 'FunctionDeclaration';
    }

    function trailingStatement(node) {
      switch (node.type) {
        case 'IfStatement':
          if (node.alternate != null) {
            return node.alternate;
          }
          return node.consequent;

        case 'LabeledStatement':
        case 'ForStatement':
        case 'ForInStatement':
        case 'WhileStatement':
        case 'WithStatement':
          return node.body;
      }
      return null;
    }

    function isProblematicIfStatement(node) {
      var current;

      if (node.type !== 'IfStatement') {
        return false;
      }
      if (node.alternate == null) {
        return false;
      }
      current = node.consequent;
      do {
        if (current.type === 'IfStatement') {
          if (current.alternate == null) {
            return true;
          }
        }
        current = trailingStatement(current);
      } while (current);

      return false;
    }

    module.exports = {
      isExpression: isExpression,
      isStatement: isStatement,
      isIterationStatement: isIterationStatement,
      isSourceElement: isSourceElement,
      isProblematicIfStatement: isProblematicIfStatement,

      trailingStatement: trailingStatement
    };
  })();
  /* vim: set sw=4 ts=4 et tw=80 : */
});

var code = createCommonjsModule(function (module) {
  /*
    Copyright (C) 2013-2014 Yusuke Suzuki <utatane.tea@gmail.com>
    Copyright (C) 2014 Ivan Nikulin <ifaaan@gmail.com>
  
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.
      * Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.
  
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
    ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
    THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  */

  (function () {
    'use strict';

    var ES6Regex, ES5Regex, NON_ASCII_WHITESPACES, IDENTIFIER_START, IDENTIFIER_PART, ch;

    // See `tools/generate-identifier-regex.js`.
    ES5Regex = {
      // ECMAScript 5.1/Unicode v7.0.0 NonAsciiIdentifierStart:
      NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
      // ECMAScript 5.1/Unicode v7.0.0 NonAsciiIdentifierPart:
      NonAsciiIdentifierPart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/
    };

    ES6Regex = {
      // ECMAScript 6/Unicode v7.0.0 NonAsciiIdentifierStart:
      NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDE00-\uDE11\uDE13-\uDE2B\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDE00-\uDE2F\uDE44\uDE80-\uDEAA]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]/,
      // ECMAScript 6/Unicode v7.0.0 NonAsciiIdentifierPart:
      NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDD0-\uDDDA\uDE00-\uDE11\uDE13-\uDE37\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF01-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/
    };

    function isDecimalDigit(ch) {
      return 0x30 <= ch && ch <= 0x39; // 0..9
    }

    function isHexDigit(ch) {
      return 0x30 <= ch && ch <= 0x39 || // 0..9
      0x61 <= ch && ch <= 0x66 || // a..f
      0x41 <= ch && ch <= 0x46; // A..F
    }

    function isOctalDigit(ch) {
      return ch >= 0x30 && ch <= 0x37; // 0..7
    }

    // 7.2 White Space

    NON_ASCII_WHITESPACES = [0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF];

    function isWhiteSpace(ch) {
      return ch === 0x20 || ch === 0x09 || ch === 0x0B || ch === 0x0C || ch === 0xA0 || ch >= 0x1680 && NON_ASCII_WHITESPACES.indexOf(ch) >= 0;
    }

    // 7.3 Line Terminators

    function isLineTerminator(ch) {
      return ch === 0x0A || ch === 0x0D || ch === 0x2028 || ch === 0x2029;
    }

    // 7.6 Identifier Names and Identifiers

    function fromCodePoint(cp) {
      if (cp <= 0xFFFF) {
        return String.fromCharCode(cp);
      }
      var cu1 = String.fromCharCode(Math.floor((cp - 0x10000) / 0x400) + 0xD800);
      var cu2 = String.fromCharCode((cp - 0x10000) % 0x400 + 0xDC00);
      return cu1 + cu2;
    }

    IDENTIFIER_START = new Array(0x80);
    for (ch = 0; ch < 0x80; ++ch) {
      IDENTIFIER_START[ch] = ch >= 0x61 && ch <= 0x7A || // a..z
      ch >= 0x41 && ch <= 0x5A || // A..Z
      ch === 0x24 || ch === 0x5F; // $ (dollar) and _ (underscore)
    }

    IDENTIFIER_PART = new Array(0x80);
    for (ch = 0; ch < 0x80; ++ch) {
      IDENTIFIER_PART[ch] = ch >= 0x61 && ch <= 0x7A || // a..z
      ch >= 0x41 && ch <= 0x5A || // A..Z
      ch >= 0x30 && ch <= 0x39 || // 0..9
      ch === 0x24 || ch === 0x5F; // $ (dollar) and _ (underscore)
    }

    function isIdentifierStartES5(ch) {
      return ch < 0x80 ? IDENTIFIER_START[ch] : ES5Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch));
    }

    function isIdentifierPartES5(ch) {
      return ch < 0x80 ? IDENTIFIER_PART[ch] : ES5Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch));
    }

    function isIdentifierStartES6(ch) {
      return ch < 0x80 ? IDENTIFIER_START[ch] : ES6Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch));
    }

    function isIdentifierPartES6(ch) {
      return ch < 0x80 ? IDENTIFIER_PART[ch] : ES6Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch));
    }

    module.exports = {
      isDecimalDigit: isDecimalDigit,
      isHexDigit: isHexDigit,
      isOctalDigit: isOctalDigit,
      isWhiteSpace: isWhiteSpace,
      isLineTerminator: isLineTerminator,
      isIdentifierStartES5: isIdentifierStartES5,
      isIdentifierPartES5: isIdentifierPartES5,
      isIdentifierStartES6: isIdentifierStartES6,
      isIdentifierPartES6: isIdentifierPartES6
    };
  })();
  /* vim: set sw=4 ts=4 et tw=80 : */
});

var keyword = createCommonjsModule(function (module) {
  /*
    Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>
  
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.
      * Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.
  
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
    ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
    THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  */

  (function () {
    'use strict';

    var code$$1 = code;

    function isStrictModeReservedWordES6(id) {
      switch (id) {
        case 'implements':
        case 'interface':
        case 'package':
        case 'private':
        case 'protected':
        case 'public':
        case 'static':
        case 'let':
          return true;
        default:
          return false;
      }
    }

    function isKeywordES5(id, strict) {
      // yield should not be treated as keyword under non-strict mode.
      if (!strict && id === 'yield') {
        return false;
      }
      return isKeywordES6(id, strict);
    }

    function isKeywordES6(id, strict) {
      if (strict && isStrictModeReservedWordES6(id)) {
        return true;
      }

      switch (id.length) {
        case 2:
          return id === 'if' || id === 'in' || id === 'do';
        case 3:
          return id === 'var' || id === 'for' || id === 'new' || id === 'try';
        case 4:
          return id === 'this' || id === 'else' || id === 'case' || id === 'void' || id === 'with' || id === 'enum';
        case 5:
          return id === 'while' || id === 'break' || id === 'catch' || id === 'throw' || id === 'const' || id === 'yield' || id === 'class' || id === 'super';
        case 6:
          return id === 'return' || id === 'typeof' || id === 'delete' || id === 'switch' || id === 'export' || id === 'import';
        case 7:
          return id === 'default' || id === 'finally' || id === 'extends';
        case 8:
          return id === 'function' || id === 'continue' || id === 'debugger';
        case 10:
          return id === 'instanceof';
        default:
          return false;
      }
    }

    function isReservedWordES5(id, strict) {
      return id === 'null' || id === 'true' || id === 'false' || isKeywordES5(id, strict);
    }

    function isReservedWordES6(id, strict) {
      return id === 'null' || id === 'true' || id === 'false' || isKeywordES6(id, strict);
    }

    function isRestrictedWord(id) {
      return id === 'eval' || id === 'arguments';
    }

    function isIdentifierNameES5(id) {
      var i, iz, ch;

      if (id.length === 0) {
        return false;
      }

      ch = id.charCodeAt(0);
      if (!code$$1.isIdentifierStartES5(ch)) {
        return false;
      }

      for (i = 1, iz = id.length; i < iz; ++i) {
        ch = id.charCodeAt(i);
        if (!code$$1.isIdentifierPartES5(ch)) {
          return false;
        }
      }
      return true;
    }

    function decodeUtf16(lead, trail) {
      return (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
    }

    function isIdentifierNameES6(id) {
      var i, iz, ch, lowCh, check;

      if (id.length === 0) {
        return false;
      }

      check = code$$1.isIdentifierStartES6;
      for (i = 0, iz = id.length; i < iz; ++i) {
        ch = id.charCodeAt(i);
        if (0xD800 <= ch && ch <= 0xDBFF) {
          ++i;
          if (i >= iz) {
            return false;
          }
          lowCh = id.charCodeAt(i);
          if (!(0xDC00 <= lowCh && lowCh <= 0xDFFF)) {
            return false;
          }
          ch = decodeUtf16(ch, lowCh);
        }
        if (!check(ch)) {
          return false;
        }
        check = code$$1.isIdentifierPartES6;
      }
      return true;
    }

    function isIdentifierES5(id, strict) {
      return isIdentifierNameES5(id) && !isReservedWordES5(id, strict);
    }

    function isIdentifierES6(id, strict) {
      return isIdentifierNameES6(id) && !isReservedWordES6(id, strict);
    }

    module.exports = {
      isKeywordES5: isKeywordES5,
      isKeywordES6: isKeywordES6,
      isReservedWordES5: isReservedWordES5,
      isReservedWordES6: isReservedWordES6,
      isRestrictedWord: isRestrictedWord,
      isIdentifierNameES5: isIdentifierNameES5,
      isIdentifierNameES6: isIdentifierNameES6,
      isIdentifierES5: isIdentifierES5,
      isIdentifierES6: isIdentifierES6
    };
  })();
  /* vim: set sw=4 ts=4 et tw=80 : */
});

var utils = createCommonjsModule(function (module, exports) {
  /*
    Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>
  
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.
      * Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.
  
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
    ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
    THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  */

  (function () {
    'use strict';

    exports.ast = ast;
    exports.code = code;
    exports.keyword = keyword;
  })();
  /* vim: set sw=4 ts=4 et tw=80 : */
});

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

var index$8 = function index$8(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }

  return str.replace(matchOperatorsRe, '\\$&');
};

var index$10 = createCommonjsModule(function (module) {
  'use strict';

  function assembleStyles() {
    var styles = {
      modifiers: {
        reset: [0, 0],
        bold: [1, 22], // 21 isn't widely supported and 22 does the same thing
        dim: [2, 22],
        italic: [3, 23],
        underline: [4, 24],
        inverse: [7, 27],
        hidden: [8, 28],
        strikethrough: [9, 29]
      },
      colors: {
        black: [30, 39],
        red: [31, 39],
        green: [32, 39],
        yellow: [33, 39],
        blue: [34, 39],
        magenta: [35, 39],
        cyan: [36, 39],
        white: [37, 39],
        gray: [90, 39]
      },
      bgColors: {
        bgBlack: [40, 49],
        bgRed: [41, 49],
        bgGreen: [42, 49],
        bgYellow: [43, 49],
        bgBlue: [44, 49],
        bgMagenta: [45, 49],
        bgCyan: [46, 49],
        bgWhite: [47, 49]
      }
    };

    // fix humans
    styles.colors.grey = styles.colors.gray;

    Object.keys(styles).forEach(function (groupName) {
      var group = styles[groupName];

      Object.keys(group).forEach(function (styleName) {
        var style = group[styleName];

        styles[styleName] = group[styleName] = {
          open: '\x1B[' + style[0] + 'm',
          close: '\x1B[' + style[1] + 'm'
        };
      });

      Object.defineProperty(styles, groupName, {
        value: group,
        enumerable: false
      });
    });

    return styles;
  }

  Object.defineProperty(module, 'exports', {
    enumerable: true,
    get: assembleStyles
  });
});

var index$14 = function index$14() {
  return (/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-PRZcf-nqry=><]/g
  );
};

var ansiRegex = index$14();

var index$12 = function index$12(str) {
  return typeof str === 'string' ? str.replace(ansiRegex, '') : str;
};

var ansiRegex$1 = index$14;
var re = new RegExp(ansiRegex$1().source); // remove the `g` flag
var index$16 = re.test.bind(re);

var argv = process.argv;

var terminator = argv.indexOf('--');
var hasFlag = function hasFlag(flag) {
  flag = '--' + flag;
  var pos = argv.indexOf(flag);
  return pos !== -1 && (terminator !== -1 ? pos < terminator : true);
};

var index$18 = function () {
  if ('FORCE_COLOR' in process.env) {
    return true;
  }

  if (hasFlag('no-color') || hasFlag('no-colors') || hasFlag('color=false')) {
    return false;
  }

  if (hasFlag('color') || hasFlag('colors') || hasFlag('color=true') || hasFlag('color=always')) {
    return true;
  }

  if (process.stdout && !process.stdout.isTTY) {
    return false;
  }

  if (process.platform === 'win32') {
    return true;
  }

  if ('COLORTERM' in process.env) {
    return true;
  }

  if (process.env.TERM === 'dumb') {
    return false;
  }

  if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
    return true;
  }

  return false;
}();

var escapeStringRegexp = index$8;
var ansiStyles = index$10;
var stripAnsi = index$12;
var hasAnsi = index$16;
var supportsColor = index$18;
var defineProps = Object.defineProperties;
var isSimpleWindowsTerm = process.platform === 'win32' && !/^xterm/i.test(process.env.TERM);

function Chalk(options) {
  // detect mode if not set manually
  this.enabled = !options || options.enabled === undefined ? supportsColor : options.enabled;
}

// use bright blue on Windows as the normal blue color is illegible
if (isSimpleWindowsTerm) {
  ansiStyles.blue.open = '\x1B[94m';
}

var styles = function () {
  var ret = {};

  Object.keys(ansiStyles).forEach(function (key) {
    ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');

    ret[key] = {
      get: function get() {
        return build.call(this, this._styles.concat(key));
      }
    };
  });

  return ret;
}();

var proto = defineProps(function chalk() {}, styles);

function build(_styles) {
  var builder = function builder() {
    return applyStyle.apply(builder, arguments);
  };

  builder._styles = _styles;
  builder.enabled = this.enabled;
  // __proto__ is used because we must return a function, but there is
  // no way to create a function with a different prototype.
  /* eslint-disable no-proto */
  builder.__proto__ = proto;

  return builder;
}

function applyStyle() {
  // support varags, but simply cast to string in case there's only one arg
  var args = arguments;
  var argsLen = args.length;
  var str = argsLen !== 0 && String(arguments[0]);

  if (argsLen > 1) {
    // don't slice `arguments`, it prevents v8 optimizations
    for (var a = 1; a < argsLen; a++) {
      str += ' ' + args[a];
    }
  }

  if (!this.enabled || !str) {
    return str;
  }

  var nestedStyles = this._styles;
  var i = nestedStyles.length;

  // Turns out that on Windows dimmed gray text becomes invisible in cmd.exe,
  // see https://github.com/chalk/chalk/issues/58
  // If we're on Windows and we're dealing with a gray color, temporarily make 'dim' a noop.
  var originalDim = ansiStyles.dim.open;
  if (isSimpleWindowsTerm && (nestedStyles.indexOf('gray') !== -1 || nestedStyles.indexOf('grey') !== -1)) {
    ansiStyles.dim.open = '';
  }

  while (i--) {
    var code = ansiStyles[nestedStyles[i]];

    // Replace any instances already present with a re-opening code
    // otherwise only the part of the string until said closing code
    // will be colored, and the rest will simply be 'plain'.
    str = code.open + str.replace(code.closeRe, code.open) + code.close;
  }

  // Reset the original 'dim' if we changed it to work around the Windows dimmed gray issue.
  ansiStyles.dim.open = originalDim;

  return str;
}

function init() {
  var ret = {};

  Object.keys(styles).forEach(function (name) {
    ret[name] = {
      get: function get() {
        return build.call(this, [name]);
      }
    };
  });

  return ret;
}

defineProps(Chalk.prototype, init());

var index$6 = new Chalk();
var styles_1 = ansiStyles;
var hasColor = hasAnsi;
var stripColor = stripAnsi;
var supportsColor_1 = supportsColor;

index$6.styles = styles_1;
index$6.hasColor = hasColor;
index$6.stripColor = stripColor;
index$6.supportsColor = supportsColor_1;

var index$2 = createCommonjsModule(function (module, exports) {
  "use strict";

  exports.__esModule = true;
  exports.codeFrameColumns = codeFrameColumns;

  exports.default = function (rawLines, lineNumber, colNumber) {
    var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    if (!deprecationWarningShown) {
      deprecationWarningShown = true;

      var deprecationError = new Error("Passing lineNumber and colNumber is deprecated to babel-code-frame. Please use `codeFrameColumns`.");
      deprecationError.name = "DeprecationWarning";

      if (process.emitWarning) {
        process.emitWarning(deprecationError);
      } else {
        console.warn(deprecationError);
      }
    }

    colNumber = Math.max(colNumber, 0);

    var location = { start: { column: colNumber, line: lineNumber } };

    return codeFrameColumns(rawLines, location, opts);
  };

  var _jsTokens = index$4;

  var _jsTokens2 = _interopRequireDefault(_jsTokens);

  var _esutils = utils;

  var _esutils2 = _interopRequireDefault(_esutils);

  var _chalk = index$6;

  var _chalk2 = _interopRequireDefault(_chalk);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }

  var deprecationWarningShown = false;

  function getDefs(chalk) {
    return {
      keyword: chalk.cyan,
      capitalized: chalk.yellow,
      jsx_tag: chalk.yellow,
      punctuator: chalk.yellow,

      number: chalk.magenta,
      string: chalk.green,
      regex: chalk.magenta,
      comment: chalk.grey,
      invalid: chalk.white.bgRed.bold,
      gutter: chalk.grey,
      marker: chalk.red.bold
    };
  }

  var NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

  var JSX_TAG = /^[a-z][\w-]*$/i;

  var BRACKET = /^[()\[\]{}]$/;

  function getTokenType(match) {
    var _match$slice = match.slice(-2),
        offset = _match$slice[0],
        text = _match$slice[1];

    var token = (0, _jsTokens.matchToToken)(match);

    if (token.type === "name") {
      if (_esutils2.default.keyword.isReservedWordES6(token.value)) {
        return "keyword";
      }

      if (JSX_TAG.test(token.value) && (text[offset - 1] === "<" || text.substr(offset - 2, 2) == "</")) {
        return "jsx_tag";
      }

      if (token.value[0] !== token.value[0].toLowerCase()) {
        return "capitalized";
      }
    }

    if (token.type === "punctuator" && BRACKET.test(token.value)) {
      return "bracket";
    }

    return token.type;
  }

  function highlight(defs, text) {
    return text.replace(_jsTokens2.default, function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var type = getTokenType(args);
      var colorize = defs[type];
      if (colorize) {
        return args[0].split(NEWLINE).map(function (str) {
          return colorize(str);
        }).join("\n");
      } else {
        return args[0];
      }
    });
  }

  function getMarkerLines(loc, source, opts) {
    var startLoc = Object.assign({}, { column: 0, line: -1 }, loc.start);
    var endLoc = Object.assign({}, startLoc, loc.end);
    var linesAbove = opts.linesAbove || 2;
    var linesBelow = opts.linesBelow || 3;

    var startLine = startLoc.line;
    var startColumn = startLoc.column;
    var endLine = endLoc.line;
    var endColumn = endLoc.column;

    var start = Math.max(startLine - (linesAbove + 1), 0);
    var end = Math.min(source.length, endLine + linesBelow);

    if (startLine === -1) {
      start = 0;
    }

    if (endLine === -1) {
      end = source.length;
    }

    var lineDiff = endLine - startLine;
    var markerLines = {};

    if (lineDiff) {
      for (var i = 0; i <= lineDiff; i++) {
        var lineNumber = i + startLine;

        if (!startColumn) {
          markerLines[lineNumber] = true;
        } else if (i === 0) {
          var sourceLength = source[lineNumber - 1].length;

          markerLines[lineNumber] = [startColumn, sourceLength - startColumn];
        } else if (i === lineDiff) {
          markerLines[lineNumber] = [0, endColumn];
        } else {
          var _sourceLength = source[lineNumber - i].length;

          markerLines[lineNumber] = [0, _sourceLength];
        }
      }
    } else {
      if (startColumn === endColumn) {
        if (startColumn) {
          markerLines[startLine] = [startColumn, 0];
        } else {
          markerLines[startLine] = true;
        }
      } else {
        markerLines[startLine] = [startColumn, endColumn - startColumn];
      }
    }

    return { start: start, end: end, markerLines: markerLines };
  }

  function codeFrameColumns(rawLines, loc) {
    var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var highlighted = opts.highlightCode && _chalk2.default.supportsColor || opts.forceColor;
    var chalk = _chalk2.default;
    if (opts.forceColor) {
      chalk = new _chalk2.default.constructor({ enabled: true });
    }
    var maybeHighlight = function maybeHighlight(chalkFn, string) {
      return highlighted ? chalkFn(string) : string;
    };
    var defs = getDefs(chalk);
    if (highlighted) rawLines = highlight(defs, rawLines);

    var lines = rawLines.split(NEWLINE);

    var _getMarkerLines = getMarkerLines(loc, lines, opts),
        start = _getMarkerLines.start,
        end = _getMarkerLines.end,
        markerLines = _getMarkerLines.markerLines;

    var numberMaxWidth = String(end).length;

    var frame = lines.slice(start, end).map(function (line, index) {
      var number = start + 1 + index;
      var paddedNumber = (" " + number).slice(-numberMaxWidth);
      var gutter = " " + paddedNumber + " | ";
      var hasMarker = markerLines[number];
      if (hasMarker) {
        var markerLine = "";
        if (Array.isArray(hasMarker)) {
          var markerSpacing = line.slice(0, Math.max(hasMarker[0] - 1, 0)).replace(/[^\t]/g, " ");
          var numberOfMarkers = hasMarker[1] || 1;

          markerLine = ["\n ", maybeHighlight(defs.gutter, gutter.replace(/\d/g, " ")), markerSpacing, maybeHighlight(defs.marker, "^").repeat(numberOfMarkers)].join("");
        }
        return [maybeHighlight(defs.marker, ">"), maybeHighlight(defs.gutter, gutter), line, markerLine].join("");
      } else {
        return " " + maybeHighlight(defs.gutter, gutter) + line;
      }
    }).join("\n");

    if (highlighted) {
      return chalk.reset(frame);
    } else {
      return frame;
    }
  }
});

var path$1 = path;

var parsers = {
  get flow() {
    return eval("require")("./parser-flow");
  },
  get graphql() {
    return eval("require")("./parser-graphql");
  },
  get parse5() {
    return eval("require")("./parser-parse5");
  },
  get babylon() {
    return eval("require")("./parser-babylon");
  },
  get typescript() {
    return eval("require")("./parser-typescript");
  },
  get postcss() {
    return eval("require")("./parser-postcss");
  },
  get json() {
    return eval("require")("./parser-json");
  }
};

function resolveParseFunction(opts) {
  if (typeof opts.parser === "function") {
    return opts.parser;
  }
  if (typeof opts.parser === "string") {
    if (parsers.hasOwnProperty(opts.parser)) {
      return parsers[opts.parser];
    }
    try {
      return eval("require")(path$1.resolve(process.cwd(), opts.parser));
    } catch (err) {
      throw new Error('Couldn\'t resolve parser "' + opts.parser + '"');
    }
  }
  return parsers.babylon;
}

function parse(text, opts) {
  var parseFunction = resolveParseFunction(opts);

  try {
    return parseFunction(text, parsers, opts);
  } catch (error) {
    var loc = error.loc;

    if (loc) {
      var codeFrame = index$2;
      error.codeFrame = codeFrame.codeFrameColumns(text, loc, {
        highlightCode: true
      });
      error.message += "\n" + error.codeFrame;
      throw error;
    }

    throw error.stack;
  }
}

var parser$1 = { parse: parse };

var util$6 = util$2;
var docUtils$1 = docUtils$2;
var docBuilders$4 = docBuilders$1;
var comments$4 = comments$1;
var indent$3 = docBuilders$4.indent;
var hardline$3 = docBuilders$4.hardline;
var softline$2 = docBuilders$4.softline;
var concat$3 = docBuilders$4.concat;

function printSubtree(subtreeParser, path$$1, print, options) {
  var next = Object.assign({}, { transformDoc: function transformDoc(doc) {
      return doc;
    } }, subtreeParser);
  next.options = Object.assign({}, options, next.options, {
    originalText: next.text
  });
  var ast = parser$1.parse(next.text, next.options);
  var astComments = ast.comments;
  delete ast.comments;
  comments$4.attach(astComments, ast, next.text, next.options);
  var nextDoc = printer.printAstToDoc(ast, next.options);
  return next.transformDoc(nextDoc, { path: path$$1, print: print });
}

/**
 * @returns {{ text, options?, transformDoc? } | void}
 */
function getSubtreeParser(path$$1, options) {
  switch (options.parser) {
    case "parse5":
      return fromHtmlParser2(path$$1, options);
    case "babylon":
    case "flow":
    case "typescript":
      return fromBabylonFlowOrTypeScript(path$$1, options);
  }
}

function fromBabylonFlowOrTypeScript(path$$1) {
  var node = path$$1.getValue();

  switch (node.type) {
    case "TemplateLiteral":
      {
        var isCss = [isStyledJsx, isStyledComponents].some(function (isIt) {
          return isIt(path$$1);
        });

        if (isCss) {
          // Get full template literal with expressions replaced by placeholders
          var rawQuasis = node.quasis.map(function (q) {
            return q.value.raw;
          });
          var text = rawQuasis.join("@prettier-placeholder");
          return {
            options: { parser: "postcss" },
            transformDoc: transformCssDoc,
            text: text
          };
        }

        break;
      }
    case "TemplateElement":
      {
        var parent = path$$1.getParentNode();
        var parentParent = path$$1.getParentNode(1);

        /*
         * react-relay and graphql-tag
         * graphql`...`
         * graphql.experimental`...`
         * gql`...`
         */
        if (parentParent && parentParent.type === "TaggedTemplateExpression" && parent.quasis.length === 1 && (parentParent.tag.type === "MemberExpression" && parentParent.tag.object.name === "graphql" && parentParent.tag.property.name === "experimental" || parentParent.tag.type === "Identifier" && (parentParent.tag.name === "gql" || parentParent.tag.name === "graphql"))) {
          return {
            options: { parser: "graphql" },
            transformDoc: function transformDoc(doc) {
              return concat$3([indent$3(concat$3([softline$2, stripTrailingHardline(doc)])), softline$2]);
            },
            text: parent.quasis[0].value.raw
          };
        }

        break;
      }
  }
}

function fromHtmlParser2(path$$1, options) {
  var node = path$$1.getValue();

  switch (node.type) {
    case "text":
      {
        var parent = path$$1.getParentNode();
        // Inline JavaScript
        if (parent.type === "script" && (!parent.attribs.lang && !parent.attribs.lang || parent.attribs.type === "text/javascript" || parent.attribs.type === "application/javascript")) {
          var _parser = options.parser === "flow" ? "flow" : "babylon";
          return {
            options: { parser: _parser },
            transformDoc: function transformDoc(doc) {
              return concat$3([hardline$3, doc]);
            },
            text: getText(options, node)
          };
        }

        // Inline TypeScript
        if (parent.type === "script" && (parent.attribs.type === "application/x-typescript" || parent.attribs.lang === "ts")) {
          return {
            options: { parser: "typescript" },
            transformDoc: function transformDoc(doc) {
              return concat$3([hardline$3, doc]);
            },
            text: getText(options, node)
          };
        }

        // Inline Styles
        if (parent.type === "style") {
          return {
            options: { parser: "postcss" },
            transformDoc: function transformDoc(doc) {
              return concat$3([hardline$3, stripTrailingHardline(doc)]);
            },
            text: getText(options, node)
          };
        }

        break;
      }

    case "attribute":
      {
        /*
         * Vue binding sytax: JS expressions
         * :class="{ 'some-key': value }"
         * v-bind:id="'list-' + id"
         * v-if="foo && !bar"
         * @click="someFunction()"
         */
        if (/(^@)|(^v-)|:/.test(node.key) && !/^\w+$/.test(node.value)) {
          return {
            text: node.value,
            options: {
              parser: parseJavaScriptExpression,
              // Use singleQuote since HTML attributes use double-quotes.
              // TODO(azz): We still need to do an entity escape on the attribute.
              singleQuote: true
            },
            transformDoc: function transformDoc(doc) {
              return concat$3([node.key, '="', util$6.hasNewlineInRange(node.value, 0, node.value.length) ? doc : docUtils$1.removeLines(doc), '"']);
            }
          };
        }
      }
  }
}

function transformCssDoc(quasisDoc, parent) {
  var parentNode = parent.path.getValue();
  var expressionDocs = parentNode.expressions ? parent.path.map(parent.print, "expressions") : [];
  var newDoc = replacePlaceholders(quasisDoc, expressionDocs);
  if (!newDoc) {
    throw new Error("Couldn't insert all the expressions");
  }
  return concat$3(["`", indent$3(concat$3([softline$2, stripTrailingHardline(newDoc)])), softline$2, "`"]);
}

// Search all the placeholders in the quasisDoc tree
// and replace them with the expression docs one by one
// returns a new doc with all the placeholders replaced,
// or null if it couldn't replace any expression
function replacePlaceholders(quasisDoc, expressionDocs) {
  if (!expressionDocs || !expressionDocs.length) {
    return quasisDoc;
  }

  var expressions = expressionDocs.slice();
  var newDoc = docUtils$1.mapDoc(quasisDoc, function (doc) {
    if (!doc || !doc.parts || !doc.parts.length) {
      return doc;
    }
    var parts = doc.parts;
    if (parts.length > 1 && parts[0] === "@" && typeof parts[1] === "string" && parts[1].startsWith("prettier-placeholder")) {
      // If placeholder is split, join it
      var at = parts[0];
      var placeholder = parts[1];
      var rest = parts.slice(2);
      parts = [at + placeholder].concat(rest);
    }
    if (typeof parts[0] === "string" && parts[0].startsWith("@prettier-placeholder")) {
      var _placeholder = parts[0];
      var _rest = parts.slice(1);

      // When the expression has a suffix appended, like:
      // animation: linear ${time}s ease-out;
      var suffix = _placeholder.slice("@prettier-placeholder".length);

      var expression = expressions.shift();
      parts = ["${", expression, "}" + suffix].concat(_rest);
    }
    return Object.assign({}, doc, {
      parts: parts
    });
  });

  return expressions.length === 0 ? newDoc : null;
}

function parseJavaScriptExpression(text, parsers) {
  // Force parsing as an expression
  var ast = parsers.babylon('(' + text + ')');
  // Extract expression from the declaration
  return {
    type: "File",
    program: ast.program.body[0].expression
  };
}

function getText(options, node) {
  return options.originalText.slice(util$6.locStart(node), util$6.locEnd(node));
}

function stripTrailingHardline(doc) {
  // HACK remove ending hardline, original PR: #1984
  if (doc.type === "concat" && doc.parts[0].type === "concat" && doc.parts[0].parts.length === 2 &&
  // doc.parts[0].parts[1] === hardline :
  doc.parts[0].parts[1].type === "concat" && doc.parts[0].parts[1].parts.length === 2 && doc.parts[0].parts[1].parts[0].hard && doc.parts[0].parts[1].parts[1].type === "break-parent") {
    return doc.parts[0].parts[0];
  }
  return doc;
}

/**
 * Template literal in this context:
 * <style jsx>{`div{color:red}`}</style>
 */
function isStyledJsx(path$$1) {
  var node = path$$1.getValue();
  var parent = path$$1.getParentNode();
  var parentParent = path$$1.getParentNode(1);
  return parentParent && node.quasis && parent.type === "JSXExpressionContainer" && parentParent.type === "JSXElement" && parentParent.openingElement.name.name === "style" && parentParent.openingElement.attributes.some(function (attribute) {
    return attribute.name.name === "jsx";
  });
}

/**
 * Template literal in this context:
 * styled.button`color: red`
 * or
 * Foo.extend`color: red`
 */
function isStyledComponents(path$$1) {
  var parent = path$$1.getParentNode();
  return parent && parent.type === "TaggedTemplateExpression" && parent.tag.type === "MemberExpression" && (parent.tag.object.name === "styled" || /^[A-Z]/.test(parent.tag.object.name) && parent.tag.property.name === "extend");
}

var multiparser$1 = {
  getSubtreeParser: getSubtreeParser,
  printSubtree: printSubtree
};

var docBuilders$5 = docBuilders$1;
var concat$4 = docBuilders$5.concat;
var join$3 = docBuilders$5.join;
var hardline$4 = docBuilders$5.hardline;
var line$2 = docBuilders$5.line;
var softline$3 = docBuilders$5.softline;
var group$2 = docBuilders$5.group;
var indent$4 = docBuilders$5.indent;
var ifBreak$2 = docBuilders$5.ifBreak;

function genericPrint$1(path$$1, options, print) {
  var n = path$$1.getValue();
  if (!n) {
    return "";
  }

  if (typeof n === "string") {
    return n;
  }

  switch (n.kind) {
    case "Document":
      {
        return concat$4([join$3(concat$4([hardline$4, hardline$4]), path$$1.map(print, "definitions")), hardline$4]);
      }
    case "OperationDefinition":
      {
        return concat$4([n.name === null ? "" : n.operation, n.name ? concat$4([" ", path$$1.call(print, "name")]) : "", n.variableDefinitions && n.variableDefinitions.length ? group$2(concat$4(["(", indent$4(concat$4([softline$3, join$3(concat$4([",", ifBreak$2("", " "), softline$3]), path$$1.map(print, "variableDefinitions"))])), options.trailingComma === "none" ? "" : ifBreak$2(","), softline$3, ")"])) : "", printDirectives(path$$1, print, n), n.selectionSet ? n.name === null ? "" : " " : "", path$$1.call(print, "selectionSet")]);
      }
    case "FragmentDefinition":
      {
        return concat$4(["fragment ", path$$1.call(print, "name"), " on ", path$$1.call(print, "typeCondition"), printDirectives(path$$1, print, n), " ", path$$1.call(print, "selectionSet")]);
      }
    case "SelectionSet":
      {
        return concat$4(["{", indent$4(concat$4([hardline$4, join$3(hardline$4, path$$1.map(print, "selections"))])), hardline$4, "}"]);
      }
    case "Field":
      {
        return group$2(concat$4([n.alias ? concat$4([path$$1.call(print, "alias"), ": "]) : "", path$$1.call(print, "name"), n.arguments.length > 0 ? group$2(concat$4(["(", indent$4(concat$4([softline$3, join$3(concat$4([",", ifBreak$2("", " "), softline$3]), path$$1.map(print, "arguments"))])), options.trailingComma === "none" ? "" : ifBreak$2(","), softline$3, ")"])) : "", printDirectives(path$$1, print, n), n.selectionSet ? " " : "", path$$1.call(print, "selectionSet")]));
      }
    case "Name":
      {
        return n.value;
      }
    case "StringValue":
      {
        return concat$4(['"', n.value, '"']);
      }
    case "IntValue":
    case "FloatValue":
    case "EnumValue":
      {
        return n.value;
      }
    case "BooleanValue":
      {
        return n.value ? "true" : "false";
      }
    case "NullValue":
      {
        return "null";
      }
    case "Variable":
      {
        return concat$4(["$", path$$1.call(print, "name")]);
      }
    case "ListValue":
      {
        return group$2(concat$4(["[", indent$4(concat$4([softline$3, join$3(concat$4([",", ifBreak$2("", " "), softline$3]), path$$1.map(print, "values"))])), options.trailingComma === "none" ? "" : ifBreak$2(","), softline$3, "]"]));
      }
    case "ObjectValue":
      {
        return group$2(concat$4(["{", options.bracketSpacing && n.fields.length > 0 ? " " : "", indent$4(concat$4([softline$3, join$3(concat$4([",", ifBreak$2("", " "), softline$3]), path$$1.map(print, "fields"))])), options.trailingComma === "none" ? "" : ifBreak$2(","), softline$3, ifBreak$2("", options.bracketSpacing && n.fields.length > 0 ? " " : ""), "}"]));
      }
    case "ObjectField":
    case "Argument":
      {
        return concat$4([path$$1.call(print, "name"), ": ", path$$1.call(print, "value")]);
      }

    case "Directive":
      {
        return concat$4(["@", path$$1.call(print, "name"), n.arguments.length > 0 ? group$2(concat$4(["(", indent$4(concat$4([softline$3, join$3(concat$4([",", ifBreak$2("", " "), softline$3]), path$$1.map(print, "arguments"))])), options.trailingComma === "none" ? "" : ifBreak$2(","), softline$3, ")"])) : ""]);
      }

    case "NamedType":
      {
        return path$$1.call(print, "name");
      }

    case "VariableDefinition":
      {
        return concat$4([path$$1.call(print, "variable"), ": ", path$$1.call(print, "type"), n.defaultValue ? concat$4([" = ", path$$1.call(print, "defaultValue")]) : ""]);
      }

    case "FragmentSpread":
      {
        return concat$4(["...", path$$1.call(print, "name"), printDirectives(path$$1, print, n)]);
      }

    case "InlineFragment":
      {
        return concat$4(["...", n.typeCondition ? concat$4([" on ", path$$1.call(print, "typeCondition")]) : "", printDirectives(path$$1, print, n), " ", path$$1.call(print, "selectionSet")]);
      }

    case "UnionTypeDefinition":
      {
        return group$2(concat$4(["union ", path$$1.call(print, "name"), " =", ifBreak$2("", " "), indent$4(concat$4([ifBreak$2(concat$4([line$2, "  "])), join$3(concat$4([line$2, "| "]), path$$1.map(print, "types"))]))]));
      }

    case "NonNullType":
      {
        return concat$4([path$$1.call(print, "type"), "!"]);
      }

    case "ListType":
      {
        return concat$4(["[", path$$1.call(print, "type"), "]"]);
      }

    default:
      throw new Error("unknown graphql type: " + JSON.stringify(n.kind));
  }
}

function printDirectives(path$$1, print, n) {
  if (n.directives.length === 0) {
    return "";
  }

  return concat$4([" ", group$2(indent$4(concat$4([softline$3, join$3(concat$4([ifBreak$2("", " "), softline$3]), path$$1.map(print, "directives"))])))]);
}

var printerGraphql = genericPrint$1;

var util$7 = util$2;
var docBuilders$6 = docBuilders$1;
var concat$5 = docBuilders$6.concat;
var join$4 = docBuilders$6.join;
var hardline$5 = docBuilders$6.hardline;
var line$3 = docBuilders$6.line;
var softline$4 = docBuilders$6.softline;
var group$3 = docBuilders$6.group;
var indent$5 = docBuilders$6.indent;
// const ifBreak = docBuilders.ifBreak;

// http://w3c.github.io/html/single-page.html#void-elements
var voidTags = {
  area: true,
  base: true,
  br: true,
  col: true,
  embed: true,
  hr: true,
  img: true,
  input: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true
};

function genericPrint$2(path$$1, options, print) {
  var n = path$$1.getValue();
  if (!n) {
    return "";
  }

  if (typeof n === "string") {
    return n;
  }

  switch (n.type) {
    case "root":
      {
        return printChildren(path$$1, print);
      }
    case "directive":
      {
        return concat$5(["<", n.data, ">", hardline$5]);
      }
    case "text":
      {
        return n.data.replace(/\s+/g, " ").trim();
      }
    case "script":
    case "style":
    case "tag":
      {
        var selfClose = voidTags[n.name] ? ">" : " />";
        var children = printChildren(path$$1, print);

        var _hasNewline = util$7.hasNewlineInRange(options.originalText, util$7.locStart(n), util$7.locEnd(n));

        return group$3(concat$5([_hasNewline ? hardline$5 : "", "<", n.name, printAttributes(path$$1, print), n.children.length ? ">" : selfClose, n.name.toLowerCase() === "html" ? concat$5([hardline$5, children]) : indent$5(children), n.children.length ? concat$5([softline$4, "</", n.name, ">"]) : hardline$5]));
      }
    case "comment":
      {
        return concat$5(["<!-- ", n.data.trim(), " -->"]);
      }
    case "attribute":
      {
        if (!n.value) {
          return n.key;
        }
        return concat$5([n.key, '="', n.value, '"']);
      }

    default:
      throw new Error("unknown htmlparser2 type: " + n.type);
  }
}

function printAttributes(path$$1, print) {
  var node = path$$1.getValue();

  return concat$5([node.attributes.length ? " " : "", indent$5(join$4(line$3, path$$1.map(print, "attributes")))]);
}

function printChildren(path$$1, print) {
  var children = [];
  path$$1.each(function (childPath) {
    var child = childPath.getValue();
    if (child.type !== "text") {
      children.push(hardline$5);
    }
    children.push(childPath.call(print));
  }, "children");
  return concat$5(children);
}

var printerHtmlparser2 = genericPrint$2;

var util$8 = util$2;
var docBuilders$7 = docBuilders$1;
var concat$6 = docBuilders$7.concat;
var join$5 = docBuilders$7.join;
var line$4 = docBuilders$7.line;
var hardline$6 = docBuilders$7.hardline;
var softline$5 = docBuilders$7.softline;
var group$4 = docBuilders$7.group;
var fill$2 = docBuilders$7.fill;
var indent$6 = docBuilders$7.indent;

var docUtils$4 = docUtils$2;
var removeLines$1 = docUtils$4.removeLines;

function genericPrint$3(path$$1, options, print) {
  var n = path$$1.getValue();

  if (!n) {
    return "";
  }

  if (typeof n === "string") {
    return n;
  }

  switch (n.type) {
    case "css-root":
      {
        return concat$6([printNodeSequence(path$$1, options, print), hardline$6]);
      }
    case "css-comment":
      {
        if (n.raws.content) {
          return n.raws.content;
        }
        var text = options.originalText.slice(util$8.locStart(n), util$8.locEnd(n));
        var _rawText = n.raws.text || n.text;
        // Workaround a bug where the location is off.
        // https://github.com/postcss/postcss-scss/issues/63
        if (text.indexOf(_rawText) === -1) {
          if (n.raws.inline) {
            return concat$6(["// ", _rawText]);
          }
          return concat$6(["/* ", _rawText, " */"]);
        }
        return text;
      }
    case "css-rule":
      {
        return concat$6([path$$1.call(print, "selector"), n.important ? " !important" : "", n.nodes ? concat$6([" {", n.nodes.length > 0 ? indent$6(concat$6([hardline$6, printNodeSequence(path$$1, options, print)])) : "", hardline$6, "}"]) : ";"]);
      }
    case "css-decl":
      {
        // When the following less construct &:extend(.foo); is parsed with scss,
        // it will put a space after `:` and break it. Ideally we should parse
        // less files with less, but we can hardcode this to work with scss as
        // well.
        var isValueExtend = n.value.type === "value-root" && n.value.group.type === "value-value" && n.value.group.group.type === "value-func" && n.value.group.group.value === "extend";
        var isComposed = n.value.type === "value-root" && n.value.group.type === "value-value" && n.prop === "composes";

        return concat$6([n.raws.before.replace(/[\s;]/g, ""), n.prop, ":", isValueExtend ? "" : " ", isComposed ? removeLines$1(path$$1.call(print, "value")) : path$$1.call(print, "value"), n.important ? " !important" : "", n.nodes ? concat$6([" {", indent$6(concat$6([softline$5, printNodeSequence(path$$1, options, print)])), softline$5, "}"]) : ";"]);
      }
    case "css-atrule":
      {
        var hasParams = n.params && !(n.params.type === "media-query-list" && n.params.value === "");
        return concat$6(["@", n.name, hasParams ? concat$6([" ", path$$1.call(print, "params")]) : "", n.nodes ? concat$6([" {", indent$6(concat$6([n.nodes.length > 0 ? softline$5 : "", printNodeSequence(path$$1, options, print)])), softline$5, "}"]) : ";"]);
      }
    case "css-import":
      {
        return concat$6(["@", n.name, " ", n.directives ? concat$6([n.directives, " "]) : "", n.importPath, ";"]);
      }
    // postcss-media-query-parser
    case "media-query-list":
      {
        var parts = [];
        path$$1.each(function (childPath) {
          var node = childPath.getValue();
          if (node.type === "media-query" && node.value === "") {
            return;
          }
          parts.push(childPath.call(print));
        }, "nodes");
        return group$4(indent$6(join$5(concat$6([",", line$4]), parts)));
      }
    case "media-query":
      {
        return join$5(" ", path$$1.map(print, "nodes"));
      }
    case "media-type":
      {
        return n.value;
      }
    case "media-feature-expression":
      {
        if (!n.nodes) {
          return n.value;
        }
        return concat$6(["(", concat$6(path$$1.map(print, "nodes")), ")"]);
      }
    case "media-feature":
      {
        return n.value.replace(/ +/g, " ");
      }
    case "media-colon":
      {
        return concat$6([n.value, " "]);
      }
    case "media-value":
      {
        return n.value;
      }
    case "media-keyword":
      {
        return n.value;
      }
    case "media-url":
      {
        return n.value;
      }
    case "media-unknown":
      {
        return n.value;
      }
    // postcss-selector-parser
    case "selector-root":
      {
        return group$4(join$5(concat$6([",", hardline$6]), path$$1.map(print, "nodes")));
      }
    case "selector-comment":
      {
        return n.value;
      }
    case "selector-string":
      {
        return n.value;
      }
    case "selector-tag":
      {
        return n.value;
      }
    case "selector-id":
      {
        return concat$6(["#", n.value]);
      }
    case "selector-class":
      {
        return concat$6([".", n.value]);
      }
    case "selector-attribute":
      {
        return concat$6(["[", n.attribute, n.operator ? n.operator : "", n.value ? n.value : "", n.insensitive ? " i" : "", "]"]);
      }
    case "selector-combinator":
      {
        if (n.value === "+" || n.value === ">" || n.value === "~") {
          var parent = path$$1.getParentNode();
          var leading = parent.type === "selector-selector" && parent.nodes[0] === n ? "" : line$4;
          return concat$6([leading, n.value, " "]);
        }
        return n.value;
      }
    case "selector-universal":
      {
        return n.value;
      }
    case "selector-selector":
      {
        return group$4(indent$6(concat$6(path$$1.map(print, "nodes"))));
      }
    case "selector-pseudo":
      {
        return concat$6([n.value, n.nodes && n.nodes.length > 0 ? concat$6(["(", join$5(", ", path$$1.map(print, "nodes")), ")"]) : ""]);
      }
    case "selector-nesting":
      {
        return printValue(n.value);
      }
    // postcss-values-parser
    case "value-root":
      {
        return path$$1.call(print, "group");
      }
    case "value-comma_group":
      {
        var printed = path$$1.map(print, "groups");
        var _parts = [];
        for (var i = 0; i < n.groups.length; ++i) {
          _parts.push(printed[i]);
          if (i !== n.groups.length - 1 && n.groups[i + 1].raws && n.groups[i + 1].raws.before !== "") {
            if (n.groups[i + 1].type === "value-operator" && ["+", "-", "/", "*", "%"].indexOf(n.groups[i + 1].value) !== -1) {
              _parts.push(" ");
            } else {
              _parts.push(line$4);
            }
          }
        }

        return group$4(indent$6(fill$2(_parts)));
      }
    case "value-paren_group":
      {
        var _parent2 = path$$1.getParentNode();
        var isURLCall = _parent2 && _parent2.type === "value-func" && _parent2.value === "url";

        if (isURLCall && (n.groups.length === 1 || n.groups.length > 0 && n.groups[0].type === "value-comma_group" && n.groups[0].groups.length > 0 && n.groups[0].groups[0].type === "value-word" && n.groups[0].groups[0].value === "data")) {
          return concat$6([n.open ? path$$1.call(print, "open") : "", join$5(",", path$$1.map(print, "groups")), n.close ? path$$1.call(print, "close") : ""]);
        }

        if (!n.open) {
          var _printed = path$$1.map(print, "groups");
          var res = [];

          for (var _i5 = 0; _i5 < _printed.length; _i5++) {
            if (_i5 !== 0) {
              res.push(concat$6([",", line$4]));
            }
            res.push(_printed[_i5]);
          }
          return group$4(indent$6(fill$2(res)));
        }

        return group$4(concat$6([n.open ? path$$1.call(print, "open") : "", indent$6(concat$6([softline$5, join$5(concat$6([",", line$4]), path$$1.map(print, "groups"))])), softline$5, n.close ? path$$1.call(print, "close") : ""]));
      }
    case "value-value":
      {
        return path$$1.call(print, "group");
      }
    case "value-func":
      {
        return concat$6([n.value, path$$1.call(print, "group")]);
      }
    case "value-paren":
      {
        if (n.raws.before !== "") {
          return concat$6([line$4, n.value]);
        }
        return n.value;
      }
    case "value-number":
      {
        return concat$6([n.value, n.unit]);
      }
    case "value-operator":
      {
        return n.value;
      }
    case "value-word":
      {
        if (n.isColor && n.isHex) {
          return n.value.toLowerCase();
        }
        return n.value;
      }
    case "value-colon":
      {
        return n.value;
      }
    case "value-comma":
      {
        return concat$6([n.value, " "]);
      }
    case "value-string":
      {
        return concat$6([n.quoted ? n.raws.quote : "", n.value, n.quoted ? n.raws.quote : ""]);
      }
    case "value-atword":
      {
        return concat$6(["@", n.value]);
      }

    default:
      throw new Error("unknown postcss type: " + JSON.stringify(n.type));
  }
}

function printNodeSequence(path$$1, options, print) {
  var node = path$$1.getValue();
  var parts = [];
  var i = 0;
  path$$1.map(function (pathChild) {
    var prevNode = node.nodes[i - 1];
    if (prevNode && prevNode.type === "css-comment" && prevNode.text.trim() === "prettier-ignore") {
      var childNode = pathChild.getValue();
      parts.push(options.originalText.slice(util$8.locStart(childNode), util$8.locEnd(childNode)));
    } else {
      parts.push(pathChild.call(print));
    }

    if (i !== node.nodes.length - 1) {
      if (node.nodes[i + 1].type === "css-comment" && !util$8.hasNewline(options.originalText, util$8.locStart(node.nodes[i + 1]), { backwards: true }) || node.nodes[i + 1].type === "css-atrule" && node.nodes[i + 1].name === "else") {
        parts.push(" ");
      } else {
        parts.push(hardline$6);
        if (util$8.isNextLineEmpty(options.originalText, pathChild.getValue())) {
          parts.push(hardline$6);
        }
      }
    }
    i++;
  }, "nodes");

  return concat$6(parts);
}

function printValue(value) {
  return value;
}

var printerPostcss = genericPrint$3;

var assert$1 = require$$0;
var comments$3 = comments$1;
var FastPath = fastPath;
var multiparser = multiparser$1;
var util$4 = util$2;
var isIdentifierName = utils.keyword.isIdentifierNameES6;

var docBuilders$3 = docBuilders$1;
var concat$2 = docBuilders$3.concat;
var join$2 = docBuilders$3.join;
var line$1 = docBuilders$3.line;
var hardline$2 = docBuilders$3.hardline;
var softline$1 = docBuilders$3.softline;
var literalline$1 = docBuilders$3.literalline;
var group$1 = docBuilders$3.group;
var indent$2 = docBuilders$3.indent;
var align$1 = docBuilders$3.align;
var conditionalGroup$1 = docBuilders$3.conditionalGroup;
var fill$1 = docBuilders$3.fill;
var ifBreak$1 = docBuilders$3.ifBreak;
var breakParent$2 = docBuilders$3.breakParent;
var lineSuffixBoundary$1 = docBuilders$3.lineSuffixBoundary;
var addAlignmentToDoc$1 = docBuilders$3.addAlignmentToDoc;

var docUtils = docUtils$2;
var willBreak = docUtils.willBreak;
var isLineNext = docUtils.isLineNext;
var isEmpty = docUtils.isEmpty;
var rawText = docUtils.rawText;

function shouldPrintComma(options, level) {
  level = level || "es5";

  switch (options.trailingComma) {
    case "all":
      if (level === "all") {
        return true;
      }
    // fallthrough
    case "es5":
      if (level === "es5") {
        return true;
      }
    // fallthrough
    case "none":
    default:
      return false;
  }
}

function getPrintFunction(options) {
  switch (options.parser) {
    case "graphql":
      return printerGraphql;
    case "parse5":
      return printerHtmlparser2;
    case "postcss":
      return printerPostcss;
    default:
      return genericPrintNoParens;
  }
}

function genericPrint(path$$1, options, printPath, args) {
  assert$1.ok(path$$1 instanceof FastPath);

  var node = path$$1.getValue();

  // Escape hatch
  if (node && node.comments && node.comments.length > 0 && node.comments.some(function (comment) {
    return comment.value.trim() === "prettier-ignore";
  })) {
    return options.originalText.slice(util$4.locStart(node), util$4.locEnd(node));
  }

  if (node) {
    // Potentially switch to a different parser
    var next = multiparser.getSubtreeParser(path$$1, options);
    if (next) {
      try {
        return multiparser.printSubtree(next, path$$1, printPath, options);
      } catch (error) {
        if (process.env.PRETTIER_DEBUG) {
          console.error(error);
        }
        // Continue with current parser
      }
    }
  }

  var needsParens = false;
  var linesWithoutParens = getPrintFunction(options)(path$$1, options, printPath, args);

  if (!node || isEmpty(linesWithoutParens)) {
    return linesWithoutParens;
  }

  var decorators = [];
  if (node.decorators && node.decorators.length > 0 &&
  // If the parent node is an export declaration, it will be
  // responsible for printing node.decorators.
  !util$4.getParentExportDeclaration(path$$1)) {
    var separator = hardline$2;
    path$$1.each(function (decoratorPath) {
      var prefix = "@";
      var decorator = decoratorPath.getValue();
      if (decorator.expression) {
        decorator = decorator.expression;
        prefix = "";
      }

      if (node.decorators.length === 1 && node.type !== "ClassDeclaration" && node.type !== "MethodDefinition" && node.type !== "ClassMethod" && (decorator.type === "Identifier" || decorator.type === "MemberExpression" || decorator.type === "CallExpression" && (decorator.arguments.length === 0 || decorator.arguments.length === 1 && (isStringLiteral(decorator.arguments[0]) || decorator.arguments[0].type === "Identifier" || decorator.arguments[0].type === "MemberExpression")))) {
        separator = line$1;
      }

      decorators.push(prefix, printPath(decoratorPath), separator);
    }, "decorators");
  } else if (util$4.isExportDeclaration(node) && node.declaration && node.declaration.decorators) {
    // Export declarations are responsible for printing any decorators
    // that logically apply to node.declaration.
    path$$1.each(function (decoratorPath) {
      var decorator = decoratorPath.getValue();
      var prefix = decorator.type === "Decorator" || decorator.type === "TSDecorator" ? "" : "@";
      decorators.push(prefix, printPath(decoratorPath), hardline$2);
    }, "declaration", "decorators");
  } else {
    // Nodes with decorators can't have parentheses, so we can avoid
    // computing path.needsParens() except in this case.
    needsParens = path$$1.needsParens(options);
  }

  if (node.type) {
    // HACK: ASI prevention in no-semi mode relies on knowledge of whether
    // or not a paren has been inserted (see `exprNeedsASIProtection()`).
    // For now, we're just passing that information by mutating the AST here,
    // but it would be nice to find a cleaner way to do this.
    node.needsParens = needsParens;
  }

  var parts = [];
  if (needsParens) {
    parts.unshift("(");
  }

  parts.push(linesWithoutParens);

  if (needsParens) {
    parts.push(")");
  }

  if (decorators.length > 0) {
    return group$1(concat$2(decorators.concat(parts)));
  }
  return concat$2(parts);
}

function genericPrintNoParens(path$$1, options, print, args) {
  var n = path$$1.getValue();
  var semi = options.semi ? ";" : "";

  if (!n) {
    return "";
  }

  if (typeof n === "string") {
    return n;
  }

  var parts = [];
  switch (n.type) {
    case "File":
      return path$$1.call(print, "program");
    case "Program":
      // Babel 6
      if (n.directives) {
        path$$1.each(function (childPath) {
          parts.push(print(childPath), semi, hardline$2);
          if (util$4.isNextLineEmpty(options.originalText, childPath.getValue())) {
            parts.push(hardline$2);
          }
        }, "directives");
      }

      parts.push(path$$1.call(function (bodyPath) {
        return printStatementSequence(bodyPath, options, print);
      }, "body"));

      parts.push(comments$3.printDanglingComments(path$$1, options, /* sameIndent */true));

      // Only force a trailing newline if there were any contents.
      if (n.body.length || n.comments) {
        parts.push(hardline$2);
      }

      return concat$2(parts);
    // Babel extension.
    case "Noop":
    case "EmptyStatement":
      return "";
    case "ExpressionStatement":
      // Detect Flow-parsed directives
      if (n.directive) {
        return concat$2([nodeStr(n.expression, options, true), semi]);
      }
      return concat$2([path$$1.call(print, "expression"), semi]); // Babel extension.
    case "ParenthesizedExpression":
      return concat$2(["(", path$$1.call(print, "expression"), ")"]);
    case "AssignmentExpression":
      return printAssignment(n.left, path$$1.call(print, "left"), concat$2([" ", n.operator]), n.right, path$$1.call(print, "right"), options);
    case "BinaryExpression":
    case "LogicalExpression":
      {
        var parent = path$$1.getParentNode();
        var parentParent = path$$1.getParentNode(1);
        var isInsideParenthesis = n !== parent.body && (parent.type === "IfStatement" || parent.type === "WhileStatement" || parent.type === "DoStatement");

        var _parts2 = printBinaryishExpressions(path$$1, print, options,
        /* isNested */false, isInsideParenthesis);

        //   if (
        //     this.hasPlugin("dynamicImports") && this.lookahead().type === tt.parenLeft
        //   ) {
        //
        // looks super weird, we want to break the children if the parent breaks
        //
        //   if (
        //     this.hasPlugin("dynamicImports") &&
        //     this.lookahead().type === tt.parenLeft
        //   ) {
        if (isInsideParenthesis) {
          return concat$2(_parts2);
        }

        if (parent.type === "UnaryExpression") {
          return group$1(concat$2([indent$2(concat$2([softline$1, concat$2(_parts2)])), softline$1]));
        }

        // Avoid indenting sub-expressions in assignment/return/etc statements.
        if (parent.type === "AssignmentExpression" || parent.type === "VariableDeclarator" || shouldInlineLogicalExpression(n) || parent.type === "ReturnStatement" || parent.type === "JSXExpressionContainer" && parentParent.type === "JSXAttribute" || n === parent.body && parent.type === "ArrowFunctionExpression" || n !== parent.body && parent.type === "ForStatement" || parent.type === "ObjectProperty" || parent.type === "Property" || parent.type === "ConditionalExpression") {
          return group$1(concat$2(_parts2));
        }

        var rest = concat$2(_parts2.slice(1));

        return group$1(concat$2([
        // Don't include the initial expression in the indentation
        // level. The first item is guaranteed to be the first
        // left-most expression.
        _parts2.length > 0 ? _parts2[0] : "", indent$2(rest)]));
      }
    case "AssignmentPattern":
      return concat$2([path$$1.call(print, "left"), " = ", path$$1.call(print, "right")]);
    case "TSTypeAssertionExpression":
      return concat$2(["<", path$$1.call(print, "typeAnnotation"), ">", path$$1.call(print, "expression")]);
    case "MemberExpression":
      {
        var _parent3 = path$$1.getParentNode();
        var firstNonMemberParent = void 0;
        var i = 0;
        do {
          firstNonMemberParent = path$$1.getParentNode(i);
          i++;
        } while (firstNonMemberParent && firstNonMemberParent.type === "MemberExpression");

        var shouldInline = firstNonMemberParent && (firstNonMemberParent.type === "VariableDeclarator" && firstNonMemberParent.id.type !== "Identifier" || firstNonMemberParent.type === "AssignmentExpression" && firstNonMemberParent.left.type !== "Identifier") || n.computed || n.object.type === "Identifier" && n.property.type === "Identifier" && _parent3.type !== "MemberExpression";

        return concat$2([path$$1.call(print, "object"), shouldInline ? printMemberLookup(path$$1, options, print) : group$1(indent$2(concat$2([softline$1, printMemberLookup(path$$1, options, print)])))]);
      }
    case "MetaProperty":
      return concat$2([path$$1.call(print, "meta"), ".", path$$1.call(print, "property")]);
    case "BindExpression":
      if (n.object) {
        parts.push(path$$1.call(print, "object"));
      }

      parts.push("::", path$$1.call(print, "callee"));

      return concat$2(parts);
    case "Path":
      return join$2(".", n.body);
    case "Identifier":
      {
        var parentNode = path$$1.getParentNode();
        var isFunctionDeclarationIdentifier = parentNode.type === "DeclareFunction" && parentNode.id === n;

        return concat$2([n.name, n.optional ? "?" : "", n.typeAnnotation && !isFunctionDeclarationIdentifier ? ": " : "", path$$1.call(print, "typeAnnotation")]);
      }
    case "SpreadElement":
    case "SpreadElementPattern":
    case "RestProperty":
    case "ExperimentalRestProperty":
    case "ExperimentalSpreadProperty":
    case "SpreadProperty":
    case "SpreadPropertyPattern":
    case "RestElement":
    case "ObjectTypeSpreadProperty":
      return concat$2(["...", path$$1.call(print, "argument"), n.typeAnnotation ? ": " : "", path$$1.call(print, "typeAnnotation")]);
    case "FunctionDeclaration":
    case "FunctionExpression":
    case "TSNamespaceFunctionDeclaration":
      if (isNodeStartingWithDeclare(n, options)) {
        parts.push("declare ");
      }
      parts.push(printFunctionDeclaration(path$$1, print, options));
      if (!n.body) {
        parts.push(semi);
      }
      return concat$2(parts);
    case "ArrowFunctionExpression":
      {
        if (n.async) {
          parts.push("async ");
        }

        if (canPrintParamsWithoutParens(n)) {
          parts.push(path$$1.call(print, "params", 0));
        } else {
          parts.push(group$1(concat$2([printFunctionParams(path$$1, print, options,
          /* expandLast */args && (args.expandLastArg || args.expandFirstArg),
          /* printTypeParams */true), printReturnType(path$$1, print)])));
        }

        parts.push(" =>");

        var body = path$$1.call(function (bodyPath) {
          return print(bodyPath, args);
        }, "body");
        var collapsed = concat$2([concat$2(parts), " ", body]);

        // We want to always keep these types of nodes on the same line
        // as the arrow.
        if (!hasLeadingOwnLineComment(options.originalText, n.body) && (n.body.type === "ArrayExpression" || n.body.type === "ObjectExpression" || n.body.type === "BlockStatement" || n.body.type === "SequenceExpression" || isTemplateOnItsOwnLine(n.body, options.originalText) || n.body.type === "ArrowFunctionExpression")) {
          return group$1(collapsed);
        }

        // if the arrow function is expanded as last argument, we are adding a
        // level of indentation and need to add a softline to align the closing )
        // with the opening (.
        var shouldAddSoftLine = args && args.expandLastArg;

        // In order to avoid confusion between
        // a => a ? a : a
        // a <= a ? a : a
        var shouldAddParens = n.body.type === "ConditionalExpression" && !util$4.startsWithNoLookaheadToken(n.body,
        /* forbidFunctionAndClass */false);

        return group$1(concat$2([concat$2(parts), group$1(concat$2([indent$2(concat$2([line$1, shouldAddParens ? ifBreak$1("", "(") : "", body, shouldAddParens ? ifBreak$1("", ")") : ""])), shouldAddSoftLine ? concat$2([ifBreak$1(shouldPrintComma(options, "all") ? "," : ""), softline$1]) : ""]))]));
      }
    case "MethodDefinition":
    case "TSAbstractMethodDefinition":
      if (n.accessibility) {
        parts.push(n.accessibility + " ");
      }
      if (n.static) {
        parts.push("static ");
      }
      if (n.type === "TSAbstractMethodDefinition") {
        parts.push("abstract ");
      }

      parts.push(printMethod(path$$1, options, print));

      return concat$2(parts);
    case "YieldExpression":
      parts.push("yield");

      if (n.delegate) {
        parts.push("*");
      }
      if (n.argument) {
        parts.push(" ", path$$1.call(print, "argument"));
      }

      return concat$2(parts);
    case "AwaitExpression":
      parts.push("await");

      if (n.all) {
        parts.push("*");
      }
      if (n.argument) {
        parts.push(" ", path$$1.call(print, "argument"));
      }

      return concat$2(parts);
    case "ModuleDeclaration":
      parts.push("module", path$$1.call(print, "id"));

      if (n.source) {
        assert$1.ok(!n.body);

        parts.push("from", path$$1.call(print, "source"));
      } else {
        parts.push(path$$1.call(print, "body"));
      }

      return join$2(" ", parts);
    case "ImportSpecifier":
      if (n.imported) {
        if (n.importKind) {
          parts.push(path$$1.call(print, "importKind"), " ");
        }

        parts.push(path$$1.call(print, "imported"));

        if (n.local && n.local.name !== n.imported.name) {
          parts.push(" as ", path$$1.call(print, "local"));
        }
      } else if (n.id) {
        parts.push(path$$1.call(print, "id"));

        if (n.name) {
          parts.push(" as ", path$$1.call(print, "name"));
        }
      }

      return concat$2(parts);
    case "ExportSpecifier":
      if (n.local) {
        parts.push(path$$1.call(print, "local"));

        if (n.exported && n.exported.name !== n.local.name) {
          parts.push(" as ", path$$1.call(print, "exported"));
        }
      } else if (n.id) {
        parts.push(path$$1.call(print, "id"));

        if (n.name) {
          parts.push(" as ", path$$1.call(print, "name"));
        }
      }

      return concat$2(parts);
    case "ExportBatchSpecifier":
      return "*";
    case "ImportNamespaceSpecifier":
      parts.push("* as ");

      if (n.local) {
        parts.push(path$$1.call(print, "local"));
      } else if (n.id) {
        parts.push(path$$1.call(print, "id"));
      }

      return concat$2(parts);
    case "ImportDefaultSpecifier":
      if (n.local) {
        return path$$1.call(print, "local");
      }

      return path$$1.call(print, "id");
    case "TSExportAssigment":
      {
        return concat$2(["export = ", path$$1.call(print, "expression"), semi]);
      }
    case "ExportDeclaration":
    case "ExportDefaultDeclaration":
    case "ExportNamedDeclaration":
      return printExportDeclaration(path$$1, options, print);
    case "ExportAllDeclaration":
      parts.push("export *");

      if (n.exported) {
        parts.push(" as ", path$$1.call(print, "exported"));
      }

      parts.push(" from ", path$$1.call(print, "source"), semi);

      return concat$2(parts);
    case "ExportNamespaceSpecifier":
    case "ExportDefaultSpecifier":
      return path$$1.call(print, "exported");
    case "ImportDeclaration":
      {
        parts.push("import ");

        if (n.importKind && n.importKind !== "value") {
          parts.push(n.importKind + " ");
        }

        var standalones = [];
        var grouped = [];
        if (n.specifiers && n.specifiers.length > 0) {
          path$$1.each(function (specifierPath) {
            var value = specifierPath.getValue();
            if (value.type === "ImportDefaultSpecifier" || value.type === "ImportNamespaceSpecifier") {
              standalones.push(print(specifierPath));
            } else {
              grouped.push(print(specifierPath));
            }
          }, "specifiers");

          if (standalones.length > 0) {
            parts.push(join$2(", ", standalones));
          }

          if (standalones.length > 0 && grouped.length > 0) {
            parts.push(", ");
          }

          if (grouped.length === 1 && standalones.length === 0 && n.specifiers && !n.specifiers.some(function (node) {
            return node.comments;
          })) {
            parts.push(concat$2(["{", options.bracketSpacing ? " " : "", concat$2(grouped), options.bracketSpacing ? " " : "", "}"]));
          } else if (grouped.length >= 1) {
            parts.push(group$1(concat$2(["{", indent$2(concat$2([options.bracketSpacing ? line$1 : softline$1, join$2(concat$2([",", line$1]), grouped)])), ifBreak$1(shouldPrintComma(options) ? "," : ""), options.bracketSpacing ? line$1 : softline$1, "}"])));
          }

          parts.push(" ", "from ");
        } else if (n.importKind && n.importKind === "type" ||
        // import {} from 'x'
        /{\s*}/.test(options.originalText.slice(util$4.locStart(n), util$4.locStart(n.source)))) {
          parts.push("{} from ");
        }

        parts.push(path$$1.call(print, "source"), semi);

        return concat$2(parts);
      }

    case "Import":
      return "import";
    case "BlockStatement":
      {
        var naked = path$$1.call(function (bodyPath) {
          return printStatementSequence(bodyPath, options, print);
        }, "body");

        var hasContent = n.body.find(function (node) {
          return node.type !== "EmptyStatement";
        });
        var hasDirectives = n.directives && n.directives.length > 0;

        var _parent4 = path$$1.getParentNode();
        var _parentParent = path$$1.getParentNode(1);
        if (!hasContent && !hasDirectives && !n.comments && (_parent4.type === "ArrowFunctionExpression" || _parent4.type === "FunctionExpression" || _parent4.type === "FunctionDeclaration" || _parent4.type === "ObjectMethod" || _parent4.type === "ClassMethod" || _parent4.type === "ForStatement" || _parent4.type === "WhileStatement" || _parent4.type === "DoWhileStatement" || _parent4.type === "CatchClause" && !_parentParent.finalizer)) {
          return "{}";
        }

        parts.push("{");

        // Babel 6
        if (hasDirectives) {
          path$$1.each(function (childPath) {
            parts.push(indent$2(concat$2([hardline$2, print(childPath), semi])));
            if (util$4.isNextLineEmpty(options.originalText, childPath.getValue())) {
              parts.push(hardline$2);
            }
          }, "directives");
        }

        if (hasContent) {
          parts.push(indent$2(concat$2([hardline$2, naked])));
        }

        parts.push(comments$3.printDanglingComments(path$$1, options));
        parts.push(hardline$2, "}");

        return concat$2(parts);
      }
    case "ReturnStatement":
      parts.push("return");

      if (n.argument) {
        if (returnArgumentHasLeadingComment(options, n.argument)) {
          parts.push(concat$2([" (", indent$2(concat$2([softline$1, path$$1.call(print, "argument")])), line$1, ")"]));
        } else if (n.argument.type === "LogicalExpression" || n.argument.type === "BinaryExpression") {
          parts.push(group$1(concat$2([ifBreak$1(" (", " "), indent$2(concat$2([softline$1, path$$1.call(print, "argument")])), softline$1, ifBreak$1(")")])));
        } else {
          parts.push(" ", path$$1.call(print, "argument"));
        }
      }

      if (hasDanglingComments(n)) {
        parts.push(" ", comments$3.printDanglingComments(path$$1, options, /* sameIndent */true));
      }

      parts.push(semi);

      return concat$2(parts);
    case "NewExpression":
    case "CallExpression":
      {
        var isNew = n.type === "NewExpression";
        if (
        // We want to keep require calls as a unit
        !isNew && n.callee.type === "Identifier" && n.callee.name === "require" || n.callee.type === "Import" ||
        // Template literals as single arguments
        n.arguments.length === 1 && isTemplateOnItsOwnLine(n.arguments[0], options.originalText) ||
        // Keep test declarations on a single line
        // e.g. `it('long name', () => {`
        !isNew && n.callee.type === "Identifier" && (n.callee.name === "it" || n.callee.name === "test" || n.callee.name === "describe") && n.arguments.length === 2 && (n.arguments[0].type === "StringLiteral" || n.arguments[0].type === "TemplateLiteral" || n.arguments[0].type === "Literal" && typeof n.arguments[0].value === "string") && (n.arguments[1].type === "FunctionExpression" || n.arguments[1].type === "ArrowFunctionExpression") && n.arguments[1].params.length <= 1) {
          return concat$2([isNew ? "new " : "", path$$1.call(print, "callee"), path$$1.call(print, "typeParameters"), concat$2(["(", join$2(", ", path$$1.map(print, "arguments")), ")"])]);
        }

        // We detect calls on member lookups and possibly print them in a
        // special chain format. See `printMemberChain` for more info.
        if (!isNew && n.callee.type === "MemberExpression") {
          return printMemberChain(path$$1, options, print);
        }

        return concat$2([isNew ? "new " : "", path$$1.call(print, "callee"), printFunctionTypeParameters(path$$1, options, print), printArgumentsList(path$$1, options, print)]);
      }
    case "TSInterfaceDeclaration":
      parts.push(n.abstract ? "abstract " : "", printTypeScriptModifiers(path$$1, options, print), "interface ", path$$1.call(print, "id"), n.typeParameters ? path$$1.call(print, "typeParameters") : "", " ");

      if (n.heritage.length) {
        parts.push(group$1(indent$2(concat$2([softline$1, "extends ", indent$2(join$2(concat$2([",", line$1]), path$$1.map(print, "heritage"))), " "]))));
      }

      parts.push(path$$1.call(print, "body"));

      return concat$2(parts);
    case "ObjectExpression":
    case "ObjectPattern":
    case "ObjectTypeAnnotation":
    case "TSInterfaceBody":
    case "TSTypeLiteral":
      {
        var isTypeAnnotation = n.type === "ObjectTypeAnnotation";
        var shouldBreak = n.type === "TSInterfaceBody" || n.type !== "ObjectPattern" && util$4.hasNewlineInRange(options.originalText, util$4.locStart(n), util$4.locEnd(n));
        var separator = n.type === "TSInterfaceBody" || n.type === "TSTypeLiteral" ? ifBreak$1(semi, ";") : ",";
        var fields = [];
        var leftBrace = n.exact ? "{|" : "{";
        var rightBrace = n.exact ? "|}" : "}";
        var _parent5 = path$$1.getParentNode(0);

        var propertiesField = void 0;

        if (n.type === "TSTypeLiteral") {
          propertiesField = "members";
        } else if (n.type === "TSInterfaceBody") {
          propertiesField = "body";
        } else {
          propertiesField = "properties";
        }

        if (isTypeAnnotation) {
          fields.push("indexers", "callProperties");
        }
        fields.push(propertiesField);

        // Unfortunately, things are grouped together in the ast can be
        // interleaved in the source code. So we need to reorder them before
        // printing them.
        var propsAndLoc = [];
        fields.forEach(function (field) {
          path$$1.each(function (childPath) {
            var node = childPath.getValue();
            propsAndLoc.push({
              node: node,
              printed: print(childPath),
              loc: util$4.locStart(node)
            });
          }, field);
        });

        var separatorParts = [];
        var props = propsAndLoc.sort(function (a, b) {
          return a.loc - b.loc;
        }).map(function (prop) {
          var result = concat$2(separatorParts.concat(group$1(prop.printed)));
          separatorParts = [separator, line$1];
          if (util$4.isNextLineEmpty(options.originalText, prop.node)) {
            separatorParts.push(hardline$2);
          }
          return result;
        });

        var lastElem = util$4.getLast(n[propertiesField]);

        var canHaveTrailingSeparator = !(lastElem && (lastElem.type === "RestProperty" || lastElem.type === "RestElement"));

        var content = void 0;
        if (props.length === 0 && !n.typeAnnotation) {
          if (!hasDanglingComments(n)) {
            return concat$2([leftBrace, rightBrace]);
          }

          content = group$1(concat$2([leftBrace, comments$3.printDanglingComments(path$$1, options), softline$1, rightBrace]));
        } else {
          content = concat$2([leftBrace, indent$2(concat$2([options.bracketSpacing ? line$1 : softline$1, concat$2(props)])), ifBreak$1(canHaveTrailingSeparator && (separator !== "," || shouldPrintComma(options)) ? separator : ""), concat$2([options.bracketSpacing ? line$1 : softline$1, rightBrace]), n.typeAnnotation ? ": " : "", path$$1.call(print, "typeAnnotation")]);
        }

        // If we inline the object as first argument of the parent, we don't want
        // to create another group so that the object breaks before the return
        // type
        var parentParentParent = path$$1.getParentNode(2);
        if (n.type === "ObjectPattern" && _parent5 && shouldHugArguments(_parent5) && _parent5.params[0] === n || shouldHugType(n) && parentParentParent && shouldHugArguments(parentParentParent) && parentParentParent.params[0].typeAnnotation.typeAnnotation === n) {
          return content;
        }

        return group$1(content, { shouldBreak: shouldBreak });
      }
    case "PropertyPattern":
      return concat$2([path$$1.call(print, "key"), ": ", path$$1.call(print, "pattern")]);
    // Babel 6
    case "ObjectProperty": // Non-standard AST node type.
    case "Property":
      if (n.method || n.kind === "get" || n.kind === "set") {
        return printMethod(path$$1, options, print);
      }

      if (n.shorthand) {
        parts.push(path$$1.call(print, "value"));
      } else {
        var printedLeft = void 0;
        if (n.computed) {
          printedLeft = concat$2(["[", path$$1.call(print, "key"), "]"]);
        } else {
          printedLeft = printPropertyKey(path$$1, options, print);
        }
        parts.push(printAssignment(n.key, printedLeft, ":", n.value, path$$1.call(print, "value"), options));
      }

      return concat$2(parts); // Babel 6
    case "ClassMethod":
      if (n.static) {
        parts.push("static ");
      }

      parts = parts.concat(printObjectMethod(path$$1, options, print));

      return concat$2(parts); // Babel 6
    case "ObjectMethod":
      return printObjectMethod(path$$1, options, print);
    case "TSDecorator":
    case "Decorator":
      return concat$2(["@", path$$1.call(print, "expression")]);
    case "ArrayExpression":
    case "ArrayPattern":
      if (n.elements.length === 0) {
        if (!hasDanglingComments(n)) {
          parts.push("[]");
        } else {
          parts.push(group$1(concat$2(["[", comments$3.printDanglingComments(path$$1, options), softline$1, "]"])));
        }
      } else {
        var _lastElem = util$4.getLast(n.elements);
        var canHaveTrailingComma = !(_lastElem && _lastElem.type === "RestElement");

        // JavaScript allows you to have empty elements in an array which
        // changes its length based on the number of commas. The algorithm
        // is that if the last argument is null, we need to force insert
        // a comma to ensure JavaScript recognizes it.
        //   [,].length === 1
        //   [1,].length === 1
        //   [1,,].length === 2
        //
        // Note that util.getLast returns null if the array is empty, but
        // we already check for an empty array just above so we are safe
        var needsForcedTrailingComma = canHaveTrailingComma && _lastElem === null;

        parts.push(group$1(concat$2(["[", indent$2(concat$2([softline$1, printArrayItems(path$$1, options, "elements", print)])), needsForcedTrailingComma ? "," : "", ifBreak$1(canHaveTrailingComma && !needsForcedTrailingComma && shouldPrintComma(options) ? "," : ""), comments$3.printDanglingComments(path$$1, options,
        /* sameIndent */true), softline$1, "]"])));
      }

      if (n.typeAnnotation) {
        parts.push(": ", path$$1.call(print, "typeAnnotation"));
      }

      return concat$2(parts);
    case "SequenceExpression":
      {
        var _parent6 = path$$1.getParentNode();
        var _shouldInline = _parent6.type === "ReturnStatement" || _parent6.type === "ForStatement" || _parent6.type === "ExpressionStatement";

        if (_shouldInline) {
          return join$2(", ", path$$1.map(print, "expressions"));
        }
        return group$1(concat$2([indent$2(concat$2([softline$1, join$2(concat$2([",", line$1]), path$$1.map(print, "expressions"))])), softline$1]));
      }
    case "ThisExpression":
      return "this";
    case "Super":
      return "super";
    case "NullLiteral":
      // Babel 6 Literal split
      return "null";
    case "RegExpLiteral":
      // Babel 6 Literal split
      return printRegex(n);
    case "NumericLiteral":
      // Babel 6 Literal split
      return printNumber(n.extra.raw);
    case "BooleanLiteral": // Babel 6 Literal split
    case "StringLiteral": // Babel 6 Literal split
    case "Literal":
      {
        if (n.regex) {
          return printRegex(n.regex);
        }
        if (typeof n.value === "number") {
          return printNumber(n.raw);
        }
        if (typeof n.value !== "string") {
          return "" + n.value;
        }
        // TypeScript workaround for eslint/typescript-eslint-parser#267
        // See corresponding workaround in fast-path.js needsParens()
        var grandParent = path$$1.getParentNode(1);
        var isTypeScriptDirective = options.parser === "typescript" && typeof n.value === "string" && grandParent && (grandParent.type === "Program" || grandParent.type === "BlockStatement");

        return nodeStr(n, options, isTypeScriptDirective);
      }
    case "Directive":
      return path$$1.call(print, "value"); // Babel 6
    case "DirectiveLiteral":
      return nodeStr(n, options);
    case "ModuleSpecifier":
      if (n.local) {
        throw new Error("The ESTree ModuleSpecifier type should be abstract");
      }

      // The Esprima ModuleSpecifier type is just a string-valued
      // Literal identifying the imported-from module.
      return nodeStr(n, options);
    case "UnaryExpression":
      parts.push(n.operator);

      if (/[a-z]$/.test(n.operator)) {
        parts.push(" ");
      }

      parts.push(path$$1.call(print, "argument"));

      return concat$2(parts);
    case "UpdateExpression":
      parts.push(path$$1.call(print, "argument"), n.operator);

      if (n.prefix) {
        parts.reverse();
      }

      return concat$2(parts);
    case "ConditionalExpression":
      {
        var _parent7 = path$$1.getParentNode();
        var printed = concat$2([line$1, "? ", n.consequent.type === "ConditionalExpression" ? ifBreak$1("", "(") : "", align$1(2, path$$1.call(print, "consequent")), n.consequent.type === "ConditionalExpression" ? ifBreak$1("", ")") : "", line$1, ": ", align$1(2, path$$1.call(print, "alternate"))]);

        return group$1(concat$2([path$$1.call(print, "test"), _parent7.type === "ConditionalExpression" ? printed : indent$2(printed)]));
      }
    case "VariableDeclaration":
      {
        var _printed2 = path$$1.map(function (childPath) {
          return print(childPath);
        }, "declarations");

        // We generally want to terminate all variable declarations with a
        // semicolon, except when they in the () part of for loops.
        var _parentNode = path$$1.getParentNode();

        var isParentForLoop = _parentNode.type === "ForStatement" || _parentNode.type === "ForInStatement" || _parentNode.type === "ForOfStatement" || _parentNode.type === "ForAwaitStatement";

        var hasValue = n.declarations.some(function (decl) {
          return decl.init;
        });

        var firstVariable = void 0;
        if (_printed2.length === 1) {
          firstVariable = _printed2[0];
        } else if (_printed2.length > 1) {
          // Indent first var to comply with eslint one-var rule
          firstVariable = indent$2(_printed2[0]);
        }

        parts = [isNodeStartingWithDeclare(n, options) ? "declare " : "", n.kind, firstVariable ? concat$2([" ", firstVariable]) : "", indent$2(concat$2(_printed2.slice(1).map(function (p) {
          return concat$2([",", hasValue && !isParentForLoop ? hardline$2 : line$1, p]);
        })))];

        if (!(isParentForLoop && _parentNode.body !== n)) {
          parts.push(semi);
        }

        return group$1(concat$2(parts));
      }
    case "VariableDeclarator":
      return printAssignment(n.id, concat$2([path$$1.call(print, "id"), path$$1.call(print, "typeParameters")]), " =", n.init, n.init && path$$1.call(print, "init"), options);
    case "WithStatement":
      return group$1(concat$2(["with (", path$$1.call(print, "object"), ")", adjustClause(n.body, path$$1.call(print, "body"))]));
    case "IfStatement":
      {
        var con = adjustClause(n.consequent, path$$1.call(print, "consequent"));
        var opening = group$1(concat$2(["if (", group$1(concat$2([indent$2(concat$2([softline$1, path$$1.call(print, "test")])), softline$1])), ")", con]));

        parts.push(opening);

        if (n.alternate) {
          if (n.consequent.type === "BlockStatement") {
            parts.push(" else");
          } else {
            parts.push(hardline$2, "else");
          }

          parts.push(group$1(adjustClause(n.alternate, path$$1.call(print, "alternate"), n.alternate.type === "IfStatement")));
        }

        return concat$2(parts);
      }
    case "ForStatement":
      {
        var _body = adjustClause(n.body, path$$1.call(print, "body"));

        // We want to keep dangling comments above the loop to stay consistent.
        // Any comment positioned between the for statement and the parentheses
        // is going to be printed before the statement.
        var dangling = comments$3.printDanglingComments(path$$1, options,
        /* sameLine */true);
        var printedComments = dangling ? concat$2([dangling, softline$1]) : "";

        if (!n.init && !n.test && !n.update) {
          return concat$2([printedComments, group$1(concat$2(["for (;;)", _body]))]);
        }

        return concat$2([printedComments, group$1(concat$2(["for (", group$1(concat$2([indent$2(concat$2([softline$1, path$$1.call(print, "init"), ";", line$1, path$$1.call(print, "test"), ";", line$1, path$$1.call(print, "update")])), softline$1])), ")", _body]))]);
      }
    case "WhileStatement":
      return group$1(concat$2(["while (", group$1(concat$2([indent$2(concat$2([softline$1, path$$1.call(print, "test")])), softline$1])), ")", adjustClause(n.body, path$$1.call(print, "body"))]));
    case "ForInStatement":
      // Note: esprima can't actually parse "for each (".
      return group$1(concat$2([n.each ? "for each (" : "for (", path$$1.call(print, "left"), " in ", path$$1.call(print, "right"), ")", adjustClause(n.body, path$$1.call(print, "body"))]));

    case "ForOfStatement":
    case "ForAwaitStatement":
      {
        // Babylon 7 removed ForAwaitStatement in favor of ForOfStatement
        // with `"await": true`:
        // https://github.com/estree/estree/pull/138
        var isAwait = n.type === "ForAwaitStatement" || n.await;

        return group$1(concat$2(["for", isAwait ? " await" : "", " (", path$$1.call(print, "left"), " of ", path$$1.call(print, "right"), ")", adjustClause(n.body, path$$1.call(print, "body"))]));
      }

    case "DoWhileStatement":
      {
        var clause = adjustClause(n.body, path$$1.call(print, "body"));
        var doBody = group$1(concat$2(["do", clause]));
        parts = [doBody];

        if (n.body.type === "BlockStatement") {
          parts.push(" ");
        } else {
          parts.push(hardline$2);
        }
        parts.push("while (");

        parts.push(group$1(concat$2([indent$2(softline$1), path$$1.call(print, "test"), softline$1])), ")", semi);

        return concat$2(parts);
      }
    case "DoExpression":
      return concat$2(["do ", path$$1.call(print, "body")]);
    case "BreakStatement":
      parts.push("break");

      if (n.label) {
        parts.push(" ", path$$1.call(print, "label"));
      }

      parts.push(semi);

      return concat$2(parts);
    case "ContinueStatement":
      parts.push("continue");

      if (n.label) {
        parts.push(" ", path$$1.call(print, "label"));
      }

      parts.push(semi);

      return concat$2(parts);
    case "LabeledStatement":
      if (n.body.type === "EmptyStatement") {
        return concat$2([path$$1.call(print, "label"), ":;"]);
      }

      return concat$2([path$$1.call(print, "label"), ": ", path$$1.call(print, "body")]);
    case "TryStatement":
      parts.push("try ", path$$1.call(print, "block"));

      if (n.handler) {
        parts.push(" ", path$$1.call(print, "handler"));
      } else if (n.handlers) {
        path$$1.each(function (handlerPath) {
          parts.push(" ", print(handlerPath));
        }, "handlers");
      }

      if (n.finalizer) {
        parts.push(" finally ", path$$1.call(print, "finalizer"));
      }

      return concat$2(parts);
    case "CatchClause":
      parts.push("catch (", path$$1.call(print, "param"));

      if (n.guard) {
        // Note: esprima does not recognize conditional catch clauses.
        parts.push(" if ", path$$1.call(print, "guard"));
      }

      parts.push(") ", path$$1.call(print, "body"));

      return concat$2(parts);
    case "ThrowStatement":
      return concat$2(["throw ", path$$1.call(print, "argument"), semi]);
    // Note: ignoring n.lexical because it has no printing consequences.
    case "SwitchStatement":
      return concat$2(["switch (", path$$1.call(print, "discriminant"), ") {", n.cases.length > 0 ? indent$2(concat$2([hardline$2, join$2(hardline$2, path$$1.map(function (casePath) {
        var caseNode = casePath.getValue();
        return concat$2([casePath.call(print), n.cases.indexOf(caseNode) !== n.cases.length - 1 && util$4.isNextLineEmpty(options.originalText, caseNode) ? hardline$2 : ""]);
      }, "cases"))])) : "", hardline$2, "}"]);
    case "SwitchCase":
      {
        if (n.test) {
          parts.push("case ", path$$1.call(print, "test"), ":");
        } else {
          parts.push("default:");
        }

        var consequent = n.consequent.filter(function (node) {
          return node.type !== "EmptyStatement";
        });

        if (consequent.length > 0) {
          var cons = path$$1.call(function (consequentPath) {
            return printStatementSequence(consequentPath, options, print);
          }, "consequent");

          parts.push(consequent.length === 1 && consequent[0].type === "BlockStatement" ? concat$2([" ", cons]) : indent$2(concat$2([hardline$2, cons])));
        }

        return concat$2(parts);
      }
    // JSX extensions below.
    case "DebuggerStatement":
      return concat$2(["debugger", semi]);
    case "JSXAttribute":
      parts.push(path$$1.call(print, "name"));

      if (n.value) {
        var res = void 0;
        if (isStringLiteral(n.value)) {
          var value = rawText(n.value);
          res = '"' + value.slice(1, -1).replace(/"/g, "&quot;") + '"';
        } else {
          res = path$$1.call(print, "value");
        }
        parts.push("=", res);
      }

      return concat$2(parts);
    case "JSXIdentifier":
      return "" + n.name;
    case "JSXNamespacedName":
      return join$2(":", [path$$1.call(print, "namespace"), path$$1.call(print, "name")]);
    case "JSXMemberExpression":
      return join$2(".", [path$$1.call(print, "object"), path$$1.call(print, "property")]);
    case "TSQualifiedName":
      return join$2(".", [path$$1.call(print, "left"), path$$1.call(print, "right")]);
    case "JSXSpreadAttribute":
      return concat$2(["{...", path$$1.call(print, "argument"), "}"]);
    case "JSXExpressionContainer":
      {
        var _parent8 = path$$1.getParentNode(0);

        var _shouldInline2 = n.expression.type === "ArrayExpression" || n.expression.type === "ObjectExpression" || n.expression.type === "ArrowFunctionExpression" || n.expression.type === "CallExpression" || n.expression.type === "FunctionExpression" || n.expression.type === "JSXEmptyExpression" || n.expression.type === "TemplateLiteral" || n.expression.type === "TaggedTemplateExpression" || _parent8.type === "JSXElement" && (n.expression.type === "ConditionalExpression" || isBinaryish(n.expression));

        if (_shouldInline2) {
          return group$1(concat$2(["{", path$$1.call(print, "expression"), lineSuffixBoundary$1, "}"]));
        }

        return group$1(concat$2(["{", indent$2(concat$2([softline$1, path$$1.call(print, "expression")])), softline$1, lineSuffixBoundary$1, "}"]));
      }
    case "JSXElement":
      {
        var elem = comments$3.printComments(path$$1, function () {
          return printJSXElement(path$$1, options, print);
        }, options);
        return maybeWrapJSXElementInParens(path$$1, elem);
      }
    case "JSXOpeningElement":
      {
        var _n2 = path$$1.getValue();

        // don't break up opening elements with a single long text attribute
        if (_n2.attributes.length === 1 && _n2.attributes[0].value && isStringLiteral(_n2.attributes[0].value)) {
          return group$1(concat$2(["<", path$$1.call(print, "name"), " ", concat$2(path$$1.map(print, "attributes")), _n2.selfClosing ? " />" : ">"]));
        }

        return group$1(concat$2(["<", path$$1.call(print, "name"), concat$2([indent$2(concat$2(path$$1.map(function (attr) {
          return concat$2([line$1, print(attr)]);
        }, "attributes"))), _n2.selfClosing ? line$1 : options.jsxBracketSameLine ? ">" : softline$1]), _n2.selfClosing ? "/>" : options.jsxBracketSameLine ? "" : ">"]));
      }
    case "JSXClosingElement":
      return concat$2(["</", path$$1.call(print, "name"), ">"]);
    case "JSXText":
      throw new Error("JSXTest should be handled by JSXElement");
    case "JSXEmptyExpression":
      {
        var requiresHardline = n.comments && !n.comments.every(util$4.isBlockComment);

        return concat$2([comments$3.printDanglingComments(path$$1, options,
        /* sameIndent */!requiresHardline), requiresHardline ? hardline$2 : ""]);
      }
    case "Keyword":
      {
        return n.name;
      }
    case "TypeAnnotatedIdentifier":
      return concat$2([path$$1.call(print, "annotation"), " ", path$$1.call(print, "identifier")]);
    case "ClassBody":
      if (!n.comments && n.body.length === 0) {
        return "{}";
      }

      return concat$2(["{", n.body.length > 0 ? indent$2(concat$2([hardline$2, path$$1.call(function (bodyPath) {
        return printStatementSequence(bodyPath, options, print);
      }, "body")])) : comments$3.printDanglingComments(path$$1, options), hardline$2, "}"]);
    case "ClassPropertyDefinition":
      parts.push("static ", path$$1.call(print, "definition"));

      if (n.definition.type !== "MethodDefinition" && n.definition.type !== "TSAbstractMethodDefinition") {
        parts.push(semi);
      }

      return concat$2(parts);
    case "ClassProperty":
    case "TSAbstractClassProperty":
      {
        if (n.accessibility) {
          parts.push(n.accessibility + " ");
        }
        if (n.static) {
          parts.push("static ");
        }
        if (n.type === "TSAbstractClassProperty") {
          parts.push("abstract ");
        }
        if (n.readonly) {
          parts.push("readonly ");
        }
        var variance = getFlowVariance(n);
        if (variance) {
          parts.push(variance);
        }
        if (n.computed) {
          parts.push("[", path$$1.call(print, "key"), "]");
        } else {
          parts.push(printPropertyKey(path$$1, options, print));
        }
        if (n.typeAnnotation) {
          parts.push(": ", path$$1.call(print, "typeAnnotation"));
        }
        if (n.value) {
          parts.push(" =", printAssignmentRight(n.value, path$$1.call(print, "value"), false, // canBreak
          options));
        }

        parts.push(semi);

        return concat$2(parts);
      }
    case "ClassDeclaration":
    case "ClassExpression":
    case "TSAbstractClassDeclaration":
      if (isNodeStartingWithDeclare(n, options)) {
        parts.push("declare ");
      }
      parts.push(concat$2(printClass(path$$1, options, print)));
      return concat$2(parts);
    case "TSInterfaceHeritage":
      parts.push(path$$1.call(print, "id"));

      if (n.typeParameters) {
        parts.push(path$$1.call(print, "typeParameters"));
      }

      return concat$2(parts);
    case "TSHeritageClause":
      return join$2(", ", path$$1.map(print, "types"));
    case "TSExpressionWithTypeArguments":
      return concat$2([path$$1.call(print, "expression"), printTypeParameters(path$$1, options, print, "typeArguments")]);
    case "TemplateElement":
      return join$2(literalline$1, n.value.raw.split(/\r?\n/g));
    case "TemplateLiteral":
      {
        var expressions = path$$1.map(print, "expressions");

        parts.push("`");

        path$$1.each(function (childPath) {
          var i = childPath.getName();

          parts.push(print(childPath));

          if (i < expressions.length) {
            // For a template literal of the following form:
            //   `someQuery {
            //     ${call({
            //       a,
            //       b,
            //     })}
            //   }`
            // the expression is on its own line (there is a \n in the previous
            // quasi literal), therefore we want to indent the JavaScript
            // expression inside at the beginning of ${ instead of the beginning
            // of the `.
            var size = 0;
            var _value = childPath.getValue().value.raw;
            var _index = _value.lastIndexOf("\n");
            var tabWidth = options.tabWidth;
            if (_index !== -1) {
              size = util$4.getAlignmentSize(
              // All the leading whitespaces
              _value.slice(_index + 1).match(/^[ \t]*/)[0], tabWidth);
            }

            var aligned = addAlignmentToDoc$1(expressions[i], size, tabWidth);

            parts.push("${", aligned, lineSuffixBoundary$1, "}");
          }
        }, "quasis");

        parts.push("`");

        return concat$2(parts);
      }
    // These types are unprintable because they serve as abstract
    // supertypes for other (printable) types.
    case "TaggedTemplateExpression":
      return concat$2([path$$1.call(print, "tag"), path$$1.call(print, "quasi")]);
    case "Node":
    case "Printable":
    case "SourceLocation":
    case "Position":
    case "Statement":
    case "Function":
    case "Pattern":
    case "Expression":
    case "Declaration":
    case "Specifier":
    case "NamedSpecifier":
    case "Comment":
    case "MemberTypeAnnotation": // Flow
    case "Type":
      throw new Error("unprintable type: " + JSON.stringify(n.type));
    // Type Annotations for Facebook Flow, typically stripped out or
    // transformed away before printing.
    case "TypeAnnotation":
      if (n.typeAnnotation) {
        return path$$1.call(print, "typeAnnotation");
      }

      return "";
    case "TSTupleType":
    case "TupleTypeAnnotation":
      {
        var typesField = n.type === "TSTupleType" ? "elementTypes" : "types";
        return group$1(concat$2(["[", indent$2(concat$2([softline$1, printArrayItems(path$$1, options, typesField, print)])),
        // TypeScript doesn't support trailing commas in tuple types
        n.type === "TSTupleType" ? "" : ifBreak$1(shouldPrintComma(options) ? "," : ""), comments$3.printDanglingComments(path$$1, options, /* sameIndent */true), softline$1, "]"]));
      }

    case "ExistsTypeAnnotation":
      return "*";
    case "EmptyTypeAnnotation":
      return "empty";
    case "AnyTypeAnnotation":
      return "any";
    case "MixedTypeAnnotation":
      return "mixed";
    case "ArrayTypeAnnotation":
      return concat$2([path$$1.call(print, "elementType"), "[]"]);
    case "BooleanTypeAnnotation":
      return "boolean";
    case "BooleanLiteralTypeAnnotation":
      return "" + n.value;
    case "DeclareClass":
      return printFlowDeclaration(path$$1, printClass(path$$1, options, print));
    case "DeclareFunction":
      // For TypeScript the DeclareFunction node shares the AST
      // structure with FunctionDeclaration
      if (n.params) {
        return concat$2(["declare ", printFunctionDeclaration(path$$1, print, options)]);
      }
      return printFlowDeclaration(path$$1, ["function ", path$$1.call(print, "id"), n.predicate ? " " : "", path$$1.call(print, "predicate"), semi]);
    case "DeclareModule":
      return printFlowDeclaration(path$$1, ["module ", path$$1.call(print, "id"), " ", path$$1.call(print, "body")]);
    case "DeclareModuleExports":
      return printFlowDeclaration(path$$1, ["module.exports", ": ", path$$1.call(print, "typeAnnotation"), semi]);
    case "DeclareVariable":
      return printFlowDeclaration(path$$1, ["var ", path$$1.call(print, "id"), semi]);
    case "DeclareExportAllDeclaration":
      return concat$2(["declare export * from ", path$$1.call(print, "source")]);
    case "DeclareExportDeclaration":
      return concat$2(["declare ", printExportDeclaration(path$$1, options, print)]);
    case "FunctionTypeAnnotation":
    case "TSFunctionType":
      {
        // FunctionTypeAnnotation is ambiguous:
        // declare function foo(a: B): void; OR
        // var A: (a: B) => void;
        var _parent9 = path$$1.getParentNode(0);
        var _parentParent2 = path$$1.getParentNode(1);
        var _parentParentParent = path$$1.getParentNode(2);
        var isArrowFunctionTypeAnnotation = n.type === "TSFunctionType" || !(_parent9.type === "ObjectTypeProperty" && !getFlowVariance(_parent9) && !_parent9.optional && util$4.locStart(_parent9) === util$4.locStart(n) || _parent9.type === "ObjectTypeCallProperty" || _parentParentParent && _parentParentParent.type === "DeclareFunction");

        var needsColon = isArrowFunctionTypeAnnotation && _parent9.type === "TypeAnnotation";

        // Sadly we can't put it inside of FastPath::needsColon because we are
        // printing ":" as part of the expression and it would put parenthesis
        // around :(
        var needsParens = needsColon && isArrowFunctionTypeAnnotation && _parent9.type === "TypeAnnotation" && _parentParent2.type === "ArrowFunctionExpression";

        if (isObjectTypePropertyAFunction(_parent9)) {
          isArrowFunctionTypeAnnotation = true;
          needsColon = true;
        }

        if (needsParens) {
          parts.push("(");
        }

        parts.push(printFunctionParams(path$$1, print, options,
        /* expandArg */false,
        /* printTypeParams */true));

        // The returnType is not wrapped in a TypeAnnotation, so the colon
        // needs to be added separately.
        if (n.returnType || n.predicate || n.typeAnnotation) {
          parts.push(isArrowFunctionTypeAnnotation ? " => " : ": ", path$$1.call(print, "returnType"), path$$1.call(print, "predicate"), path$$1.call(print, "typeAnnotation"));
        }
        if (needsParens) {
          parts.push(")");
        }

        return group$1(concat$2(parts));
      }
    case "FunctionTypeParam":
      return concat$2([path$$1.call(print, "name"), n.optional ? "?" : "", n.name ? ": " : "", path$$1.call(print, "typeAnnotation")]);
    case "GenericTypeAnnotation":
      return concat$2([path$$1.call(print, "id"), path$$1.call(print, "typeParameters")]);
    case "DeclareInterface":
    case "InterfaceDeclaration":
      {
        if (n.type === "DeclareInterface" || isNodeStartingWithDeclare(n, options)) {
          parts.push("declare ");
        }

        parts.push("interface ", path$$1.call(print, "id"), path$$1.call(print, "typeParameters"));

        if (n["extends"].length > 0) {
          parts.push(group$1(indent$2(concat$2([line$1, "extends ", join$2(", ", path$$1.map(print, "extends"))]))));
        }

        parts.push(" ");
        parts.push(path$$1.call(print, "body"));

        return group$1(concat$2(parts));
      }
    case "ClassImplements":
    case "InterfaceExtends":
      return concat$2([path$$1.call(print, "id"), path$$1.call(print, "typeParameters")]);
    case "TSIntersectionType":
    case "IntersectionTypeAnnotation":
      {
        var types = path$$1.map(print, "types");
        var result = [];
        for (var _i6 = 0; _i6 < types.length; ++_i6) {
          if (_i6 === 0) {
            result.push(types[_i6]);
          } else if (!isObjectType(n.types[_i6 - 1]) && !isObjectType(n.types[_i6])) {
            // If no object is involved, go to the next line if it breaks
            result.push(indent$2(concat$2([" &", line$1, types[_i6]])));
          } else {
            // If you go from object to non-object or vis-versa, then inline it
            result.push(" & ", _i6 > 1 ? indent$2(types[_i6]) : types[_i6]);
          }
        }
        return group$1(concat$2(result));
      }
    case "TSUnionType":
    case "UnionTypeAnnotation":
      {
        // single-line variation
        // A | B | C

        // multi-line variation
        // | A
        // | B
        // | C

        var _parent10 = path$$1.getParentNode();
        // If there's a leading comment, the parent is doing the indentation
        var shouldIndent = _parent10.type !== "TypeParameterInstantiation" && _parent10.type !== "GenericTypeAnnotation" && !((_parent10.type === "TypeAlias" || _parent10.type === "VariableDeclarator") && hasLeadingOwnLineComment(options.originalText, n));

        // {
        //   a: string
        // } | null | void
        // should be inlined and not be printed in the multi-line variant
        var shouldHug = shouldHugType(n);

        // We want to align the children but without its comment, so it looks like
        // | child1
        // // comment
        // | child2
        var _printed3 = path$$1.map(function (typePath) {
          var printedType = typePath.call(print);
          if (!shouldHug && shouldIndent) {
            printedType = align$1(2, printedType);
          }
          return comments$3.printComments(typePath, function () {
            return printedType;
          }, options);
        }, "types");

        if (shouldHug) {
          return join$2(" | ", _printed3);
        }

        var _code = concat$2([ifBreak$1(concat$2([shouldIndent ? line$1 : "", "| "])), join$2(concat$2([line$1, "| "]), _printed3)]);

        return group$1(shouldIndent ? indent$2(_code) : _code);
      }
    case "NullableTypeAnnotation":
      return concat$2(["?", path$$1.call(print, "typeAnnotation")]);
    case "TSNullKeyword":
    case "NullLiteralTypeAnnotation":
      return "null";
    case "ThisTypeAnnotation":
      return "this";
    case "NumberTypeAnnotation":
      return "number";
    case "ObjectTypeCallProperty":
      if (n.static) {
        parts.push("static ");
      }

      parts.push(path$$1.call(print, "value"));

      return concat$2(parts);
    case "ObjectTypeIndexer":
      {
        var _variance = getFlowVariance(n);
        return concat$2([_variance || "", "[", path$$1.call(print, "id"), n.id ? ": " : "", path$$1.call(print, "key"), "]: ", path$$1.call(print, "value")]);
      }
    case "ObjectTypeProperty":
      {
        var _variance2 = getFlowVariance(n);

        return concat$2([n.static ? "static " : "", isGetterOrSetter(n) ? n.kind + " " : "", _variance2 || "", path$$1.call(print, "key"), n.optional ? "?" : "", isFunctionNotation(n) ? "" : ": ", path$$1.call(print, "value")]);
      }
    case "QualifiedTypeIdentifier":
      return concat$2([path$$1.call(print, "qualification"), ".", path$$1.call(print, "id")]);
    case "StringLiteralTypeAnnotation":
      return nodeStr(n, options);
    case "NumberLiteralTypeAnnotation":
      assert$1.strictEqual(_typeof(n.value), "number");

      if (n.extra != null) {
        return printNumber(n.extra.raw);
      }
      return printNumber(n.raw);

    case "StringTypeAnnotation":
      return "string";
    case "DeclareTypeAlias":
    case "TypeAlias":
      {
        if (n.type === "DeclareTypeAlias" || isNodeStartingWithDeclare(n, options)) {
          parts.push("declare ");
        }

        var canBreak = n.right.type === "StringLiteralTypeAnnotation";

        var _printed4 = printAssignmentRight(n.right, path$$1.call(print, "right"), canBreak, options);

        parts.push("type ", path$$1.call(print, "id"), path$$1.call(print, "typeParameters"), " =", _printed4, semi);

        return group$1(concat$2(parts));
      }
    case "TypeCastExpression":
      return concat$2(["(", path$$1.call(print, "expression"), ": ", path$$1.call(print, "typeAnnotation"), ")"]);
    case "TypeParameterDeclaration":
    case "TypeParameterInstantiation":
      return printTypeParameters(path$$1, options, print, "params");
    case "TypeParameter":
      {
        var _variance3 = getFlowVariance(n);

        if (_variance3) {
          parts.push(_variance3);
        }

        parts.push(path$$1.call(print, "name"));

        if (n.bound) {
          parts.push(": ");
          parts.push(path$$1.call(print, "bound"));
        }

        if (n.constraint) {
          parts.push(" extends ", path$$1.call(print, "constraint"));
        }

        if (n["default"]) {
          parts.push(" = ", path$$1.call(print, "default"));
        }

        return concat$2(parts);
      }
    case "TypeofTypeAnnotation":
      return concat$2(["typeof ", path$$1.call(print, "argument")]);
    case "VoidTypeAnnotation":
      return "void";
    case "NullTypeAnnotation":
      return "null";
    case "InferredPredicate":
      return "%checks";
    // Unhandled types below. If encountered, nodes of these types should
    // be either left alone or desugared into AST types that are fully
    // supported by the pretty-printer.
    case "DeclaredPredicate":
      return concat$2(["%checks(", path$$1.call(print, "value"), ")"]);
    case "TSAbstractKeyword":
      return "abstract";
    case "TSAnyKeyword":
      return "any";
    case "TSAsyncKeyword":
      return "async";
    case "TSBooleanKeyword":
      return "boolean";
    case "TSConstKeyword":
      return "const";
    case "TSDeclareKeyword":
      return "declare";
    case "TSExportKeyword":
      return "export";
    case "TSNeverKeyword":
      return "never";
    case "TSNumberKeyword":
      return "number";
    case "TSObjectKeyword":
      return "object";
    case "TSProtectedKeyword":
      return "protected";
    case "TSPrivateKeyword":
      return "private";
    case "TSPublicKeyword":
      return "public";
    case "TSReadonlyKeyword":
      return "readonly";
    case "TSSymbolKeyword":
      return "symbol";
    case "TSStaticKeyword":
      return "static";
    case "TSStringKeyword":
      return "string";
    case "TSUndefinedKeyword":
      return "undefined";
    case "TSVoidKeyword":
      return "void";
    case "TSAsExpression":
      return concat$2([path$$1.call(print, "expression"), " as ", path$$1.call(print, "typeAnnotation")]);
    case "TSArrayType":
      return concat$2([path$$1.call(print, "elementType"), "[]"]);
    case "TSPropertySignature":
      {
        if (n.accessibility) {
          parts.push(n.accessibility + " ");
        }
        if (n.export) {
          parts.push("export ");
        }
        if (n.static) {
          parts.push("static ");
        }

        if (n.readonly) {
          parts.push("readonly ");
        }

        if (n.computed) {
          parts.push("[");
        }

        parts.push(path$$1.call(print, "key"));

        if (n.computed) {
          parts.push("]");
        }

        if (n.optional) {
          parts.push("?");
        }

        if (n.typeAnnotation) {
          parts.push(": ");
          parts.push(path$$1.call(print, "typeAnnotation"));
        }

        // This isn't valid semantically, but it's in the AST so we can print it.
        if (n.initializer) {
          parts.push(" = ", path$$1.call(print, "initializer"));
        }

        return concat$2(parts);
      }
    case "TSParameterProperty":
      if (n.accessibility) {
        parts.push(n.accessibility + " ");
      }
      if (n.export) {
        parts.push("export ");
      }
      if (n.static) {
        parts.push("static ");
      }
      if (n.readonly) {
        parts.push("readonly ");
      }

      parts.push(path$$1.call(print, "parameter"));

      return concat$2(parts);
    case "TSTypeReference":
      return concat$2([path$$1.call(print, "typeName"), printTypeParameters(path$$1, options, print, "typeParameters")]);
    case "TSTypeQuery":
      return concat$2(["typeof ", path$$1.call(print, "exprName")]);
    case "TSParenthesizedType":
      {
        return path$$1.call(print, "typeAnnotation");
      }
    case "TSIndexSignature":
      {
        var _parent11 = path$$1.getParentNode();
        var printedParams = [];
        if (n.params) {
          printedParams = path$$1.map(print, "params");
        }
        if (n.parameters) {
          printedParams = path$$1.map(print, "parameters");
        }

        return concat$2([n.accessibility ? concat$2([n.accessibility, " "]) : "", n.export ? "export " : "", n.static ? "static " : "", n.readonly ? "readonly " : "", "[", path$$1.call(print, "index"),
        // This should only contain a single element, however TypeScript parses
        // it using parseDelimitedList that uses commas as delimiter.
        join$2(", ", printedParams), "]: ", path$$1.call(print, "typeAnnotation"), _parent11.type === "ClassBody" ? semi : ""]);
      }
    case "TSTypePredicate":
      return concat$2([path$$1.call(print, "parameterName"), " is ", path$$1.call(print, "typeAnnotation")]);
    case "TSNonNullExpression":
      return concat$2([path$$1.call(print, "expression"), "!"]);
    case "TSThisType":
      return "this";
    case "TSLastTypeNode":
      return path$$1.call(print, "literal");
    case "TSIndexedAccessType":
      return concat$2([path$$1.call(print, "objectType"), "[", path$$1.call(print, "indexType"), "]"]);
    case "TSConstructSignature":
    case "TSConstructorType":
    case "TSCallSignature":
      {
        if (n.type !== "TSCallSignature") {
          parts.push("new ");
        }

        parts.push(group$1(printFunctionParams(path$$1, print, options,
        /* expandArg */false,
        /* printTypeParams */true)));

        if (n.typeAnnotation) {
          var isType = n.type === "TSConstructorType";
          parts.push(isType ? " => " : ": ", path$$1.call(print, "typeAnnotation"));
        }
        return concat$2(parts);
      }
    case "TSTypeOperator":
      return concat$2(["keyof ", path$$1.call(print, "typeAnnotation")]);
    case "TSMappedType":
      return group$1(concat$2(["{", indent$2(concat$2([options.bracketSpacing ? line$1 : softline$1, n.readonlyToken ? concat$2([path$$1.call(print, "readonlyToken"), " "]) : "", printTypeScriptModifiers(path$$1, options, print), "[", path$$1.call(print, "typeParameter"), "]", n.questionToken ? "?" : "", ": ", path$$1.call(print, "typeAnnotation")])), comments$3.printDanglingComments(path$$1, options, /* sameIndent */true), options.bracketSpacing ? line$1 : softline$1, "}"]));
    case "TSTypeParameter":
      parts.push(path$$1.call(print, "name"));

      if (n.constraint) {
        parts.push(" in ", path$$1.call(print, "constraint"));
      }

      return concat$2(parts);
    case "TSMethodSignature":
      parts.push(n.accessibility ? concat$2([n.accessibility, " "]) : "", n.export ? "export " : "", n.static ? "static " : "", n.readonly ? "readonly " : "", n.computed ? "[" : "", path$$1.call(print, "key"), n.computed ? "]" : "", n.optional ? "?" : "", printFunctionParams(path$$1, print, options,
      /* expandArg */false,
      /* printTypeParams */true));

      if (n.typeAnnotation) {
        parts.push(": ", path$$1.call(print, "typeAnnotation"));
      }
      return group$1(concat$2(parts));
    case "TSNamespaceExportDeclaration":
      if (n.declaration) {
        parts.push("export ", n.default ? "default " : "", path$$1.call(print, "declaration"));
      } else {
        parts.push("export as namespace ", path$$1.call(print, "name"));

        if (options.semi) {
          parts.push(";");
        }
      }

      return group$1(concat$2(parts));
    case "TSEnumDeclaration":
      if (n.modifiers) {
        parts.push(printTypeScriptModifiers(path$$1, options, print));
      }

      parts.push("enum ", path$$1.call(print, "name"), " ");

      if (n.members.length === 0) {
        parts.push(group$1(concat$2(["{", comments$3.printDanglingComments(path$$1, options), softline$1, "}"])));
      } else {
        parts.push(group$1(concat$2(["{", indent$2(concat$2([hardline$2, printArrayItems(path$$1, options, "members", print), shouldPrintComma(options, "es5") ? "," : ""])), comments$3.printDanglingComments(path$$1, options,
        /* sameIndent */true), hardline$2, "}"])));
      }

      return concat$2(parts);
    case "TSEnumMember":
      parts.push(path$$1.call(print, "name"));
      if (n.initializer) {
        parts.push(" = ", path$$1.call(print, "initializer"));
      }
      return concat$2(parts);
    case "TSImportEqualsDeclaration":
      parts.push(printTypeScriptModifiers(path$$1, options, print), "import ", path$$1.call(print, "name"), " = ", path$$1.call(print, "moduleReference"));

      if (options.semi) {
        parts.push(";");
      }

      return group$1(concat$2(parts));
    case "TSExternalModuleReference":
      return concat$2(["require(", path$$1.call(print, "expression"), ")"]);
    case "TSModuleDeclaration":
      {
        var _parent12 = path$$1.getParentNode();
        var isExternalModule = isLiteral(n.name);
        var parentIsDeclaration = _parent12.type === "TSModuleDeclaration";
        var bodyIsDeclaration = n.body && n.body.type === "TSModuleDeclaration";

        if (parentIsDeclaration) {
          parts.push(".");
        } else {
          parts.push(printTypeScriptModifiers(path$$1, options, print));

          // Global declaration looks like this:
          // declare global { ... }
          var isGlobalDeclaration = n.name.type === "Identifier" && n.name.name === "global" && n.modifiers && n.modifiers.some(function (modifier) {
            return modifier.type === "TSDeclareKeyword";
          });

          if (!isGlobalDeclaration) {
            parts.push(isExternalModule ? "module " : "namespace ");
          }
        }

        parts.push(path$$1.call(print, "name"));

        if (bodyIsDeclaration) {
          parts.push(path$$1.call(print, "body"));
        } else if (n.body) {
          parts.push(" {", indent$2(concat$2([line$1, path$$1.call(function (bodyPath) {
            return comments$3.printDanglingComments(bodyPath, options, true);
          }, "body"), group$1(path$$1.call(print, "body"))])), line$1, "}");
        } else {
          parts.push(semi);
        }

        return concat$2(parts);
      }
    case "TSModuleBlock":
      return path$$1.call(function (bodyPath) {
        return printStatementSequence(bodyPath, options, print);
      }, "body");
    case "json-identifier":
      return '"' + n.value + '"';

    default:
      throw new Error("unknown type: " + JSON.stringify(n.type));
  }
}

function printStatementSequence(path$$1, options, print) {
  var printed = [];

  var bodyNode = path$$1.getNode();
  var isClass = bodyNode.type === "ClassBody";

  path$$1.map(function (stmtPath, i) {
    var stmt = stmtPath.getValue();

    // Just in case the AST has been modified to contain falsy
    // "statements," it's safer simply to skip them.
    if (!stmt) {
      return;
    }

    // Skip printing EmptyStatement nodes to avoid leaving stray
    // semicolons lying around.
    if (stmt.type === "EmptyStatement") {
      return;
    }

    var stmtPrinted = print(stmtPath);
    var text = options.originalText;
    var parts = [];

    // in no-semi mode, prepend statement with semicolon if it might break ASI
    if (!options.semi && !isClass && stmtNeedsASIProtection(stmtPath)) {
      if (stmt.comments && stmt.comments.some(function (comment) {
        return comment.leading;
      })) {
        // Note: stmtNeedsASIProtection requires stmtPath to already be printed
        // as it reads needsParens which is mutated on the instance
        parts.push(print(stmtPath, { needsSemi: true }));
      } else {
        parts.push(";", stmtPrinted);
      }
    } else {
      parts.push(stmtPrinted);
    }

    if (!options.semi && isClass) {
      if (classPropMayCauseASIProblems(stmtPath)) {
        parts.push(";");
      } else if (stmt.type === "ClassProperty") {
        var nextChild = bodyNode.body[i + 1];
        if (classChildNeedsASIProtection(nextChild)) {
          parts.push(";");
        }
      }
    }

    if (util$4.isNextLineEmpty(text, stmt) && !isLastStatement(stmtPath)) {
      parts.push(hardline$2);
    }

    printed.push(concat$2(parts));
  });

  return join$2(hardline$2, printed);
}

function printPropertyKey(path$$1, options, print) {
  var node = path$$1.getNode();
  var key = node.key;

  if (isStringLiteral(key) && isIdentifierName(key.value) && !node.computed) {
    // 'a' -> a
    return path$$1.call(function (keyPath) {
      return comments$3.printComments(keyPath, function () {
        return key.value;
      }, options);
    }, "key");
  }
  return path$$1.call(print, "key");
}

function printMethod(path$$1, options, print) {
  var node = path$$1.getNode();
  var semi = options.semi ? ";" : "";
  var kind = node.kind;
  var parts = [];

  if (node.type === "ObjectMethod" || node.type === "ClassMethod") {
    node.value = node;
  }

  if (node.value.async) {
    parts.push("async ");
  }

  if (!kind || kind === "init" || kind === "method" || kind === "constructor") {
    if (node.value.generator) {
      parts.push("*");
    }
  } else {
    assert$1.ok(kind === "get" || kind === "set");

    parts.push(kind, " ");
  }

  var key = printPropertyKey(path$$1, options, print);

  if (node.computed) {
    key = concat$2(["[", key, "]"]);
  }

  parts.push(key, concat$2(path$$1.call(function (valuePath) {
    return [printFunctionTypeParameters(valuePath, options, print), group$1(concat$2([printFunctionParams(valuePath, print, options), printReturnType(valuePath, print)]))];
  }, "value")));

  if (!node.value.body || node.value.body.length === 0) {
    parts.push(semi);
  } else {
    parts.push(" ", path$$1.call(print, "value", "body"));
  }

  return concat$2(parts);
}

function couldGroupArg(arg) {
  return arg.type === "ObjectExpression" && arg.properties.length > 0 || arg.type === "ArrayExpression" && arg.elements.length > 0 || arg.type === "FunctionExpression" || arg.type === "ArrowFunctionExpression" && (arg.body.type === "BlockStatement" || arg.body.type === "ArrowFunctionExpression" || arg.body.type === "ObjectExpression" || arg.body.type === "ArrayExpression" || arg.body.type === "CallExpression" || arg.body.type === "JSXElement");
}

function shouldGroupLastArg(args) {
  var lastArg = util$4.getLast(args);
  var penultimateArg = util$4.getPenultimate(args);
  return (!lastArg.comments || !lastArg.comments.length) && couldGroupArg(lastArg) && (
  // If the last two arguments are of the same type,
  // disable last element expansion.
  !penultimateArg || penultimateArg.type !== lastArg.type);
}

function shouldGroupFirstArg(args) {
  if (args.length !== 2) {
    return false;
  }

  var firstArg = args[0];
  var secondArg = args[1];
  return (!firstArg.comments || !firstArg.comments.length) && (firstArg.type === "FunctionExpression" || firstArg.type === "ArrowFunctionExpression" && firstArg.body.type === "BlockStatement") && !couldGroupArg(secondArg);
}

function printArgumentsList(path$$1, options, print) {
  var printed = path$$1.map(print, "arguments");
  if (printed.length === 0) {
    return concat$2(["(", comments$3.printDanglingComments(path$$1, options, /* sameIndent */true), ")"]);
  }

  var args = path$$1.getValue().arguments;
  // This is just an optimization; I think we could return the
  // conditional group for all function calls, but it's more expensive
  // so only do it for specific forms.
  var shouldGroupFirst = shouldGroupFirstArg(args);
  var shouldGroupLast = shouldGroupLastArg(args);
  if (shouldGroupFirst || shouldGroupLast) {
    var shouldBreak = shouldGroupFirst ? printed.slice(1).some(willBreak) : printed.slice(0, -1).some(willBreak);

    // We want to print the last argument with a special flag
    var printedExpanded = void 0;
    var i = 0;
    path$$1.each(function (argPath) {
      if (shouldGroupFirst && i === 0) {
        printedExpanded = [argPath.call(function (p) {
          return print(p, { expandFirstArg: true });
        })].concat(printed.slice(1));
      }
      if (shouldGroupLast && i === args.length - 1) {
        printedExpanded = printed.slice(0, -1).concat(argPath.call(function (p) {
          return print(p, { expandLastArg: true });
        }));
      }
      i++;
    }, "arguments");

    return concat$2([printed.some(willBreak) ? breakParent$2 : "", conditionalGroup$1([concat$2(["(", join$2(concat$2([", "]), printedExpanded), ")"]), shouldGroupFirst ? concat$2(["(", group$1(printedExpanded[0], { shouldBreak: true }), printed.length > 1 ? ", " : "", join$2(concat$2([",", line$1]), printed.slice(1)), ")"]) : concat$2(["(", join$2(concat$2([",", line$1]), printed.slice(0, -1)), printed.length > 1 ? ", " : "", group$1(util$4.getLast(printedExpanded), {
      shouldBreak: true
    }), ")"]), group$1(concat$2(["(", indent$2(concat$2([line$1, join$2(concat$2([",", line$1]), printed)])), shouldPrintComma(options, "all") ? "," : "", line$1, ")"]), { shouldBreak: true })], { shouldBreak: shouldBreak })]);
  }

  return group$1(concat$2(["(", indent$2(concat$2([softline$1, join$2(concat$2([",", line$1]), printed)])), ifBreak$1(shouldPrintComma(options, "all") ? "," : ""), softline$1, ")"]), { shouldBreak: printed.some(willBreak) });
}

function printFunctionTypeParameters(path$$1, options, print) {
  var fun = path$$1.getValue();
  var paramsFieldIsArray = Array.isArray(fun["typeParameters"]);

  if (fun.typeParameters) {
    // for TSFunctionType typeParameters is an array
    // for FunctionTypeAnnotation it's a single node
    if (paramsFieldIsArray) {
      return concat$2("<", join$2(", ", path$$1.map(print, "typeParameters")), ">");
    }
    return path$$1.call(print, "typeParameters");
  }
  return "";
}

function printFunctionParams(path$$1, print, options, expandArg, printTypeParams) {
  var fun = path$$1.getValue();
  var paramsField = fun.parameters ? "parameters" : "params";

  var typeParams = printTypeParams ? printFunctionTypeParameters(path$$1, options, print) : "";

  var printed = [];
  if (fun[paramsField]) {
    printed = path$$1.map(print, paramsField);
  }

  if (fun.defaults) {
    path$$1.each(function (defExprPath) {
      var i = defExprPath.getName();
      var p = printed[i];

      if (p && defExprPath.getValue()) {
        printed[i] = concat$2([p, " = ", print(defExprPath)]);
      }
    }, "defaults");
  }

  if (fun.rest) {
    printed.push(concat$2(["...", path$$1.call(print, "rest")]));
  }

  if (printed.length === 0) {
    return concat$2([typeParams, "(", comments$3.printDanglingComments(path$$1, options, /* sameIndent */true), ")"]);
  }

  var lastParam = util$4.getLast(fun[paramsField]);

  // If the parent is a call with the first/last argument expansion and this is the
  // params of the first/last argument, we dont want the arguments to break and instead
  // want the whole expression to be on a new line.
  //
  // Good:                 Bad:
  //   verylongcall(         verylongcall((
  //     (a, b) => {           a,
  //     }                     b,
  //   })                    ) => {
  //                         })
  if (expandArg && !(fun[paramsField] && fun[paramsField].some(function (n) {
    return n.comments;
  }))) {
    return group$1(concat$2([docUtils.removeLines(typeParams), "(", join$2(", ", printed.map(docUtils.removeLines)), ")"]));
  }

  // Single object destructuring should hug
  //
  // function({
  //   a,
  //   b,
  //   c
  // }) {}
  if (shouldHugArguments(fun)) {
    return concat$2([typeParams, "(", join$2(", ", printed), ")"]);
  }

  var parent = path$$1.getParentNode();

  var flowTypeAnnotations = ["AnyTypeAnnotation", "NullLiteralTypeAnnotation", "GenericTypeAnnotation", "ThisTypeAnnotation", "NumberTypeAnnotation", "VoidTypeAnnotation", "NullTypeAnnotation", "EmptyTypeAnnotation", "MixedTypeAnnotation", "BooleanTypeAnnotation", "BooleanLiteralTypeAnnotation", "StringTypeAnnotation"];

  var isFlowShorthandWithOneArg = (isObjectTypePropertyAFunction(parent) || isTypeAnnotationAFunction(parent) || parent.type === "TypeAlias" || parent.type === "UnionTypeAnnotation" || parent.type === "TSUnionType" || parent.type === "IntersectionTypeAnnotation" || parent.type === "FunctionTypeAnnotation" && parent.returnType === fun) && fun[paramsField].length === 1 && fun[paramsField][0].name === null && fun[paramsField][0].typeAnnotation && flowTypeAnnotations.indexOf(fun[paramsField][0].typeAnnotation.type) !== -1 && !(fun[paramsField][0].typeAnnotation.type === "GenericTypeAnnotation" && fun[paramsField][0].typeAnnotation.typeParameters) && !fun.rest;

  if (isFlowShorthandWithOneArg) {
    return concat$2(printed);
  }

  var canHaveTrailingComma = !(lastParam && lastParam.type === "RestElement") && !fun.rest;

  return concat$2([typeParams, "(", indent$2(concat$2([softline$1, join$2(concat$2([",", line$1]), printed)])), ifBreak$1(canHaveTrailingComma && shouldPrintComma(options, "all") ? "," : ""), softline$1, ")"]);
}

function canPrintParamsWithoutParens(node) {
  return node.params.length === 1 && !node.rest && node.params[0].type === "Identifier" && !node.params[0].typeAnnotation && !node.params[0].comments && !node.params[0].optional && !node.predicate && !node.returnType;
}

function printFunctionDeclaration(path$$1, print, options) {
  var n = path$$1.getValue();
  var parts = [];

  if (n.async) {
    parts.push("async ");
  }

  parts.push("function");

  if (n.generator) {
    parts.push("*");
  }
  if (n.id) {
    parts.push(" ", path$$1.call(print, "id"));
  }

  parts.push(printFunctionTypeParameters(path$$1, options, print), group$1(concat$2([printFunctionParams(path$$1, print, options), printReturnType(path$$1, print)])), n.body ? " " : "", path$$1.call(print, "body"));

  return concat$2(parts);
}

function printObjectMethod(path$$1, options, print) {
  var objMethod = path$$1.getValue();
  var parts = [];

  if (objMethod.async) {
    parts.push("async ");
  }
  if (objMethod.generator) {
    parts.push("*");
  }
  if (objMethod.method || objMethod.kind === "get" || objMethod.kind === "set") {
    return printMethod(path$$1, options, print);
  }

  var key = printPropertyKey(path$$1, options, print);

  if (objMethod.computed) {
    parts.push("[", key, "]");
  } else {
    parts.push(key);
  }

  parts.push(printFunctionTypeParameters(path$$1, options, print), group$1(concat$2([printFunctionParams(path$$1, print, options), printReturnType(path$$1, print)])), " ", path$$1.call(print, "body"));

  return concat$2(parts);
}

function printReturnType(path$$1, print) {
  var n = path$$1.getValue();
  var parts = [path$$1.call(print, "returnType")];

  // prepend colon to TypeScript type annotation
  if (n.returnType && n.returnType.typeAnnotation) {
    parts.unshift(": ");
  }

  if (n.predicate) {
    // The return type will already add the colon, but otherwise we
    // need to do it ourselves
    parts.push(n.returnType ? " " : ": ", path$$1.call(print, "predicate"));
  }

  return concat$2(parts);
}

function printExportDeclaration(path$$1, options, print) {
  var decl = path$$1.getValue();
  var semi = options.semi ? ";" : "";
  var parts = ["export "];

  if (decl["default"] || decl.type === "ExportDefaultDeclaration") {
    parts.push("default ");
  }

  parts.push(comments$3.printDanglingComments(path$$1, options, /* sameIndent */true));

  if (decl.declaration) {
    parts.push(path$$1.call(print, "declaration"));

    if (decl.type === "ExportDefaultDeclaration" && decl.declaration.type !== "ClassDeclaration" && decl.declaration.type !== "FunctionDeclaration" && decl.declaration.type !== "TSAbstractClassDeclaration" && decl.declaration.type !== "TSNamespaceFunctionDeclaration") {
      parts.push(semi);
    }
  } else {
    if (decl.specifiers && decl.specifiers.length > 0) {
      if (decl.specifiers.length === 1 && decl.specifiers[0].type === "ExportBatchSpecifier") {
        parts.push("*");
      } else {
        var specifiers = [];
        var defaultSpecifiers = [];
        var namespaceSpecifiers = [];

        path$$1.map(function (specifierPath) {
          var specifierType = path$$1.getValue().type;
          if (specifierType === "ExportSpecifier") {
            specifiers.push(print(specifierPath));
          } else if (specifierType === "ExportDefaultSpecifier") {
            defaultSpecifiers.push(print(specifierPath));
          } else if (specifierType === "ExportNamespaceSpecifier") {
            namespaceSpecifiers.push(concat$2(["* as ", print(specifierPath)]));
          }
        }, "specifiers");

        var isNamespaceFollowed = namespaceSpecifiers.length !== 0 && (specifiers.length !== 0 || defaultSpecifiers.length !== 0);
        var isDefaultFollowed = defaultSpecifiers.length !== 0 && specifiers.length !== 0;

        parts.push(decl.exportKind === "type" ? "type " : "", concat$2(namespaceSpecifiers), concat$2([isNamespaceFollowed ? ", " : ""]), concat$2(defaultSpecifiers), concat$2([isDefaultFollowed ? ", " : ""]), specifiers.length !== 0 ? group$1(concat$2(["{", indent$2(concat$2([options.bracketSpacing ? line$1 : softline$1, join$2(concat$2([",", line$1]), specifiers)])), ifBreak$1(shouldPrintComma(options) ? "," : ""), options.bracketSpacing ? line$1 : softline$1, "}"])) : "");
      }
    } else {
      parts.push("{}");
    }

    if (decl.source) {
      parts.push(" from ", path$$1.call(print, "source"));
    }

    parts.push(semi);
  }

  return concat$2(parts);
}

function printFlowDeclaration(path$$1, parts) {
  var parentExportDecl = util$4.getParentExportDeclaration(path$$1);

  if (parentExportDecl) {
    assert$1.strictEqual(parentExportDecl.type, "DeclareExportDeclaration");
  } else {
    // If the parent node has type DeclareExportDeclaration, then it
    // will be responsible for printing the "declare" token. Otherwise
    // it needs to be printed with this non-exported declaration node.
    parts.unshift("declare ");
  }

  return concat$2(parts);
}

function getFlowVariance(path$$1) {
  if (!path$$1.variance) {
    return null;
  }

  // Babylon 7.0 currently uses variance node type, and flow should
  // follow suit soon:
  // https://github.com/babel/babel/issues/4722
  var variance = path$$1.variance.kind || path$$1.variance;

  switch (variance) {
    case "plus":
      return "+";

    case "minus":
      return "-";

    default:
      return variance;
  }
}

function printTypeScriptModifiers(path$$1, options, print) {
  var n = path$$1.getValue();
  if (!n.modifiers || !n.modifiers.length) {
    return "";
  }
  return concat$2([join$2(" ", path$$1.map(print, "modifiers")), " "]);
}

function printTypeParameters(path$$1, options, print, paramsKey) {
  var n = path$$1.getValue();

  if (!n[paramsKey]) {
    return "";
  }

  // for TypeParameterDeclaration typeParameters is a single node
  if (!Array.isArray(n[paramsKey])) {
    return path$$1.call(print, paramsKey);
  }

  var shouldInline = n[paramsKey].length === 1 && (shouldHugType(n[paramsKey][0]) || n[paramsKey][0].type === "GenericTypeAnnotation" && shouldHugType(n[paramsKey][0].id) || n[paramsKey][0].type === "NullableTypeAnnotation");

  if (shouldInline) {
    return concat$2(["<", join$2(", ", path$$1.map(print, paramsKey)), ">"]);
  }

  return group$1(concat$2(["<", indent$2(concat$2([softline$1, join$2(concat$2([",", line$1]), path$$1.map(print, paramsKey))])), ifBreak$1(options.parser !== "typescript" && shouldPrintComma(options, "all") ? "," : ""), softline$1, ">"]));
}

function printClass(path$$1, options, print) {
  var n = path$$1.getValue();
  var parts = [];

  if (n.accessibility) {
    parts.push(n.accessibility + " ");
  }
  if (n.type === "TSAbstractClassDeclaration") {
    parts.push("abstract ");
  }

  parts.push("class");

  if (n.id) {
    parts.push(" ", path$$1.call(print, "id"));
  }

  parts.push(path$$1.call(print, "typeParameters"));

  var partsGroup = [];
  if (n.superClass) {
    parts.push(" extends ", path$$1.call(print, "superClass"), path$$1.call(print, "superTypeParameters"));
  } else if (n.extends && n.extends.length > 0) {
    parts.push(" extends ", join$2(", ", path$$1.map(print, "extends")));
  }

  if (n["implements"] && n["implements"].length > 0) {
    partsGroup.push(line$1, "implements ", group$1(indent$2(join$2(concat$2([",", line$1]), path$$1.map(print, "implements")))));
  }

  if (partsGroup.length > 0) {
    parts.push(group$1(indent$2(concat$2(partsGroup))));
  }

  parts.push(" ", path$$1.call(print, "body"));

  return parts;
}

function printMemberLookup(path$$1, options, print) {
  var property = path$$1.call(print, "property");
  var n = path$$1.getValue();

  if (!n.computed) {
    return concat$2([".", property]);
  }

  if (!n.property || n.property.type === "Literal" && typeof n.property.value === "number" || n.property.type === "NumericLiteral") {
    return concat$2(["[", property, "]"]);
  }

  return group$1(concat$2(["[", indent$2(concat$2([softline$1, property])), softline$1, "]"]));
}

// We detect calls on member expressions specially to format a
// comman pattern better. The pattern we are looking for is this:
//
// arr
//   .map(x => x + 1)
//   .filter(x => x > 10)
//   .some(x => x % 2)
//
// The way it is structured in the AST is via a nested sequence of
// MemberExpression and CallExpression. We need to traverse the AST
// and make groups out of it to print it in the desired way.
function printMemberChain(path$$1, options, print) {
  // The first phase is to linearize the AST by traversing it down.
  //
  //   a().b()
  // has the following AST structure:
  //   CallExpression(MemberExpression(CallExpression(Identifier)))
  // and we transform it into
  //   [Identifier, CallExpression, MemberExpression, CallExpression]
  var printedNodes = [];

  function rec(path$$1) {
    var node = path$$1.getValue();
    if (node.type === "CallExpression" && node.callee.type === "MemberExpression") {
      printedNodes.unshift({
        node: node,
        printed: comments$3.printComments(path$$1, function () {
          return concat$2([printFunctionTypeParameters(path$$1, options, print), printArgumentsList(path$$1, options, print)]);
        }, options)
      });
      path$$1.call(function (callee) {
        return rec(callee);
      }, "callee");
    } else if (node.type === "MemberExpression") {
      printedNodes.unshift({
        node: node,
        printed: comments$3.printComments(path$$1, function () {
          return printMemberLookup(path$$1, options, print);
        }, options)
      });
      path$$1.call(function (object) {
        return rec(object);
      }, "object");
    } else {
      printedNodes.unshift({
        node: node,
        printed: path$$1.call(print)
      });
    }
  }
  // Note: the comments of the root node have already been printed, so we
  // need to extract this first call without printing them as they would
  // if handled inside of the recursive call.
  printedNodes.unshift({
    node: path$$1.getValue(),
    printed: concat$2([printFunctionTypeParameters(path$$1, options, print), printArgumentsList(path$$1, options, print)])
  });
  path$$1.call(function (callee) {
    return rec(callee);
  }, "callee");

  // Once we have a linear list of printed nodes, we want to create groups out
  // of it.
  //
  //   a().b.c().d().e
  // will be grouped as
  //   [
  //     [Identifier, CallExpression],
  //     [MemberExpression, MemberExpression, CallExpression],
  //     [MemberExpression, CallExpression],
  //     [MemberExpression],
  //   ]
  // so that we can print it as
  //   a()
  //     .b.c()
  //     .d()
  //     .e

  // The first group is the first node followed by
  //   - as many CallExpression as possible
  //       < fn()()() >.something()
  //   - then, as many MemberExpression as possible but the last one
  //       < this.items >.something()
  var groups = [];
  var currentGroup = [printedNodes[0]];
  var i = 1;
  for (; i < printedNodes.length; ++i) {
    if (printedNodes[i].node.type === "CallExpression") {
      currentGroup.push(printedNodes[i]);
    } else {
      break;
    }
  }
  for (; i + 1 < printedNodes.length; ++i) {
    if (printedNodes[i].node.type === "MemberExpression" && printedNodes[i + 1].node.type === "MemberExpression") {
      currentGroup.push(printedNodes[i]);
    } else {
      break;
    }
  }
  groups.push(currentGroup);
  currentGroup = [];

  // Then, each following group is a sequence of MemberExpression followed by
  // a sequence of CallExpression. To compute it, we keep adding things to the
  // group until we has seen a CallExpression in the past and reach a
  // MemberExpression
  var hasSeenCallExpression = false;
  for (; i < printedNodes.length; ++i) {
    if (hasSeenCallExpression && printedNodes[i].node.type === "MemberExpression") {
      // [0] should be appended at the end of the group instead of the
      // beginning of the next one
      if (printedNodes[i].node.computed && isLiteral(printedNodes[i].node.property)) {
        currentGroup.push(printedNodes[i]);
        continue;
      }

      groups.push(currentGroup);
      currentGroup = [];
      hasSeenCallExpression = false;
    }

    if (printedNodes[i].node.type === "CallExpression") {
      hasSeenCallExpression = true;
    }
    currentGroup.push(printedNodes[i]);

    if (printedNodes[i].node.comments && printedNodes[i].node.comments.some(function (comment) {
      return comment.trailing;
    })) {
      groups.push(currentGroup);
      currentGroup = [];
      hasSeenCallExpression = false;
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  // There are cases like Object.keys(), Observable.of(), _.values() where
  // they are the subject of all the chained calls and therefore should
  // be kept on the same line:
  //
  //   Object.keys(items)
  //     .filter(x => x)
  //     .map(x => x)
  //
  // In order to detect those cases, we use an heuristic: if the first
  // node is just an identifier with the name starting with a capital
  // letter, just a sequence of _$ or this. The rationale is that they are
  // likely to be factories.
  var shouldMerge = groups.length >= 2 && !groups[1][0].node.comments && groups[0].length === 1 && (groups[0][0].node.type === "ThisExpression" || groups[0][0].node.type === "Identifier" && groups[0][0].node.name.match(/(^[A-Z])|^[_$]+$/));

  function printGroup(printedGroup) {
    return concat$2(printedGroup.map(function (tuple) {
      return tuple.printed;
    }));
  }

  function printIndentedGroup(groups) {
    if (groups.length === 0) {
      return "";
    }
    return indent$2(group$1(concat$2([hardline$2, join$2(hardline$2, groups.map(printGroup))])));
  }

  var printedGroups = groups.map(printGroup);
  var oneLine = concat$2(printedGroups);

  var cutoff = shouldMerge ? 3 : 2;
  var flatGroups = groups.slice(0, cutoff).reduce(function (res, group) {
    return res.concat(group);
  }, []);

  var hasComment = flatGroups.slice(1, -1).some(function (node) {
    return hasLeadingComment(node.node);
  }) || flatGroups.slice(0, -1).some(function (node) {
    return hasTrailingComment(node.node);
  }) || groups[cutoff] && hasLeadingComment(groups[cutoff][0].node);

  // If we only have a single `.`, we shouldn't do anything fancy and just
  // render everything concatenated together.
  if (groups.length <= cutoff && !hasComment &&
  // (a || b).map() should be break before .map() instead of ||
  groups[0][0].node.type !== "LogicalExpression") {
    return group$1(oneLine);
  }

  var expanded = concat$2([printGroup(groups[0]), shouldMerge ? concat$2(groups.slice(1, 2).map(printGroup)) : "", printIndentedGroup(groups.slice(shouldMerge ? 2 : 1))]);

  // If there's a comment, we don't want to print in one line.
  if (hasComment) {
    return group$1(expanded);
  }

  // If any group but the last one has a hard line, we want to force expand
  // it. If the last group is a function it's okay to inline if it fits.
  if (printedGroups.slice(0, -1).some(willBreak)) {
    return group$1(expanded);
  }

  return concat$2([
  // We only need to check `oneLine` because if `expanded` is chosen
  // that means that the parent group has already been broken
  // naturally
  willBreak(oneLine) ? breakParent$2 : "", conditionalGroup$1([oneLine, expanded])]);
}

function isEmptyJSXElement(node) {
  if (node.children.length === 0) {
    return true;
  }
  if (node.children.length > 1) {
    return false;
  }

  // if there is one text child and does not contain any meaningful text
  // we can treat the element as empty.
  var child = node.children[0];
  return isLiteral(child) && !isMeaningfulJSXText(child);
}

// Only space, newline, carriage return, and tab are treated as whitespace
// inside JSX.
var jsxWhitespaceChars = " \n\r\t";
var containsNonJsxWhitespaceRegex = new RegExp("[^" + jsxWhitespaceChars + "]");
var matchJsxWhitespaceRegex = new RegExp("([" + jsxWhitespaceChars + "]+)");

// Meaningful if it contains non-whitespace characters,
// or it contains whitespace without a new line.
function isMeaningfulJSXText(node) {
  return isLiteral(node) && (containsNonJsxWhitespaceRegex.test(rawText(node)) || !/\n/.test(rawText(node)));
}

// Detect an expression node representing `{" "}`
function isJSXWhitespaceExpression(node) {
  return node.type === "JSXExpressionContainer" && isLiteral(node.expression) && node.expression.value === " " && !node.expression.comments;
}

// JSX Children are strange, mostly for two reasons:
// 1. JSX reads newlines into string values, instead of skipping them like JS
// 2. up to one whitespace between elements within a line is significant,
//    but not between lines.
//
// Leading, trailing, and lone whitespace all need to
// turn themselves into the rather ugly `{' '}` when breaking.
//
// We print JSX using the `fill` doc primitive.
// This requires that we give it an array of alternating
// content and whitespace elements.
// To ensure this we add dummy `""` content elements as needed.
function printJSXChildren(path$$1, options, print, jsxWhitespace) {
  var n = path$$1.getValue();
  var children = [];

  // using `map` instead of `each` because it provides `i`
  path$$1.map(function (childPath, i) {
    var child = childPath.getValue();
    if (isLiteral(child)) {
      var text = rawText(child);

      // Contains a non-whitespace character
      if (isMeaningfulJSXText(child)) {
        var words = text.split(matchJsxWhitespaceRegex);

        // Starts with whitespace
        if (words[0] === "") {
          children.push("");
          words.shift();
          if (/\n/.test(words[0])) {
            children.push(hardline$2);
          } else {
            children.push(jsxWhitespace);
          }
          words.shift();
        }

        var endWhitespace = void 0;
        // Ends with whitespace
        if (util$4.getLast(words) === "") {
          words.pop();
          endWhitespace = words.pop();
        }

        // This was whitespace only without a new line.
        if (words.length === 0) {
          return;
        }

        words.forEach(function (word, i) {
          if (i % 2 === 1) {
            children.push(line$1);
          } else {
            children.push(word);
          }
        });

        if (endWhitespace !== undefined) {
          if (/\n/.test(endWhitespace)) {
            children.push(hardline$2);
          } else {
            children.push(jsxWhitespace);
          }
        } else {
          // Ideally this would be a `hardline` to allow a break between
          // tags and text.
          // Unfortunately Facebook have a custom translation pipeline
          // (https://github.com/prettier/prettier/issues/1581#issuecomment-300975032)
          // that uses the JSX syntax, but does not follow the React whitespace
          // rules.
          // Ensuring that we never have a break between tags and text in JSX
          // will allow Facebook to adopt Prettier without too much of an
          // adverse effect on formatting algorithm.
          children.push("");
        }
      } else if (/\n/.test(text)) {
        // Keep (up to one) blank line between tags/expressions/text.
        // Note: We don't keep blank lines between text elements.
        if (text.match(/\n/g).length > 1) {
          children.push("");
          children.push(hardline$2);
        }
      } else {
        children.push("");
        children.push(jsxWhitespace);
      }
    } else {
      var printedChild = print(childPath);
      children.push(printedChild);

      var next = n.children[i + 1];
      var directlyFollowedByMeaningfulText = next && isMeaningfulJSXText(next) && !/^[ \n\r\t]/.test(rawText(next));
      if (directlyFollowedByMeaningfulText) {
        // Potentially this could be a hardline as well.
        // See the comment above about the Facebook translation pipeline as
        // to why this is an empty string.
        children.push("");
      } else {
        children.push(hardline$2);
      }
    }
  }, "children");

  return children;
}

// JSX expands children from the inside-out, instead of the outside-in.
// This is both to break children before attributes,
// and to ensure that when children break, their parents do as well.
//
// Any element that is written without any newlines and fits on a single line
// is left that way.
// Not only that, any user-written-line containing multiple JSX siblings
// should also be kept on one line if possible,
// so each user-written-line is wrapped in its own group.
//
// Elements that contain newlines or don't fit on a single line (recursively)
// are fully-split, using hardline and shouldBreak: true.
//
// To support that case properly, all leading and trailing spaces
// are stripped from the list of children, and replaced with a single hardline.
function printJSXElement(path$$1, options, print) {
  var n = path$$1.getValue();

  // Turn <div></div> into <div />
  if (isEmptyJSXElement(n)) {
    n.openingElement.selfClosing = true;
    delete n.closingElement;
  }

  var openingLines = path$$1.call(print, "openingElement");
  var closingLines = path$$1.call(print, "closingElement");

  if (n.children.length === 1 && n.children[0].type === "JSXExpressionContainer" && (n.children[0].expression.type === "TemplateLiteral" || n.children[0].expression.type === "TaggedTemplateExpression")) {
    return concat$2([openingLines, concat$2(path$$1.map(print, "children")), closingLines]);
  }

  // If no children, just print the opening element
  if (n.openingElement.selfClosing) {
    assert$1.ok(!n.closingElement);
    return openingLines;
  }

  // Convert `{" "}` to text nodes containing a space.
  // This makes it easy to turn them into `jsxWhitespace` which
  // can then print as either a space or `{" "}` when breaking.
  n.children = n.children.map(function (child) {
    if (isJSXWhitespaceExpression(child)) {
      return {
        type: "JSXText",
        value: " ",
        raw: " "
      };
    }
    return child;
  });

  var parent = path$$1.getParentNode();
  var parentContainsText = parent.type === "JSXElement" && parent.children.filter(function (child) {
    return isMeaningfulJSXText(child);
  }).length > 0;

  var containsTag = n.children.filter(function (child) {
    return child.type === "JSXElement";
  }).length > 0;
  var numExpressions = n.children.filter(function (child) {
    return child.type === "JSXExpressionContainer";
  }).length;
  var containsMultipleAttributes = n.openingElement.attributes.length > 1;

  // Record any breaks. Should never go from true to false, only false to true.
  var forcedBreak = willBreak(openingLines) || containsTag || containsMultipleAttributes || (parentContainsText ? numExpressions > 1 : numExpressions > 0);

  var rawJsxWhitespace = options.singleQuote ? "{' '}" : '{" "}';
  var jsxWhitespace = ifBreak$1(concat$2([rawJsxWhitespace, softline$1]), " ");

  var children = printJSXChildren(path$$1, options, print, jsxWhitespace);

  var containsText = n.children.filter(function (child) {
    return isMeaningfulJSXText(child);
  }).length > 0;

  // We can end up we multiple whitespace elements with empty string
  // content between them.
  // We need to remove empty whitespace and softlines before JSX whitespace
  // to get the correct output.
  for (var i = children.length - 2; i >= 0; i--) {
    var isPairOfEmptyStrings = children[i] === "" && children[i + 1] === "";
    var isPairOfHardlines = children[i] === hardline$2 && children[i + 1] === "" && children[i + 2] === hardline$2;
    var isLineFollowedByJSXWhitespace = (children[i] === softline$1 || children[i] === hardline$2) && children[i + 1] === "" && children[i + 2] === jsxWhitespace;
    var isJSXWhitespaceFollowedByLine = children[i] === jsxWhitespace && children[i + 1] === "" && (children[i + 2] === softline$1 || children[i + 2] === hardline$2);

    if (isPairOfHardlines && containsText || isPairOfEmptyStrings || isLineFollowedByJSXWhitespace) {
      children.splice(i, 2);
    } else if (isJSXWhitespaceFollowedByLine) {
      children.splice(i + 1, 2);
    }
  }

  // Trim trailing lines (or empty strings)
  while (children.length && (isLineNext(util$4.getLast(children)) || isEmpty(util$4.getLast(children)))) {
    children.pop();
  }

  // Trim leading lines (or empty strings)
  while (children.length && (isLineNext(children[0]) || isEmpty(children[0])) && (isLineNext(children[1]) || isEmpty(children[1]))) {
    children.shift();
    children.shift();
  }

  // Tweak how we format children if outputting this element over multiple lines.
  // Also detect whether we will force this element to output over multiple lines.
  var multilineChildren = [];
  children.forEach(function (child, i) {
    // There are a number of situations where we need to ensure we display
    // whitespace as `{" "}` when outputting this element over multiple lines.
    if (child === jsxWhitespace) {
      if (i === 1 && children[i - 1] === "") {
        // Leading whitespace
        multilineChildren.push(rawJsxWhitespace);
        return;
      } else if (i === children.length - 1) {
        // Trailing whitespace
        multilineChildren.push(rawJsxWhitespace);
        return;
      } else if (children[i - 1] === "" && children[i - 2] === hardline$2) {
        // Whitespace after line break
        multilineChildren.push(rawJsxWhitespace);
        return;
      }
    }

    multilineChildren.push(child);

    if (willBreak(child)) {
      forcedBreak = true;
    }
  });

  // If there is text we use `fill` to fit as much onto each line as possible.
  // When there is no text (just tags and expressions) we use `group`
  // to output each on a separate line.
  var content = containsText ? fill$1(multilineChildren) : group$1(concat$2(multilineChildren), { shouldBreak: true });

  var multiLineElem = group$1(concat$2([openingLines, indent$2(concat$2([hardline$2, content])), hardline$2, closingLines]));

  if (forcedBreak) {
    return multiLineElem;
  }

  return conditionalGroup$1([group$1(concat$2([openingLines, concat$2(children), closingLines])), multiLineElem]);
}

function maybeWrapJSXElementInParens(path$$1, elem) {
  var parent = path$$1.getParentNode();
  if (!parent) {
    return elem;
  }

  var NO_WRAP_PARENTS = {
    ArrayExpression: true,
    JSXElement: true,
    JSXExpressionContainer: true,
    ExpressionStatement: true,
    CallExpression: true,
    ConditionalExpression: true,
    LogicalExpression: true,
    ArrowFunctionExpression: true
  };
  if (NO_WRAP_PARENTS[parent.type]) {
    return elem;
  }

  return group$1(concat$2([ifBreak$1("("), indent$2(concat$2([softline$1, elem])), softline$1, ifBreak$1(")")]));
}

function isBinaryish(node) {
  return node.type === "BinaryExpression" || node.type === "LogicalExpression";
}

function shouldInlineLogicalExpression(node) {
  if (node.type !== "LogicalExpression") {
    return false;
  }

  if (node.right.type === "ObjectExpression" && node.right.properties.length !== 0) {
    return true;
  }

  if (node.right.type === "ArrayExpression" && node.right.elements.length !== 0) {
    return true;
  }

  return false;
}

// For binary expressions to be consistent, we need to group
// subsequent operators with the same precedence level under a single
// group. Otherwise they will be nested such that some of them break
// onto new lines but not all. Operators with the same precedence
// level should either all break or not. Because we group them by
// precedence level and the AST is structured based on precedence
// level, things are naturally broken up correctly, i.e. `&&` is
// broken before `+`.
function printBinaryishExpressions(path$$1, print, options, isNested, isInsideParenthesis) {
  var parts = [];
  var node = path$$1.getValue();

  // We treat BinaryExpression and LogicalExpression nodes the same.
  if (isBinaryish(node)) {
    // Put all operators with the same precedence level in the same
    // group. The reason we only need to do this with the `left`
    // expression is because given an expression like `1 + 2 - 3`, it
    // is always parsed like `((1 + 2) - 3)`, meaning the `left` side
    // is where the rest of the expression will exist. Binary
    // expressions on the right side mean they have a difference
    // precedence level and should be treated as a separate group, so
    // print them normally. (This doesn't hold for the `**` operator,
    // which is unique in that it is right-associative.)
    if (util$4.getPrecedence(node.left.operator) === util$4.getPrecedence(node.operator) && node.operator !== "**") {
      // Flatten them out by recursively calling this function.
      parts = parts.concat(path$$1.call(function (left) {
        return printBinaryishExpressions(left, print, options,
        /* isNested */true, isInsideParenthesis);
      }, "left"));
    } else {
      parts.push(path$$1.call(print, "left"));
    }

    var right = concat$2([node.operator, shouldInlineLogicalExpression(node) ? " " : line$1, path$$1.call(print, "right")]);

    // If there's only a single binary expression, we want to create a group
    // in order to avoid having a small right part like -1 be on its own line.
    var parent = path$$1.getParentNode();
    var shouldGroup = !(isInsideParenthesis && node.type === "LogicalExpression") && parent.type !== node.type && node.left.type !== node.type && node.right.type !== node.type;

    parts.push(" ", shouldGroup ? group$1(right) : right);

    // The root comments are already printed, but we need to manually print
    // the other ones since we don't call the normal print on BinaryExpression,
    // only for the left and right parts
    if (isNested && node.comments) {
      parts = comments$3.printComments(path$$1, function () {
        return concat$2(parts);
      }, options);
    }
  } else {
    // Our stopping case. Simply print the node normally.
    parts.push(path$$1.call(print));
  }

  return parts;
}

function printAssignmentRight(rightNode, printedRight, canBreak, options) {
  if (hasLeadingOwnLineComment(options.originalText, rightNode)) {
    return indent$2(concat$2([hardline$2, printedRight]));
  }

  if (canBreak) {
    return indent$2(concat$2([line$1, printedRight]));
  }

  return concat$2([" ", printedRight]);
}

function printAssignment(leftNode, printedLeft, operator, rightNode, printedRight, options) {
  if (!rightNode) {
    return printedLeft;
  }

  var canBreak = isBinaryish(rightNode) && !shouldInlineLogicalExpression(rightNode) || rightNode.type === "ConditionalExpression" && isBinaryish(rightNode.test) && !shouldInlineLogicalExpression(rightNode.test) || (leftNode.type === "Identifier" || isStringLiteral(leftNode) || leftNode.type === "MemberExpression") && (isStringLiteral(rightNode) || isMemberExpressionChain(rightNode));

  var printed = printAssignmentRight(rightNode, printedRight, canBreak, options);

  return group$1(concat$2([printedLeft, operator, printed]));
}

function adjustClause(node, clause, forceSpace) {
  if (node.type === "EmptyStatement") {
    return ";";
  }

  if (node.type === "BlockStatement" || forceSpace) {
    return concat$2([" ", clause]);
  }

  return indent$2(concat$2([line$1, clause]));
}

function nodeStr(node, options, isFlowOrTypeScriptDirectiveLiteral) {
  var raw = rawText(node);
  // `rawContent` is the string exactly like it appeared in the input source
  // code, with its enclosing quote.
  var rawContent = raw.slice(1, -1);

  var double = { quote: '"', regex: /"/g };
  var single = { quote: "'", regex: /'/g };

  var preferred = options.singleQuote ? single : double;
  var alternate = preferred === single ? double : single;

  var shouldUseAlternateQuote = false;
  var isDirectiveLiteral = isFlowOrTypeScriptDirectiveLiteral || node.type === "DirectiveLiteral";

  var canChangeDirectiveQuotes = false;

  // If `rawContent` contains at least one of the quote preferred for enclosing
  // the string, we might want to enclose with the alternate quote instead, to
  // minimize the number of escaped quotes.
  // Also check for the alternate quote, to determine if we're allowed to swap
  // the quotes on a DirectiveLiteral.
  if (rawContent.includes(preferred.quote) || rawContent.includes(alternate.quote)) {
    var numPreferredQuotes = (rawContent.match(preferred.regex) || []).length;
    var numAlternateQuotes = (rawContent.match(alternate.regex) || []).length;

    shouldUseAlternateQuote = numPreferredQuotes > numAlternateQuotes;
  } else {
    canChangeDirectiveQuotes = true;
  }

  var enclosingQuote = options.parser === "json" ? double.quote : shouldUseAlternateQuote ? alternate.quote : preferred.quote;

  // Directives are exact code unit sequences, which means that you can't
  // change the escape sequences they use.
  // See https://github.com/prettier/prettier/issues/1555
  // and https://tc39.github.io/ecma262/#directive-prologue
  if (isDirectiveLiteral) {
    if (canChangeDirectiveQuotes) {
      return enclosingQuote + rawContent + enclosingQuote;
    }
    return raw;
  }

  // It might sound unnecessary to use `makeString` even if `node.raw` already
  // is enclosed with `enclosingQuote`, but it isn't. `node.raw` could contain
  // unnecessary escapes (such as in `"\'"`). Always using `makeString` makes
  // sure that we consistently output the minimum amount of escaped quotes.
  return makeString(rawContent, enclosingQuote);
}

function makeString(rawContent, enclosingQuote) {
  var otherQuote = enclosingQuote === '"' ? "'" : '"';

  // Matches _any_ escape and unescaped quotes (both single and double).
  var regex = /\\([\s\S])|(['"])/g;

  // Escape and unescape single and double quotes as needed to be able to
  // enclose `rawContent` with `enclosingQuote`.
  var newContent = rawContent.replace(regex, function (match, escaped, quote) {
    // If we matched an escape, and the escaped character is a quote of the
    // other type than we intend to enclose the string with, there's no need for
    // it to be escaped, so return it _without_ the backslash.
    if (escaped === otherQuote) {
      return escaped;
    }

    // If we matched an unescaped quote and it is of the _same_ type as we
    // intend to enclose the string with, it must be escaped, so return it with
    // a backslash.
    if (quote === enclosingQuote) {
      return "\\" + quote;
    }

    if (quote) {
      return quote;
    }

    // Unescape any unnecessarily escaped character.
    // Adapted from https://github.com/eslint/eslint/blob/de0b4ad7bd820ade41b1f606008bea68683dc11a/lib/rules/no-useless-escape.js#L27
    return (/^[^\\nrvtbfux\r\n\u2028\u2029"'0-7]$/.test(escaped) ? escaped : "\\" + escaped
    );
  });

  return enclosingQuote + newContent + enclosingQuote;
}

function printRegex(node) {
  var flags = node.flags.split("").sort().join("");
  return '/' + node.pattern + '/' + flags;
}

function printNumber(rawNumber) {
  return rawNumber.toLowerCase
  // Remove unnecessary plus and zeroes from scientific notation.
  ().replace(/^([\d.]+e)(?:\+|(-))?0*(\d)/, "$1$2$3"
  // Remove unnecessary scientific notation (1e0).
  ).replace(/^([\d.]+)e[+-]?0+$/, "$1"
  // Make sure numbers always start with a digit.
  ).replace(/^\./, "0."
  // Remove extraneous trailing decimal zeroes.
  ).replace(/(\.\d+?)0+(?=e|$)/, "$1"
  // Remove trailing dot.
  ).replace(/\.(?=e|$)/, "");
}

function isLastStatement(path$$1) {
  var parent = path$$1.getParentNode();
  if (!parent) {
    return true;
  }
  var node = path$$1.getValue();
  var body = (parent.body || parent.consequent).filter(function (stmt) {
    return stmt.type !== "EmptyStatement";
  });
  return body && body[body.length - 1] === node;
}

function hasLeadingComment(node) {
  return node.comments && node.comments.some(function (comment) {
    return comment.leading;
  });
}

function hasTrailingComment(node) {
  return node.comments && node.comments.some(function (comment) {
    return comment.trailing;
  });
}

function hasLeadingOwnLineComment(text, node) {
  if (node.type === "JSXElement") {
    return false;
  }

  var res = node.comments && node.comments.some(function (comment) {
    return comment.leading && util$4.hasNewline(text, util$4.locEnd(comment));
  });
  return res;
}

function hasNakedLeftSide(node) {
  return node.type === "AssignmentExpression" || node.type === "BinaryExpression" || node.type === "LogicalExpression" || node.type === "ConditionalExpression" || node.type === "CallExpression" || node.type === "MemberExpression" || node.type === "SequenceExpression" || node.type === "TaggedTemplateExpression" || node.type === "UpdateExpression" && !node.prefix;
}

function getLeftSide(node) {
  if (node.expressions) {
    return node.expressions[0];
  }
  return node.left || node.test || node.callee || node.object || node.tag || node.argument || node.expression;
}

function exprNeedsASIProtection(node) {
  // HACK: node.needsParens is added in `genericPrint()` for the sole purpose
  // of being used here. It'd be preferable to find a cleaner way to do this.
  var maybeASIProblem = node.needsParens || node.type === "ParenthesizedExpression" || node.type === "TypeCastExpression" || node.type === "ArrowFunctionExpression" && !canPrintParamsWithoutParens(node) || node.type === "ArrayExpression" || node.type === "ArrayPattern" || node.type === "UnaryExpression" && node.prefix && (node.operator === "+" || node.operator === "-") || node.type === "TemplateLiteral" || node.type === "TemplateElement" || node.type === "JSXElement" || node.type === "BindExpression" || node.type === "RegExpLiteral" || node.type === "Literal" && node.pattern || node.type === "Literal" && node.regex;

  if (maybeASIProblem) {
    return true;
  }

  if (!hasNakedLeftSide(node)) {
    return false;
  }

  return exprNeedsASIProtection(getLeftSide(node));
}

function stmtNeedsASIProtection(path$$1) {
  if (!path$$1) {
    return false;
  }
  var node = path$$1.getNode();

  if (node.type !== "ExpressionStatement") {
    return false;
  }

  return exprNeedsASIProtection(node.expression);
}

function classPropMayCauseASIProblems(path$$1) {
  var node = path$$1.getNode();

  if (node.type !== "ClassProperty") {
    return false;
  }

  var name = node.key && node.key.name;
  if (!name) {
    return false;
  }

  // this isn't actually possible yet with most parsers available today
  // so isn't properly tested yet.
  if ((name === "static" || name === "get" || name === "set") && !node.typeAnnotation) {
    return true;
  }
}

function classChildNeedsASIProtection(node) {
  if (!node) {
    return;
  }

  if (!node.computed) {
    var _name4 = node.key && node.key.name;
    if (_name4 === "in" || _name4 === "instanceof") {
      return true;
    }
  }
  switch (node.type) {
    case "ClassProperty":
    case "TSAbstractClassProperty":
      return node.computed;
    case "MethodDefinition": // Flow
    case "TSAbstractMethodDefinition": // TypeScript
    case "ClassMethod":
      {
        // Babylon
        var isAsync = node.value ? node.value.async : node.async;
        var isGenerator = node.value ? node.value.generator : node.generator;
        if (isAsync || node.static || node.kind === "get" || node.kind === "set") {
          return false;
        }
        if (node.computed || isGenerator) {
          return true;
        }
        return false;
      }

    default:
      return false;
  }
}

// This recurses the return argument, looking for the first token
// (the leftmost leaf node) and, if it (or its parents) has any
// leadingComments, returns true (so it can be wrapped in parens).
function returnArgumentHasLeadingComment(options, argument) {
  if (hasLeadingOwnLineComment(options.originalText, argument)) {
    return true;
  }

  if (hasNakedLeftSide(argument)) {
    var leftMost = argument;
    var newLeftMost = void 0;
    while (newLeftMost = getLeftSide(leftMost)) {
      leftMost = newLeftMost;

      if (hasLeadingOwnLineComment(options.originalText, leftMost)) {
        return true;
      }
    }
  }

  return false;
}

function isMemberExpressionChain(node) {
  if (node.type !== "MemberExpression") {
    return false;
  }
  if (node.object.type === "Identifier") {
    return true;
  }
  return isMemberExpressionChain(node.object);
}

// Hack to differentiate between the following two which have the same ast
// type T = { method: () => void };
// type T = { method(): void };
function isObjectTypePropertyAFunction(node) {
  return node.type === "ObjectTypeProperty" && node.value.type === "FunctionTypeAnnotation" && !node.static && !isFunctionNotation(node);
}

// TODO: This is a bad hack and we need a better way to distinguish between
// arrow functions and otherwise
function isFunctionNotation(node) {
  return isGetterOrSetter(node) || sameLocStart(node, node.value);
}

function isGetterOrSetter(node) {
  return node.kind === "get" || node.kind === "set";
}

function sameLocStart(nodeA, nodeB) {
  return util$4.locStart(nodeA) === util$4.locStart(nodeB);
}

// Hack to differentiate between the following two which have the same ast
// declare function f(a): void;
// var f: (a) => void;
function isTypeAnnotationAFunction(node) {
  return node.type === "TypeAnnotation" && node.typeAnnotation.type === "FunctionTypeAnnotation" && !node.static && !sameLocStart(node, node.typeAnnotation);
}

function isNodeStartingWithDeclare(node, options) {
  if (!(options.parser === "flow" || options.parser === "typescript")) {
    return false;
  }
  return options.originalText.slice(0, util$4.locStart(node)).match(/declare\s*$/) || options.originalText.slice(node.range[0], node.range[1]).startsWith("declare ");
}

function shouldHugType(node) {
  if (node.type === "ObjectTypeAnnotation" || node.type === "TSTypeLiteral") {
    return true;
  }

  if (node.type === "UnionTypeAnnotation" || node.type === "TSUnionType") {
    var voidCount = node.types.filter(function (n) {
      return n.type === "VoidTypeAnnotation" || n.type === "TSVoidKeyword" || n.type === "NullLiteralTypeAnnotation" || n.type === "TSNullKeyword";
    }).length;

    var objectCount = node.types.filter(function (n) {
      return n.type === "ObjectTypeAnnotation" || n.type === "TSTypeLiteral" ||
      // This is a bit aggressive but captures Array<{x}>
      n.type === "GenericTypeAnnotation" || n.type === "TSTypeReference";
    }).length;

    if (node.types.length - 1 === voidCount && objectCount > 0) {
      return true;
    }
  }
  return false;
}

function shouldHugArguments(fun) {
  return fun && fun.params && fun.params.length === 1 && !fun.params[0].comments && (fun.params[0].type === "ObjectPattern" || fun.params[0].type === "Identifier" && fun.params[0].typeAnnotation && fun.params[0].typeAnnotation.type === "TypeAnnotation" && shouldHugType(fun.params[0].typeAnnotation.typeAnnotation) || fun.params[0].type === "FunctionTypeParam" && shouldHugType(fun.params[0].typeAnnotation)) && !fun.rest;
}

function templateLiteralHasNewLines(template) {
  return template.quasis.some(function (quasi) {
    return quasi.value.raw.includes("\n");
  });
}

function isTemplateOnItsOwnLine(n, text) {
  return (n.type === "TemplateLiteral" && templateLiteralHasNewLines(n) || n.type === "TaggedTemplateExpression" && templateLiteralHasNewLines(n.quasi)) && !util$4.hasNewline(text, util$4.locStart(n), { backwards: true });
}

function printArrayItems(path$$1, options, printPath, print) {
  var printedElements = [];
  var separatorParts = [];

  path$$1.each(function (childPath) {
    printedElements.push(concat$2(separatorParts));
    printedElements.push(group$1(print(childPath)));

    separatorParts = [",", line$1];
    if (childPath.getValue() && util$4.isNextLineEmpty(options.originalText, childPath.getValue())) {
      separatorParts.push(softline$1);
    }
  }, printPath);

  return concat$2(printedElements);
}

function hasDanglingComments(node) {
  return node.comments && node.comments.some(function (comment) {
    return !comment.leading && !comment.trailing;
  });
}

function isLiteral(node) {
  return node.type === "BooleanLiteral" || node.type === "DirectiveLiteral" || node.type === "Literal" || node.type === "NullLiteral" || node.type === "NumericLiteral" || node.type === "RegExpLiteral" || node.type === "StringLiteral" || node.type === "TemplateLiteral" || node.type === "TSTypeLiteral" || node.type === "JSXText";
}

function isStringLiteral(node) {
  return node.type === "StringLiteral" || node.type === "Literal" && typeof node.value === "string";
}

function isObjectType(n) {
  return n.type === "ObjectTypeAnnotation" || n.type === "TSTypeLiteral";
}

function printAstToDoc$1(ast, options, addAlignmentSize) {
  addAlignmentSize = addAlignmentSize || 0;

  var cache = new Map();

  function printGenerically(path$$1, args) {
    var node = path$$1.getValue();

    var shouldCache = node && (typeof node === 'undefined' ? 'undefined' : _typeof(node)) === "object" && args === undefined;
    if (shouldCache && cache.has(node)) {
      return cache.get(node);
    }

    var parent = path$$1.getParentNode(0);
    // We let JSXElement print its comments itself because it adds () around
    // UnionTypeAnnotation has to align the child without the comments
    var res = void 0;
    if (node && node.type === "JSXElement" || parent && (parent.type === "UnionTypeAnnotation" || parent.type === "TSUnionType")) {
      res = genericPrint(path$$1, options, printGenerically, args);
    } else {
      res = comments$3.printComments(path$$1, function (p) {
        return genericPrint(p, options, printGenerically, args);
      }, options, args && args.needsSemi);
    }

    if (shouldCache) {
      cache.set(node, res);
    }

    return res;
  }

  var doc = printGenerically(new FastPath(ast));
  if (addAlignmentSize > 0) {
    // Add a hardline to make the indents take effect
    // It should be removed in index.js format()
    doc = addAlignmentToDoc$1(docUtils.removeLines(concat$2([hardline$2, doc])), addAlignmentSize, options.tabWidth);
  }
  docUtils.propagateBreaks(doc);

  if (options.parser === "json") {
    doc = concat$2([doc, hardline$2]);
  }

  return doc;
}

var printer = { printAstToDoc: printAstToDoc$1 };

var docBuilders$8 = docBuilders$1;
var concat$7 = docBuilders$8.concat;
var fill$3 = docBuilders$8.fill;
var cursor$2 = docBuilders$8.cursor;

var MODE_BREAK = 1;
var MODE_FLAT = 2;

function rootIndent() {
  return {
    indent: 0,
    align: {
      spaces: 0,
      tabs: 0
    }
  };
}

function makeIndent(ind) {
  return {
    indent: ind.indent + 1,
    align: ind.align
  };
}

function makeAlign(ind, n) {
  if (n === -Infinity) {
    return {
      indent: 0,
      align: {
        spaces: 0,
        tabs: 0
      }
    };
  }

  return {
    indent: ind.indent,
    align: {
      spaces: ind.align.spaces + n,
      tabs: ind.align.tabs + (n ? 1 : 0)
    }
  };
}

function fits(next, restCommands, width, mustBeFlat) {
  var restIdx = restCommands.length;
  var cmds = [next];
  while (width >= 0) {
    if (cmds.length === 0) {
      if (restIdx === 0) {
        return true;
      }
      cmds.push(restCommands[restIdx - 1]);

      restIdx--;

      continue;
    }

    var x = cmds.pop();
    var ind = x[0];
    var mode = x[1];
    var doc = x[2];

    if (typeof doc === "string") {
      width -= doc.length;
    } else {
      switch (doc.type) {
        case "concat":
          for (var i = doc.parts.length - 1; i >= 0; i--) {
            cmds.push([ind, mode, doc.parts[i]]);
          }

          break;
        case "indent":
          cmds.push([makeIndent(ind), mode, doc.contents]);

          break;
        case "align":
          cmds.push([makeAlign(ind, doc.n), mode, doc.contents]);

          break;
        case "group":
          if (mustBeFlat && doc.break) {
            return false;
          }
          cmds.push([ind, doc.break ? MODE_BREAK : mode, doc.contents]);

          break;
        case "fill":
          for (var _i7 = doc.parts.length - 1; _i7 >= 0; _i7--) {
            cmds.push([ind, mode, doc.parts[_i7]]);
          }

          break;
        case "if-break":
          if (mode === MODE_BREAK) {
            if (doc.breakContents) {
              cmds.push([ind, mode, doc.breakContents]);
            }
          }
          if (mode === MODE_FLAT) {
            if (doc.flatContents) {
              cmds.push([ind, mode, doc.flatContents]);
            }
          }

          break;
        case "line":
          switch (mode) {
            // fallthrough
            case MODE_FLAT:
              if (!doc.hard) {
                if (!doc.soft) {
                  width -= 1;
                }

                break;
              }
              return true;

            case MODE_BREAK:
              return true;
          }
          break;
      }
    }
  }
  return false;
}

function printDocToString$1(doc, options) {
  var width = options.printWidth;
  var newLine = options.newLine || "\n";
  var pos = 0;
  // cmds is basically a stack. We've turned a recursive call into a
  // while loop which is much faster. The while loop below adds new
  // cmds to the array instead of recursively calling `print`.
  var cmds = [[rootIndent(), MODE_BREAK, doc]];
  var out = [];
  var shouldRemeasure = false;
  var lineSuffix = [];

  while (cmds.length !== 0) {
    var x = cmds.pop();
    var ind = x[0];
    var mode = x[1];
    var _doc = x[2];

    if (typeof _doc === "string") {
      out.push(_doc);

      pos += _doc.length;
    } else {
      switch (_doc.type) {
        case "cursor":
          out.push(cursor$2.placeholder);

          break;
        case "concat":
          for (var i = _doc.parts.length - 1; i >= 0; i--) {
            cmds.push([ind, mode, _doc.parts[i]]);
          }

          break;
        case "indent":
          cmds.push([makeIndent(ind), mode, _doc.contents]);

          break;
        case "align":
          cmds.push([makeAlign(ind, _doc.n), mode, _doc.contents]);

          break;
        case "group":
          switch (mode) {
            case MODE_FLAT:
              if (!shouldRemeasure) {
                cmds.push([ind, _doc.break ? MODE_BREAK : MODE_FLAT, _doc.contents]);

                break;
              }
            // fallthrough

            case MODE_BREAK:
              {
                shouldRemeasure = false;

                var next = [ind, MODE_FLAT, _doc.contents];
                var rem = width - pos;

                if (!_doc.break && fits(next, cmds, rem)) {
                  cmds.push(next);
                } else {
                  // Expanded states are a rare case where a document
                  // can manually provide multiple representations of
                  // itself. It provides an array of documents
                  // going from the least expanded (most flattened)
                  // representation first to the most expanded. If a
                  // group has these, we need to manually go through
                  // these states and find the first one that fits.
                  if (_doc.expandedStates) {
                    var mostExpanded = _doc.expandedStates[_doc.expandedStates.length - 1];

                    if (_doc.break) {
                      cmds.push([ind, MODE_BREAK, mostExpanded]);

                      break;
                    } else {
                      for (var _i8 = 1; _i8 < _doc.expandedStates.length + 1; _i8++) {
                        if (_i8 >= _doc.expandedStates.length) {
                          cmds.push([ind, MODE_BREAK, mostExpanded]);

                          break;
                        } else {
                          var state = _doc.expandedStates[_i8];
                          var cmd = [ind, MODE_FLAT, state];

                          if (fits(cmd, cmds, rem)) {
                            cmds.push(cmd);

                            break;
                          }
                        }
                      }
                    }
                  } else {
                    cmds.push([ind, MODE_BREAK, _doc.contents]);
                  }
                }

                break;
              }
          }
          break;
        // Fills each line with as much code as possible before moving to a new
        // line with the same indentation.
        //
        // Expects doc.parts to be an array of alternating content and
        // whitespace. The whitespace contains the linebreaks.
        //
        // For example:
        //   ["I", line, "love", line, "monkeys"]
        // or
        //   [{ type: group, ... }, softline, { type: group, ... }]
        //
        // It uses this parts structure to handle three main layout cases:
        // * The first two content items fit on the same line without
        //   breaking
        //   -> output the first content item and the whitespace "flat".
        // * Only the first content item fits on the line without breaking
        //   -> output the first content item "flat" and the whitespace with
        //   "break".
        // * Neither content item fits on the line without breaking
        //   -> output the first content item and the whitespace with "break".
        case "fill":
          {
            var _rem = width - pos;

            var parts = _doc.parts;
            if (parts.length === 0) {
              break;
            }

            var content = parts[0];
            var contentFlatCmd = [ind, MODE_FLAT, content];
            var contentBreakCmd = [ind, MODE_BREAK, content];
            var contentFits = fits(contentFlatCmd, [], width - _rem, true);

            if (parts.length === 1) {
              if (contentFits) {
                cmds.push(contentFlatCmd);
              } else {
                cmds.push(contentBreakCmd);
              }
              break;
            }

            var whitespace = parts[1];
            var whitespaceFlatCmd = [ind, MODE_FLAT, whitespace];
            var whitespaceBreakCmd = [ind, MODE_BREAK, whitespace];

            if (parts.length === 2) {
              if (contentFits) {
                cmds.push(whitespaceFlatCmd);
                cmds.push(contentFlatCmd);
              } else {
                cmds.push(whitespaceBreakCmd);
                cmds.push(contentBreakCmd);
              }
              break;
            }

            var remaining = parts.slice(2);
            var remainingCmd = [ind, mode, fill$3(remaining)];

            var secondContent = parts[2];
            var firstAndSecondContentFlatCmd = [ind, MODE_FLAT, concat$7([content, whitespace, secondContent])];
            var firstAndSecondContentFits = fits(firstAndSecondContentFlatCmd, [], _rem, true);

            if (firstAndSecondContentFits) {
              cmds.push(remainingCmd);
              cmds.push(whitespaceFlatCmd);
              cmds.push(contentFlatCmd);
            } else if (contentFits) {
              cmds.push(remainingCmd);
              cmds.push(whitespaceBreakCmd);
              cmds.push(contentFlatCmd);
            } else {
              cmds.push(remainingCmd);
              cmds.push(whitespaceBreakCmd);
              cmds.push(contentBreakCmd);
            }
            break;
          }
        case "if-break":
          if (mode === MODE_BREAK) {
            if (_doc.breakContents) {
              cmds.push([ind, mode, _doc.breakContents]);
            }
          }
          if (mode === MODE_FLAT) {
            if (_doc.flatContents) {
              cmds.push([ind, mode, _doc.flatContents]);
            }
          }

          break;
        case "line-suffix":
          lineSuffix.push([ind, mode, _doc.contents]);
          break;
        case "line-suffix-boundary":
          if (lineSuffix.length > 0) {
            cmds.push([ind, mode, { type: "line", hard: true }]);
          }
          break;
        case "line":
          switch (mode) {
            case MODE_FLAT:
              if (!_doc.hard) {
                if (!_doc.soft) {
                  out.push(" ");

                  pos += 1;
                }

                break;
              } else {
                // This line was forced into the output even if we
                // were in flattened mode, so we need to tell the next
                // group that no matter what, it needs to remeasure
                // because the previous measurement didn't accurately
                // capture the entire expression (this is necessary
                // for nested groups)
                shouldRemeasure = true;
              }
            // fallthrough

            case MODE_BREAK:
              if (lineSuffix.length) {
                cmds.push([ind, mode, _doc]);
                [].push.apply(cmds, lineSuffix.reverse());
                lineSuffix = [];
                break;
              }

              if (_doc.literal) {
                out.push(newLine);
                pos = 0;
              } else {
                if (out.length > 0) {
                  // Trim whitespace at the end of line
                  while (out.length > 0 && out[out.length - 1].match(/^[^\S\n]*$/)) {
                    out.pop();
                  }

                  if (out.length) {
                    out[out.length - 1] = out[out.length - 1].replace(/[^\S\n]*$/, "");
                  }
                }

                var length = ind.indent * options.tabWidth + ind.align.spaces;
                var indentString = options.useTabs ? "\t".repeat(ind.indent + ind.align.tabs) : " ".repeat(length);
                out.push(newLine + indentString);
                pos = length;
              }
              break;
          }
          break;
        default:
      }
    }
  }

  var cursorPlaceholderIndex = out.indexOf(cursor$2.placeholder);
  if (cursorPlaceholderIndex !== -1) {
    var beforeCursor = out.slice(0, cursorPlaceholderIndex).join("");
    var afterCursor = out.slice(cursorPlaceholderIndex + 1).join("");

    return {
      formatted: beforeCursor + afterCursor,
      cursor: beforeCursor.length
    };
  }

  return { formatted: out.join("") };
}

var docPrinter = { printDocToString: printDocToString$1 };

var index$30 = {
  "aliceblue": [240, 248, 255],
  "antiquewhite": [250, 235, 215],
  "aqua": [0, 255, 255],
  "aquamarine": [127, 255, 212],
  "azure": [240, 255, 255],
  "beige": [245, 245, 220],
  "bisque": [255, 228, 196],
  "black": [0, 0, 0],
  "blanchedalmond": [255, 235, 205],
  "blue": [0, 0, 255],
  "blueviolet": [138, 43, 226],
  "brown": [165, 42, 42],
  "burlywood": [222, 184, 135],
  "cadetblue": [95, 158, 160],
  "chartreuse": [127, 255, 0],
  "chocolate": [210, 105, 30],
  "coral": [255, 127, 80],
  "cornflowerblue": [100, 149, 237],
  "cornsilk": [255, 248, 220],
  "crimson": [220, 20, 60],
  "cyan": [0, 255, 255],
  "darkblue": [0, 0, 139],
  "darkcyan": [0, 139, 139],
  "darkgoldenrod": [184, 134, 11],
  "darkgray": [169, 169, 169],
  "darkgreen": [0, 100, 0],
  "darkgrey": [169, 169, 169],
  "darkkhaki": [189, 183, 107],
  "darkmagenta": [139, 0, 139],
  "darkolivegreen": [85, 107, 47],
  "darkorange": [255, 140, 0],
  "darkorchid": [153, 50, 204],
  "darkred": [139, 0, 0],
  "darksalmon": [233, 150, 122],
  "darkseagreen": [143, 188, 143],
  "darkslateblue": [72, 61, 139],
  "darkslategray": [47, 79, 79],
  "darkslategrey": [47, 79, 79],
  "darkturquoise": [0, 206, 209],
  "darkviolet": [148, 0, 211],
  "deeppink": [255, 20, 147],
  "deepskyblue": [0, 191, 255],
  "dimgray": [105, 105, 105],
  "dimgrey": [105, 105, 105],
  "dodgerblue": [30, 144, 255],
  "firebrick": [178, 34, 34],
  "floralwhite": [255, 250, 240],
  "forestgreen": [34, 139, 34],
  "fuchsia": [255, 0, 255],
  "gainsboro": [220, 220, 220],
  "ghostwhite": [248, 248, 255],
  "gold": [255, 215, 0],
  "goldenrod": [218, 165, 32],
  "gray": [128, 128, 128],
  "green": [0, 128, 0],
  "greenyellow": [173, 255, 47],
  "grey": [128, 128, 128],
  "honeydew": [240, 255, 240],
  "hotpink": [255, 105, 180],
  "indianred": [205, 92, 92],
  "indigo": [75, 0, 130],
  "ivory": [255, 255, 240],
  "khaki": [240, 230, 140],
  "lavender": [230, 230, 250],
  "lavenderblush": [255, 240, 245],
  "lawngreen": [124, 252, 0],
  "lemonchiffon": [255, 250, 205],
  "lightblue": [173, 216, 230],
  "lightcoral": [240, 128, 128],
  "lightcyan": [224, 255, 255],
  "lightgoldenrodyellow": [250, 250, 210],
  "lightgray": [211, 211, 211],
  "lightgreen": [144, 238, 144],
  "lightgrey": [211, 211, 211],
  "lightpink": [255, 182, 193],
  "lightsalmon": [255, 160, 122],
  "lightseagreen": [32, 178, 170],
  "lightskyblue": [135, 206, 250],
  "lightslategray": [119, 136, 153],
  "lightslategrey": [119, 136, 153],
  "lightsteelblue": [176, 196, 222],
  "lightyellow": [255, 255, 224],
  "lime": [0, 255, 0],
  "limegreen": [50, 205, 50],
  "linen": [250, 240, 230],
  "magenta": [255, 0, 255],
  "maroon": [128, 0, 0],
  "mediumaquamarine": [102, 205, 170],
  "mediumblue": [0, 0, 205],
  "mediumorchid": [186, 85, 211],
  "mediumpurple": [147, 112, 219],
  "mediumseagreen": [60, 179, 113],
  "mediumslateblue": [123, 104, 238],
  "mediumspringgreen": [0, 250, 154],
  "mediumturquoise": [72, 209, 204],
  "mediumvioletred": [199, 21, 133],
  "midnightblue": [25, 25, 112],
  "mintcream": [245, 255, 250],
  "mistyrose": [255, 228, 225],
  "moccasin": [255, 228, 181],
  "navajowhite": [255, 222, 173],
  "navy": [0, 0, 128],
  "oldlace": [253, 245, 230],
  "olive": [128, 128, 0],
  "olivedrab": [107, 142, 35],
  "orange": [255, 165, 0],
  "orangered": [255, 69, 0],
  "orchid": [218, 112, 214],
  "palegoldenrod": [238, 232, 170],
  "palegreen": [152, 251, 152],
  "paleturquoise": [175, 238, 238],
  "palevioletred": [219, 112, 147],
  "papayawhip": [255, 239, 213],
  "peachpuff": [255, 218, 185],
  "peru": [205, 133, 63],
  "pink": [255, 192, 203],
  "plum": [221, 160, 221],
  "powderblue": [176, 224, 230],
  "purple": [128, 0, 128],
  "rebeccapurple": [102, 51, 153],
  "red": [255, 0, 0],
  "rosybrown": [188, 143, 143],
  "royalblue": [65, 105, 225],
  "saddlebrown": [139, 69, 19],
  "salmon": [250, 128, 114],
  "sandybrown": [244, 164, 96],
  "seagreen": [46, 139, 87],
  "seashell": [255, 245, 238],
  "sienna": [160, 82, 45],
  "silver": [192, 192, 192],
  "skyblue": [135, 206, 235],
  "slateblue": [106, 90, 205],
  "slategray": [112, 128, 144],
  "slategrey": [112, 128, 144],
  "snow": [255, 250, 250],
  "springgreen": [0, 255, 127],
  "steelblue": [70, 130, 180],
  "tan": [210, 180, 140],
  "teal": [0, 128, 128],
  "thistle": [216, 191, 216],
  "tomato": [255, 99, 71],
  "turquoise": [64, 224, 208],
  "violet": [238, 130, 238],
  "wheat": [245, 222, 179],
  "white": [255, 255, 255],
  "whitesmoke": [245, 245, 245],
  "yellow": [255, 255, 0],
  "yellowgreen": [154, 205, 50]
};

var conversions$1 = createCommonjsModule(function (module) {
  /* MIT license */
  var cssKeywords = index$30;

  // NOTE: conversions should only return primitive values (i.e. arrays, or
  //       values that give correct `typeof` results).
  //       do not use box values types (i.e. Number(), String(), etc.)

  var reverseKeywords = {};
  for (var key in cssKeywords) {
    if (cssKeywords.hasOwnProperty(key)) {
      reverseKeywords[cssKeywords[key]] = key;
    }
  }

  var convert = module.exports = {
    rgb: { channels: 3, labels: 'rgb' },
    hsl: { channels: 3, labels: 'hsl' },
    hsv: { channels: 3, labels: 'hsv' },
    hwb: { channels: 3, labels: 'hwb' },
    cmyk: { channels: 4, labels: 'cmyk' },
    xyz: { channels: 3, labels: 'xyz' },
    lab: { channels: 3, labels: 'lab' },
    lch: { channels: 3, labels: 'lch' },
    hex: { channels: 1, labels: ['hex'] },
    keyword: { channels: 1, labels: ['keyword'] },
    ansi16: { channels: 1, labels: ['ansi16'] },
    ansi256: { channels: 1, labels: ['ansi256'] },
    hcg: { channels: 3, labels: ['h', 'c', 'g'] },
    apple: { channels: 3, labels: ['r16', 'g16', 'b16'] },
    gray: { channels: 1, labels: ['gray'] }
  };

  // hide .channels and .labels properties
  for (var model in convert) {
    if (convert.hasOwnProperty(model)) {
      if (!('channels' in convert[model])) {
        throw new Error('missing channels property: ' + model);
      }

      if (!('labels' in convert[model])) {
        throw new Error('missing channel labels property: ' + model);
      }

      if (convert[model].labels.length !== convert[model].channels) {
        throw new Error('channel and label counts mismatch: ' + model);
      }

      var channels = convert[model].channels;
      var labels = convert[model].labels;
      delete convert[model].channels;
      delete convert[model].labels;
      Object.defineProperty(convert[model], 'channels', { value: channels });
      Object.defineProperty(convert[model], 'labels', { value: labels });
    }
  }

  convert.rgb.hsl = function (rgb) {
    var r = rgb[0] / 255;
    var g = rgb[1] / 255;
    var b = rgb[2] / 255;
    var min = Math.min(r, g, b);
    var max = Math.max(r, g, b);
    var delta = max - min;
    var h;
    var s;
    var l;

    if (max === min) {
      h = 0;
    } else if (r === max) {
      h = (g - b) / delta;
    } else if (g === max) {
      h = 2 + (b - r) / delta;
    } else if (b === max) {
      h = 4 + (r - g) / delta;
    }

    h = Math.min(h * 60, 360);

    if (h < 0) {
      h += 360;
    }

    l = (min + max) / 2;

    if (max === min) {
      s = 0;
    } else if (l <= 0.5) {
      s = delta / (max + min);
    } else {
      s = delta / (2 - max - min);
    }

    return [h, s * 100, l * 100];
  };

  convert.rgb.hsv = function (rgb) {
    var r = rgb[0];
    var g = rgb[1];
    var b = rgb[2];
    var min = Math.min(r, g, b);
    var max = Math.max(r, g, b);
    var delta = max - min;
    var h;
    var s;
    var v;

    if (max === 0) {
      s = 0;
    } else {
      s = delta / max * 1000 / 10;
    }

    if (max === min) {
      h = 0;
    } else if (r === max) {
      h = (g - b) / delta;
    } else if (g === max) {
      h = 2 + (b - r) / delta;
    } else if (b === max) {
      h = 4 + (r - g) / delta;
    }

    h = Math.min(h * 60, 360);

    if (h < 0) {
      h += 360;
    }

    v = max / 255 * 1000 / 10;

    return [h, s, v];
  };

  convert.rgb.hwb = function (rgb) {
    var r = rgb[0];
    var g = rgb[1];
    var b = rgb[2];
    var h = convert.rgb.hsl(rgb)[0];
    var w = 1 / 255 * Math.min(r, Math.min(g, b));

    b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

    return [h, w * 100, b * 100];
  };

  convert.rgb.cmyk = function (rgb) {
    var r = rgb[0] / 255;
    var g = rgb[1] / 255;
    var b = rgb[2] / 255;
    var c;
    var m;
    var y;
    var k;

    k = Math.min(1 - r, 1 - g, 1 - b);
    c = (1 - r - k) / (1 - k) || 0;
    m = (1 - g - k) / (1 - k) || 0;
    y = (1 - b - k) / (1 - k) || 0;

    return [c * 100, m * 100, y * 100, k * 100];
  };

  /**
   * See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
   * */
  function comparativeDistance(x, y) {
    return Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2) + Math.pow(x[2] - y[2], 2);
  }

  convert.rgb.keyword = function (rgb) {
    var reversed = reverseKeywords[rgb];
    if (reversed) {
      return reversed;
    }

    var currentClosestDistance = Infinity;
    var currentClosestKeyword;

    for (var keyword in cssKeywords) {
      if (cssKeywords.hasOwnProperty(keyword)) {
        var value = cssKeywords[keyword];

        // Compute comparative distance
        var distance = comparativeDistance(rgb, value);

        // Check if its less, if so set as closest
        if (distance < currentClosestDistance) {
          currentClosestDistance = distance;
          currentClosestKeyword = keyword;
        }
      }
    }

    return currentClosestKeyword;
  };

  convert.keyword.rgb = function (keyword) {
    return cssKeywords[keyword];
  };

  convert.rgb.xyz = function (rgb) {
    var r = rgb[0] / 255;
    var g = rgb[1] / 255;
    var b = rgb[2] / 255;

    // assume sRGB
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    var x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    var y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    var z = r * 0.0193 + g * 0.1192 + b * 0.9505;

    return [x * 100, y * 100, z * 100];
  };

  convert.rgb.lab = function (rgb) {
    var xyz = convert.rgb.xyz(rgb);
    var x = xyz[0];
    var y = xyz[1];
    var z = xyz[2];
    var l;
    var a;
    var b;

    x /= 95.047;
    y /= 100;
    z /= 108.883;

    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

    l = 116 * y - 16;
    a = 500 * (x - y);
    b = 200 * (y - z);

    return [l, a, b];
  };

  convert.hsl.rgb = function (hsl) {
    var h = hsl[0] / 360;
    var s = hsl[1] / 100;
    var l = hsl[2] / 100;
    var t1;
    var t2;
    var t3;
    var rgb;
    var val;

    if (s === 0) {
      val = l * 255;
      return [val, val, val];
    }

    if (l < 0.5) {
      t2 = l * (1 + s);
    } else {
      t2 = l + s - l * s;
    }

    t1 = 2 * l - t2;

    rgb = [0, 0, 0];
    for (var i = 0; i < 3; i++) {
      t3 = h + 1 / 3 * -(i - 1);
      if (t3 < 0) {
        t3++;
      }
      if (t3 > 1) {
        t3--;
      }

      if (6 * t3 < 1) {
        val = t1 + (t2 - t1) * 6 * t3;
      } else if (2 * t3 < 1) {
        val = t2;
      } else if (3 * t3 < 2) {
        val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
      } else {
        val = t1;
      }

      rgb[i] = val * 255;
    }

    return rgb;
  };

  convert.hsl.hsv = function (hsl) {
    var h = hsl[0];
    var s = hsl[1] / 100;
    var l = hsl[2] / 100;
    var smin = s;
    var lmin = Math.max(l, 0.01);
    var sv;
    var v;

    l *= 2;
    s *= l <= 1 ? l : 2 - l;
    smin *= lmin <= 1 ? lmin : 2 - lmin;
    v = (l + s) / 2;
    sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s);

    return [h, sv * 100, v * 100];
  };

  convert.hsv.rgb = function (hsv) {
    var h = hsv[0] / 60;
    var s = hsv[1] / 100;
    var v = hsv[2] / 100;
    var hi = Math.floor(h) % 6;

    var f = h - Math.floor(h);
    var p = 255 * v * (1 - s);
    var q = 255 * v * (1 - s * f);
    var t = 255 * v * (1 - s * (1 - f));
    v *= 255;

    switch (hi) {
      case 0:
        return [v, t, p];
      case 1:
        return [q, v, p];
      case 2:
        return [p, v, t];
      case 3:
        return [p, q, v];
      case 4:
        return [t, p, v];
      case 5:
        return [v, p, q];
    }
  };

  convert.hsv.hsl = function (hsv) {
    var h = hsv[0];
    var s = hsv[1] / 100;
    var v = hsv[2] / 100;
    var vmin = Math.max(v, 0.01);
    var lmin;
    var sl;
    var l;

    l = (2 - s) * v;
    lmin = (2 - s) * vmin;
    sl = s * vmin;
    sl /= lmin <= 1 ? lmin : 2 - lmin;
    sl = sl || 0;
    l /= 2;

    return [h, sl * 100, l * 100];
  };

  // http://dev.w3.org/csswg/css-color/#hwb-to-rgb
  convert.hwb.rgb = function (hwb) {
    var h = hwb[0] / 360;
    var wh = hwb[1] / 100;
    var bl = hwb[2] / 100;
    var ratio = wh + bl;
    var i;
    var v;
    var f;
    var n;

    // wh + bl cant be > 1
    if (ratio > 1) {
      wh /= ratio;
      bl /= ratio;
    }

    i = Math.floor(6 * h);
    v = 1 - bl;
    f = 6 * h - i;

    if ((i & 0x01) !== 0) {
      f = 1 - f;
    }

    n = wh + f * (v - wh); // linear interpolation

    var r;
    var g;
    var b;
    switch (i) {
      default:
      case 6:
      case 0:
        r = v;g = n;b = wh;break;
      case 1:
        r = n;g = v;b = wh;break;
      case 2:
        r = wh;g = v;b = n;break;
      case 3:
        r = wh;g = n;b = v;break;
      case 4:
        r = n;g = wh;b = v;break;
      case 5:
        r = v;g = wh;b = n;break;
    }

    return [r * 255, g * 255, b * 255];
  };

  convert.cmyk.rgb = function (cmyk) {
    var c = cmyk[0] / 100;
    var m = cmyk[1] / 100;
    var y = cmyk[2] / 100;
    var k = cmyk[3] / 100;
    var r;
    var g;
    var b;

    r = 1 - Math.min(1, c * (1 - k) + k);
    g = 1 - Math.min(1, m * (1 - k) + k);
    b = 1 - Math.min(1, y * (1 - k) + k);

    return [r * 255, g * 255, b * 255];
  };

  convert.xyz.rgb = function (xyz) {
    var x = xyz[0] / 100;
    var y = xyz[1] / 100;
    var z = xyz[2] / 100;
    var r;
    var g;
    var b;

    r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    b = x * 0.0557 + y * -0.2040 + z * 1.0570;

    // assume sRGB
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1.0 / 2.4) - 0.055 : r * 12.92;

    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1.0 / 2.4) - 0.055 : g * 12.92;

    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1.0 / 2.4) - 0.055 : b * 12.92;

    r = Math.min(Math.max(0, r), 1);
    g = Math.min(Math.max(0, g), 1);
    b = Math.min(Math.max(0, b), 1);

    return [r * 255, g * 255, b * 255];
  };

  convert.xyz.lab = function (xyz) {
    var x = xyz[0];
    var y = xyz[1];
    var z = xyz[2];
    var l;
    var a;
    var b;

    x /= 95.047;
    y /= 100;
    z /= 108.883;

    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

    l = 116 * y - 16;
    a = 500 * (x - y);
    b = 200 * (y - z);

    return [l, a, b];
  };

  convert.lab.xyz = function (lab) {
    var l = lab[0];
    var a = lab[1];
    var b = lab[2];
    var x;
    var y;
    var z;

    y = (l + 16) / 116;
    x = a / 500 + y;
    z = y - b / 200;

    var y2 = Math.pow(y, 3);
    var x2 = Math.pow(x, 3);
    var z2 = Math.pow(z, 3);
    y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
    x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
    z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

    x *= 95.047;
    y *= 100;
    z *= 108.883;

    return [x, y, z];
  };

  convert.lab.lch = function (lab) {
    var l = lab[0];
    var a = lab[1];
    var b = lab[2];
    var hr;
    var h;
    var c;

    hr = Math.atan2(b, a);
    h = hr * 360 / 2 / Math.PI;

    if (h < 0) {
      h += 360;
    }

    c = Math.sqrt(a * a + b * b);

    return [l, c, h];
  };

  convert.lch.lab = function (lch) {
    var l = lch[0];
    var c = lch[1];
    var h = lch[2];
    var a;
    var b;
    var hr;

    hr = h / 360 * 2 * Math.PI;
    a = c * Math.cos(hr);
    b = c * Math.sin(hr);

    return [l, a, b];
  };

  convert.rgb.ansi16 = function (args) {
    var r = args[0];
    var g = args[1];
    var b = args[2];
    var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2]; // hsv -> ansi16 optimization

    value = Math.round(value / 50);

    if (value === 0) {
      return 30;
    }

    var ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));

    if (value === 2) {
      ansi += 60;
    }

    return ansi;
  };

  convert.hsv.ansi16 = function (args) {
    // optimization here; we already know the value and don't need to get
    // it converted for us.
    return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
  };

  convert.rgb.ansi256 = function (args) {
    var r = args[0];
    var g = args[1];
    var b = args[2];

    // we use the extended greyscale palette here, with the exception of
    // black and white. normal palette only has 4 greyscale shades.
    if (r === g && g === b) {
      if (r < 8) {
        return 16;
      }

      if (r > 248) {
        return 231;
      }

      return Math.round((r - 8) / 247 * 24) + 232;
    }

    var ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);

    return ansi;
  };

  convert.ansi16.rgb = function (args) {
    var color = args % 10;

    // handle greyscale
    if (color === 0 || color === 7) {
      if (args > 50) {
        color += 3.5;
      }

      color = color / 10.5 * 255;

      return [color, color, color];
    }

    var mult = (~~(args > 50) + 1) * 0.5;
    var r = (color & 1) * mult * 255;
    var g = (color >> 1 & 1) * mult * 255;
    var b = (color >> 2 & 1) * mult * 255;

    return [r, g, b];
  };

  convert.ansi256.rgb = function (args) {
    // handle greyscale
    if (args >= 232) {
      var c = (args - 232) * 10 + 8;
      return [c, c, c];
    }

    args -= 16;

    var rem;
    var r = Math.floor(args / 36) / 5 * 255;
    var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
    var b = rem % 6 / 5 * 255;

    return [r, g, b];
  };

  convert.rgb.hex = function (args) {
    var integer = ((Math.round(args[0]) & 0xFF) << 16) + ((Math.round(args[1]) & 0xFF) << 8) + (Math.round(args[2]) & 0xFF);

    var string = integer.toString(16).toUpperCase();
    return '000000'.substring(string.length) + string;
  };

  convert.hex.rgb = function (args) {
    var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
    if (!match) {
      return [0, 0, 0];
    }

    var colorString = match[0];

    if (match[0].length === 3) {
      colorString = colorString.split('').map(function (char) {
        return char + char;
      }).join('');
    }

    var integer = parseInt(colorString, 16);
    var r = integer >> 16 & 0xFF;
    var g = integer >> 8 & 0xFF;
    var b = integer & 0xFF;

    return [r, g, b];
  };

  convert.rgb.hcg = function (rgb) {
    var r = rgb[0] / 255;
    var g = rgb[1] / 255;
    var b = rgb[2] / 255;
    var max = Math.max(Math.max(r, g), b);
    var min = Math.min(Math.min(r, g), b);
    var chroma = max - min;
    var grayscale;
    var hue;

    if (chroma < 1) {
      grayscale = min / (1 - chroma);
    } else {
      grayscale = 0;
    }

    if (chroma <= 0) {
      hue = 0;
    } else if (max === r) {
      hue = (g - b) / chroma % 6;
    } else if (max === g) {
      hue = 2 + (b - r) / chroma;
    } else {
      hue = 4 + (r - g) / chroma + 4;
    }

    hue /= 6;
    hue %= 1;

    return [hue * 360, chroma * 100, grayscale * 100];
  };

  convert.hsl.hcg = function (hsl) {
    var s = hsl[1] / 100;
    var l = hsl[2] / 100;
    var c = 1;
    var f = 0;

    if (l < 0.5) {
      c = 2.0 * s * l;
    } else {
      c = 2.0 * s * (1.0 - l);
    }

    if (c < 1.0) {
      f = (l - 0.5 * c) / (1.0 - c);
    }

    return [hsl[0], c * 100, f * 100];
  };

  convert.hsv.hcg = function (hsv) {
    var s = hsv[1] / 100;
    var v = hsv[2] / 100;

    var c = s * v;
    var f = 0;

    if (c < 1.0) {
      f = (v - c) / (1 - c);
    }

    return [hsv[0], c * 100, f * 100];
  };

  convert.hcg.rgb = function (hcg) {
    var h = hcg[0] / 360;
    var c = hcg[1] / 100;
    var g = hcg[2] / 100;

    if (c === 0.0) {
      return [g * 255, g * 255, g * 255];
    }

    var pure = [0, 0, 0];
    var hi = h % 1 * 6;
    var v = hi % 1;
    var w = 1 - v;
    var mg = 0;

    switch (Math.floor(hi)) {
      case 0:
        pure[0] = 1;pure[1] = v;pure[2] = 0;break;
      case 1:
        pure[0] = w;pure[1] = 1;pure[2] = 0;break;
      case 2:
        pure[0] = 0;pure[1] = 1;pure[2] = v;break;
      case 3:
        pure[0] = 0;pure[1] = w;pure[2] = 1;break;
      case 4:
        pure[0] = v;pure[1] = 0;pure[2] = 1;break;
      default:
        pure[0] = 1;pure[1] = 0;pure[2] = w;
    }

    mg = (1.0 - c) * g;

    return [(c * pure[0] + mg) * 255, (c * pure[1] + mg) * 255, (c * pure[2] + mg) * 255];
  };

  convert.hcg.hsv = function (hcg) {
    var c = hcg[1] / 100;
    var g = hcg[2] / 100;

    var v = c + g * (1.0 - c);
    var f = 0;

    if (v > 0.0) {
      f = c / v;
    }

    return [hcg[0], f * 100, v * 100];
  };

  convert.hcg.hsl = function (hcg) {
    var c = hcg[1] / 100;
    var g = hcg[2] / 100;

    var l = g * (1.0 - c) + 0.5 * c;
    var s = 0;

    if (l > 0.0 && l < 0.5) {
      s = c / (2 * l);
    } else if (l >= 0.5 && l < 1.0) {
      s = c / (2 * (1 - l));
    }

    return [hcg[0], s * 100, l * 100];
  };

  convert.hcg.hwb = function (hcg) {
    var c = hcg[1] / 100;
    var g = hcg[2] / 100;
    var v = c + g * (1.0 - c);
    return [hcg[0], (v - c) * 100, (1 - v) * 100];
  };

  convert.hwb.hcg = function (hwb) {
    var w = hwb[1] / 100;
    var b = hwb[2] / 100;
    var v = 1 - b;
    var c = v - w;
    var g = 0;

    if (c < 1) {
      g = (v - c) / (1 - c);
    }

    return [hwb[0], c * 100, g * 100];
  };

  convert.apple.rgb = function (apple) {
    return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
  };

  convert.rgb.apple = function (rgb) {
    return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
  };

  convert.gray.rgb = function (args) {
    return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
  };

  convert.gray.hsl = convert.gray.hsv = function (args) {
    return [0, 0, args[0]];
  };

  convert.gray.hwb = function (gray) {
    return [0, 100, gray[0]];
  };

  convert.gray.cmyk = function (gray) {
    return [0, 0, 0, gray[0]];
  };

  convert.gray.lab = function (gray) {
    return [gray[0], 0, 0];
  };

  convert.gray.hex = function (gray) {
    var val = Math.round(gray[0] / 100 * 255) & 0xFF;
    var integer = (val << 16) + (val << 8) + val;

    var string = integer.toString(16).toUpperCase();
    return '000000'.substring(string.length) + string;
  };

  convert.rgb.gray = function (rgb) {
    var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
    return [val / 255 * 100];
  };
});

var conversions$3 = conversions$1;

/*
	this function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

// https://jsperf.com/object-keys-vs-for-in-with-closure/3
var models$1 = Object.keys(conversions$3);

function buildGraph() {
  var graph = {};

  for (var len = models$1.length, i = 0; i < len; i++) {
    graph[models$1[i]] = {
      // http://jsperf.com/1-vs-infinity
      // micro-opt, but this is simple.
      distance: -1,
      parent: null
    };
  }

  return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
  var graph = buildGraph();
  var queue = [fromModel]; // unshift -> queue -> pop

  graph[fromModel].distance = 0;

  while (queue.length) {
    var current = queue.pop();
    var adjacents = Object.keys(conversions$3[current]);

    for (var len = adjacents.length, i = 0; i < len; i++) {
      var adjacent = adjacents[i];
      var node = graph[adjacent];

      if (node.distance === -1) {
        node.distance = graph[current].distance + 1;
        node.parent = current;
        queue.unshift(adjacent);
      }
    }
  }

  return graph;
}

function link(from, to) {
  return function (args) {
    return to(from(args));
  };
}

function wrapConversion(toModel, graph) {
  var path$$1 = [graph[toModel].parent, toModel];
  var fn = conversions$3[graph[toModel].parent][toModel];

  var cur = graph[toModel].parent;
  while (graph[cur].parent) {
    path$$1.unshift(graph[cur].parent);
    fn = link(conversions$3[graph[cur].parent][cur], fn);
    cur = graph[cur].parent;
  }

  fn.conversion = path$$1;
  return fn;
}

var route$1 = function route$1(fromModel) {
  var graph = deriveBFS(fromModel);
  var conversion = {};

  var models = Object.keys(graph);
  for (var len = models.length, i = 0; i < len; i++) {
    var toModel = models[i];
    var node = graph[toModel];

    if (node.parent === null) {
      // no possible conversion, or this node is the source model.
      continue;
    }

    conversion[toModel] = wrapConversion(toModel, graph);
  }

  return conversion;
};

var conversions = conversions$1;
var route = route$1;

var convert = {};

var models = Object.keys(conversions);

function wrapRaw(fn) {
  var wrappedFn = function wrappedFn(args) {
    if (args === undefined || args === null) {
      return args;
    }

    if (arguments.length > 1) {
      args = Array.prototype.slice.call(arguments);
    }

    return fn(args);
  };

  // preserve .conversion property if there is one
  if ('conversion' in fn) {
    wrappedFn.conversion = fn.conversion;
  }

  return wrappedFn;
}

function wrapRounded(fn) {
  var wrappedFn = function wrappedFn(args) {
    if (args === undefined || args === null) {
      return args;
    }

    if (arguments.length > 1) {
      args = Array.prototype.slice.call(arguments);
    }

    var result = fn(args);

    // we're assuming the result is an array here.
    // see notice in conversions.js; don't use box types
    // in conversion functions.
    if ((typeof result === 'undefined' ? 'undefined' : _typeof(result)) === 'object') {
      for (var len = result.length, i = 0; i < len; i++) {
        result[i] = Math.round(result[i]);
      }
    }

    return result;
  };

  // preserve .conversion property if there is one
  if ('conversion' in fn) {
    wrappedFn.conversion = fn.conversion;
  }

  return wrappedFn;
}

models.forEach(function (fromModel) {
  convert[fromModel] = {};

  Object.defineProperty(convert[fromModel], 'channels', { value: conversions[fromModel].channels });
  Object.defineProperty(convert[fromModel], 'labels', { value: conversions[fromModel].labels });

  var routes = route(fromModel);
  var routeModels = Object.keys(routes);

  routeModels.forEach(function (toModel) {
    var fn = routes[toModel];

    convert[fromModel][toModel] = wrapRounded(fn);
    convert[fromModel][toModel].raw = wrapRaw(fn);
  });
});

var index$28 = convert;

var index$26 = createCommonjsModule(function (module) {
  'use strict';

  var colorConvert = index$28;

  var wrapAnsi16 = function wrapAnsi16(fn, offset) {
    return function () {
      var code = fn.apply(colorConvert, arguments);
      return '\x1B[' + (code + offset) + 'm';
    };
  };

  var wrapAnsi256 = function wrapAnsi256(fn, offset) {
    return function () {
      var code = fn.apply(colorConvert, arguments);
      return '\x1B[' + (38 + offset) + ';5;' + code + 'm';
    };
  };

  var wrapAnsi16m = function wrapAnsi16m(fn, offset) {
    return function () {
      var rgb = fn.apply(colorConvert, arguments);
      return '\x1B[' + (38 + offset) + ';2;' + rgb[0] + ';' + rgb[1] + ';' + rgb[2] + 'm';
    };
  };

  function assembleStyles() {
    var styles = {
      modifier: {
        reset: [0, 0],
        // 21 isn't widely supported and 22 does the same thing
        bold: [1, 22],
        dim: [2, 22],
        italic: [3, 23],
        underline: [4, 24],
        inverse: [7, 27],
        hidden: [8, 28],
        strikethrough: [9, 29]
      },
      color: {
        black: [30, 39],
        red: [31, 39],
        green: [32, 39],
        yellow: [33, 39],
        blue: [34, 39],
        magenta: [35, 39],
        cyan: [36, 39],
        white: [37, 39],
        gray: [90, 39],

        // Bright color
        redBright: [91, 39],
        greenBright: [92, 39],
        yellowBright: [93, 39],
        blueBright: [94, 39],
        magentaBright: [95, 39],
        cyanBright: [96, 39],
        whiteBright: [97, 39]
      },
      bgColor: {
        bgBlack: [40, 49],
        bgRed: [41, 49],
        bgGreen: [42, 49],
        bgYellow: [43, 49],
        bgBlue: [44, 49],
        bgMagenta: [45, 49],
        bgCyan: [46, 49],
        bgWhite: [47, 49],

        // Bright color
        bgBlackBright: [100, 49],
        bgRedBright: [101, 49],
        bgGreenBright: [102, 49],
        bgYellowBright: [103, 49],
        bgBlueBright: [104, 49],
        bgMagentaBright: [105, 49],
        bgCyanBright: [106, 49],
        bgWhiteBright: [107, 49]
      }
    };

    // Fix humans
    styles.color.grey = styles.color.gray;

    Object.keys(styles).forEach(function (groupName) {
      var group = styles[groupName];

      Object.keys(group).forEach(function (styleName) {
        var style = group[styleName];

        styles[styleName] = {
          open: '\x1B[' + style[0] + 'm',
          close: '\x1B[' + style[1] + 'm'
        };

        group[styleName] = styles[styleName];
      });

      Object.defineProperty(styles, groupName, {
        value: group,
        enumerable: false
      });
    });

    var rgb2rgb = function rgb2rgb(r, g, b) {
      return [r, g, b];
    };

    styles.color.close = '\x1B[39m';
    styles.bgColor.close = '\x1B[49m';

    styles.color.ansi = {};
    styles.color.ansi256 = {};
    styles.color.ansi16m = {
      rgb: wrapAnsi16m(rgb2rgb, 0)
    };

    styles.bgColor.ansi = {};
    styles.bgColor.ansi256 = {};
    styles.bgColor.ansi16m = {
      rgb: wrapAnsi16m(rgb2rgb, 10)
    };

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(colorConvert)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var key = _step.value;

        if (_typeof(colorConvert[key]) !== 'object') {
          continue;
        }

        var suite = colorConvert[key];

        if ('ansi16' in suite) {
          styles.color.ansi[key] = wrapAnsi16(suite.ansi16, 0);
          styles.bgColor.ansi[key] = wrapAnsi16(suite.ansi16, 10);
        }

        if ('ansi256' in suite) {
          styles.color.ansi256[key] = wrapAnsi256(suite.ansi256, 0);
          styles.bgColor.ansi256[key] = wrapAnsi256(suite.ansi256, 10);
        }

        if ('rgb' in suite) {
          styles.color.ansi16m[key] = wrapAnsi16m(suite.rgb, 0);
          styles.bgColor.ansi16m[key] = wrapAnsi16m(suite.rgb, 10);
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return styles;
  }

  Object.defineProperty(module, 'exports', {
    enumerable: true,
    get: assembleStyles
  });
});

var asymmetricMatcher = Symbol.for('jest.asymmetricMatcher'); /**
                                                               * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
                                                               *
                                                               * This source code is licensed under the BSD-style license found in the
                                                               * LICENSE file in the root directory of this source tree. An additional grant
                                                               * of patent rights can be found in the PATENTS file in the same directory.
                                                               *
                                                               * 
                                                               */var SPACE = ' ';
var ArrayContaining = function (_Array) {
  _inherits(ArrayContaining, _Array);

  function ArrayContaining() {
    _classCallCheck(this, ArrayContaining);

    return _possibleConstructorReturn(this, (ArrayContaining.__proto__ || Object.getPrototypeOf(ArrayContaining)).apply(this, arguments));
  }

  return ArrayContaining;
}(Array);

var ObjectContaining = function (_Object) {
  _inherits(ObjectContaining, _Object);

  function ObjectContaining() {
    _classCallCheck(this, ObjectContaining);

    return _possibleConstructorReturn(this, (ObjectContaining.__proto__ || Object.getPrototypeOf(ObjectContaining)).apply(this, arguments));
  }

  return ObjectContaining;
}(Object);

var print$1 = function print$1(val, print, indent, opts, colors) {
  var stringedValue = val.toString();

  if (stringedValue === 'ArrayContaining') {
    var array = ArrayContaining.from(val.sample);
    return opts.spacing === SPACE ? stringedValue + SPACE + print(array) : print(array);
  }

  if (stringedValue === 'ObjectContaining') {
    var object = Object.assign(new ObjectContaining(), val.sample);
    return opts.spacing === SPACE ? stringedValue + SPACE + print(object) : print(object);
  }

  if (stringedValue === 'StringMatching') {
    return stringedValue + SPACE + print(val.sample);
  }

  if (stringedValue === 'StringContaining') {
    return stringedValue + SPACE + print(val.sample);
  }

  return val.toAsymmetricMatcher();
};

var test = function test(object) {
  return object && object.$$typeof === asymmetricMatcher;
};

var AsymmetricMatcher$1 = { print: print$1, test: test };

var ansiRegex$2 = index$14; /**
                                        * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
                                        *
                                        * This source code is licensed under the BSD-style license found in the
                                        * LICENSE file in the root directory of this source tree. An additional grant
                                        * of patent rights can be found in the PATENTS file in the same directory.
                                        *
                                        * 
                                        */var toHumanReadableAnsi = function toHumanReadableAnsi(text) {
  var style = index$26;return text.replace(ansiRegex$2(), function (match, offset, string) {
    switch (match) {case style.red.close:case style.green.close:case style.reset.open:
      case style.reset.close:
        return '</>';
      case style.red.open:
        return '<red>';
      case style.green.open:
        return '<green>';
      case style.dim.open:
        return '<dim>';
      case style.bold.open:
        return '<bold>';
      default:
        return '';}
  });
};

var test$1 = function test$1(value) {
  return typeof value === 'string' && value.match(ansiRegex$2());
};

var print$2 = function print$2(val, print, indent, opts, colors) {
  return print(toHumanReadableAnsi(val));
};

var ConvertAnsi = { print: print$2, test: test$1 };

function escapeHTML$1(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

var escapeHTML_1 = escapeHTML$1;

var escapeHTML = escapeHTML_1; /**
                                               * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
                                               *
                                               * This source code is licensed under the BSD-style license found in the
                                               * LICENSE file in the root directory of this source tree. An additional grant
                                               * of patent rights can be found in the PATENTS file in the same directory.
                                               *
                                               * 
                                               */

var HTML_ELEMENT_REGEXP = /(HTML\w*?Element)|Text|Comment/;
var test$2 = isHTMLElement;

function isHTMLElement(value) {
  return value !== undefined && value !== null && (value.nodeType === 1 || value.nodeType === 3 || value.nodeType === 8) && value.constructor !== undefined && value.constructor.name !== undefined && HTML_ELEMENT_REGEXP.test(value.constructor.name);
}

function printChildren$1(flatChildren, print, indent, colors, opts) {
  return flatChildren.map(function (node) {
    if ((typeof node === 'undefined' ? 'undefined' : _typeof(node)) === 'object') {
      return print(node, print, indent, colors, opts);
    } else if (typeof node === 'string') {
      return colors.content.open + escapeHTML(node) + colors.content.close;
    } else {
      return print(node);
    }
  }).filter(function (value) {
    return value.trim().length;
  }).join(opts.edgeSpacing);
}

function printAttributes$1(attributes, indent, colors, opts) {
  return attributes.sort().map(function (attribute) {
    return opts.spacing + indent(colors.prop.open + attribute.name + colors.prop.close + '=') + colors.value.open + ('"' + attribute.value + '"') + colors.value.close;
  }).join('');
}

var print$3 = function print$3(element, print, indent, opts, colors) {
  if (element.nodeType === 3) {
    return element.data.split('\n').map(function (text) {
      return text.trimLeft();
    }).filter(function (text) {
      return text.length;
    }).join(' ');
  } else if (element.nodeType === 8) {
    return colors.comment.open + '<!-- ' + element.data.trim() + ' -->' + colors.comment.close;
  }

  var result = colors.tag.open + '<';
  var elementName = element.tagName.toLowerCase();
  result += elementName + colors.tag.close;

  var hasAttributes = element.attributes && element.attributes.length;
  if (hasAttributes) {
    var attributes = Array.prototype.slice.call(element.attributes);
    result += printAttributes$1(attributes, indent, colors, opts);
  }

  var flatChildren = Array.prototype.slice.call(element.childNodes);
  if (!flatChildren.length && element.textContent) {
    flatChildren.push(element.textContent);
  }

  var closeInNewLine = hasAttributes && !opts.min;
  if (flatChildren.length) {
    var children = printChildren$1(flatChildren, print, indent, colors, opts);
    result += colors.tag.open + (closeInNewLine ? '\n' : '') + '>' + colors.tag.close + opts.edgeSpacing + indent(children) + opts.edgeSpacing + colors.tag.open + '</' + elementName + '>' + colors.tag.close;
  } else {
    result += colors.tag.open + (closeInNewLine ? '\n' : ' ') + '/>' + colors.tag.close;
  }

  return result;
};

var HTMLElement$1 = { print: print$3, test: test$2 };

var _slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  }return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var IMMUTABLE_NAMESPACE = 'Immutable.'; /**
                                         * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
                                         *
                                         * This source code is licensed under the BSD-style license found in the
                                         * LICENSE file in the root directory of this source tree. An additional grant
                                         * of patent rights can be found in the PATENTS file in the same directory.
                                         *
                                         * 
                                         */var SPACE$1 = ' ';var addKey = function addKey(isMap, key) {
  return isMap ? key + ': ' : '';
};var addFinalEdgeSpacing = function addFinalEdgeSpacing(length, edgeSpacing) {
  return length > 0 ? edgeSpacing : '';
};var printImmutable$1 = function printImmutable$1(val, print, indent, opts, colors, immutableDataStructureName, isMap) {
  var _ref = isMap ? ['{', '}'] : ['[', ']'],
      _ref2 = _slicedToArray(_ref, 2);var openTag = _ref2[0],
      closeTag = _ref2[1];
  var result = IMMUTABLE_NAMESPACE + immutableDataStructureName + SPACE$1 + openTag + opts.edgeSpacing;

  var immutableArray = [];
  val.forEach(function (item, key) {
    return immutableArray.push(indent(addKey(isMap, key) + print(item, print, indent, opts, colors)));
  });

  result += immutableArray.join(',' + opts.spacing);
  if (!opts.min && immutableArray.length > 0) {
    result += ',';
  }

  return result + addFinalEdgeSpacing(immutableArray.length, opts.edgeSpacing) + closeTag;
};

var printImmutable_1 = printImmutable$1;

var printImmutable = printImmutable_1; /**
                                                       * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
                                                       *
                                                       * This source code is licensed under the BSD-style license found in the
                                                       * LICENSE file in the root directory of this source tree. An additional grant
                                                       * of patent rights can be found in the PATENTS file in the same directory.
                                                       *
                                                       * 
                                                       */var IS_LIST = '@@__IMMUTABLE_LIST__@@';var test$3 = function test$3(maybeList) {
  return !!(maybeList && maybeList[IS_LIST]);
};var print$4 = function print$4(val, print, indent, opts, colors) {
  return printImmutable(val, print, indent, opts, colors, 'List', false);
};

var ImmutableList = { print: print$4, test: test$3 };

var printImmutable$2 = printImmutable_1; /**
                                                       * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
                                                       *
                                                       * This source code is licensed under the BSD-style license found in the
                                                       * LICENSE file in the root directory of this source tree. An additional grant
                                                       * of patent rights can be found in the PATENTS file in the same directory.
                                                       *
                                                       * 
                                                       */var IS_SET = '@@__IMMUTABLE_SET__@@';var IS_ORDERED = '@@__IMMUTABLE_ORDERED__@@';var test$4 = function test$4(maybeSet) {
  return !!(maybeSet && maybeSet[IS_SET] && !maybeSet[IS_ORDERED]);
};var print$5 = function print$5(val, print, indent, opts, colors) {
  return printImmutable$2(val, print, indent, opts, colors, 'Set', false);
};

var ImmutableSet = { print: print$5, test: test$4 };

var printImmutable$3 = printImmutable_1; /**
                                                       * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
                                                       *
                                                       * This source code is licensed under the BSD-style license found in the
                                                       * LICENSE file in the root directory of this source tree. An additional grant
                                                       * of patent rights can be found in the PATENTS file in the same directory.
                                                       *
                                                       * 
                                                       */var IS_MAP = '@@__IMMUTABLE_MAP__@@';var IS_ORDERED$1 = '@@__IMMUTABLE_ORDERED__@@';var test$5 = function test$5(maybeMap) {
  return !!(maybeMap && maybeMap[IS_MAP] && !maybeMap[IS_ORDERED$1]);
};var print$6 = function print$6(val, print, indent, opts, colors) {
  return printImmutable$3(val, print, indent, opts, colors, 'Map', true);
};

var ImmutableMap = { print: print$6, test: test$5 };

var printImmutable$4 = printImmutable_1; /**
                                                       * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
                                                       *
                                                       * This source code is licensed under the BSD-style license found in the
                                                       * LICENSE file in the root directory of this source tree. An additional grant
                                                       * of patent rights can be found in the PATENTS file in the same directory.
                                                       *
                                                       * 
                                                       */var IS_STACK = '@@__IMMUTABLE_STACK__@@';var test$6 = function test$6(maybeStack) {
  return !!(maybeStack && maybeStack[IS_STACK]);
};var print$7 = function print$7(val, print, indent, opts, colors) {
  return printImmutable$4(val, print, indent, opts, colors, 'Stack', false);
};

var ImmutableStack = { print: print$7, test: test$6 };

var printImmutable$5 = printImmutable_1; /**
                                                       * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
                                                       *
                                                       * This source code is licensed under the BSD-style license found in the
                                                       * LICENSE file in the root directory of this source tree. An additional grant
                                                       * of patent rights can be found in the PATENTS file in the same directory.
                                                       *
                                                       * 
                                                       */var IS_SET$1 = '@@__IMMUTABLE_SET__@@';var IS_ORDERED$2 = '@@__IMMUTABLE_ORDERED__@@';var test$7 = function test$7(maybeOrderedSet) {
  return maybeOrderedSet && maybeOrderedSet[IS_SET$1] && maybeOrderedSet[IS_ORDERED$2];
};var print$8 = function print$8(val, print, indent, opts, colors) {
  return printImmutable$5(val, print, indent, opts, colors, 'OrderedSet', false);
};

var ImmutableOrderedSet = { print: print$8, test: test$7 };

var printImmutable$6 = printImmutable_1; /**
                                                       * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
                                                       *
                                                       * This source code is licensed under the BSD-style license found in the
                                                       * LICENSE file in the root directory of this source tree. An additional grant
                                                       * of patent rights can be found in the PATENTS file in the same directory.
                                                       *
                                                       * 
                                                       */var IS_MAP$1 = '@@__IMMUTABLE_MAP__@@';var IS_ORDERED$3 = '@@__IMMUTABLE_ORDERED__@@';var test$8 = function test$8(maybeOrderedMap) {
  return maybeOrderedMap && maybeOrderedMap[IS_MAP$1] && maybeOrderedMap[IS_ORDERED$3];
};var print$9 = function print$9(val, print, indent, opts, colors) {
  return printImmutable$6(val, print, indent, opts, colors, 'OrderedMap', true);
};

var ImmutableOrderedMap = { print: print$9, test: test$8 };

var ImmutablePlugins = [ImmutableList, ImmutableSet, ImmutableMap, ImmutableStack, ImmutableOrderedSet, ImmutableOrderedMap];

var escapeHTML$2 = escapeHTML_1; /**
                                               * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
                                               *
                                               * This source code is licensed under the BSD-style license found in the
                                               * LICENSE file in the root directory of this source tree. An additional grant
                                               * of patent rights can be found in the PATENTS file in the same directory.
                                               *
                                               * 
                                               */var reactElement = Symbol.for('react.element');function traverseChildren(opaqueChildren, cb) {
  if (Array.isArray(opaqueChildren)) {
    opaqueChildren.forEach(function (child) {
      return traverseChildren(child, cb);
    });
  } else if (opaqueChildren != null && opaqueChildren !== false) {
    cb(opaqueChildren);
  }
}

function printChildren$2(flatChildren, print, indent, colors, opts) {
  return flatChildren.map(function (node) {
    if ((typeof node === 'undefined' ? 'undefined' : _typeof(node)) === 'object') {
      return print(node, print, indent, colors, opts);
    } else if (typeof node === 'string') {
      return colors.content.open + escapeHTML$2(node) + colors.content.close;
    } else {
      return print(node);
    }
  }).join(opts.edgeSpacing);
}

function printProps(props, print, indent, colors, opts) {
  return Object.keys(props).sort().map(function (name) {
    if (name === 'children') {
      return '';
    }

    var prop = props[name];
    var printed = print(prop);

    if (typeof prop !== 'string') {
      if (printed.indexOf('\n') !== -1) {
        printed = '{' + opts.edgeSpacing + indent(indent(printed) + opts.edgeSpacing + '}');
      } else {
        printed = '{' + printed + '}';
      }
    }

    return opts.spacing + indent(colors.prop.open + name + colors.prop.close + '=') + colors.value.open + printed + colors.value.close;
  }).join('');
}

var print$10 = function print$10(element, print, indent, opts, colors) {
  var result = colors.tag.open + '<';
  var elementName = void 0;
  if (typeof element.type === 'string') {
    elementName = element.type;
  } else if (typeof element.type === 'function') {
    elementName = element.type.displayName || element.type.name || 'Unknown';
  } else {
    elementName = 'Unknown';
  }
  result += elementName + colors.tag.close;
  result += printProps(element.props, print, indent, colors, opts);

  var opaqueChildren = element.props.children;
  var hasProps = !!Object.keys(element.props).filter(function (propName) {
    return propName !== 'children';
  }).length;
  var closeInNewLine = hasProps && !opts.min;

  if (opaqueChildren) {
    var flatChildren = [];
    traverseChildren(opaqueChildren, function (child) {
      flatChildren.push(child);
    });
    var children = printChildren$2(flatChildren, print, indent, colors, opts);
    result += colors.tag.open + (closeInNewLine ? '\n' : '') + '>' + colors.tag.close + opts.edgeSpacing + indent(children) + opts.edgeSpacing + colors.tag.open + '</' + elementName + '>' + colors.tag.close;
  } else {
    result += colors.tag.open + (closeInNewLine ? '\n' : ' ') + '/>' + colors.tag.close;
  }

  return result;
};

var test$9 = function test$9(object) {
  return object && object.$$typeof === reactElement;
};

var ReactElement$1 = { print: print$10, test: test$9 };

var escapeHTML$3 = escapeHTML_1; /**
                                               * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
                                               *
                                               * This source code is licensed under the BSD-style license found in the
                                               * LICENSE file in the root directory of this source tree. An additional grant
                                               * of patent rights can be found in the PATENTS file in the same directory.
                                               *
                                               * 
                                               */var reactTestInstance = Symbol.for('react.test.json');function printChildren$3(children, print, indent, colors, opts) {
  return children.map(function (child) {
    return printInstance(child, print, indent, colors, opts);
  }).join(opts.edgeSpacing);
}

function printProps$1(props, print, indent, colors, opts) {
  return Object.keys(props).sort().map(function (name) {
    var prop = props[name];
    var printed = print(prop);

    if (typeof prop !== 'string') {
      if (printed.indexOf('\n') !== -1) {
        printed = '{' + opts.edgeSpacing + indent(indent(printed) + opts.edgeSpacing + '}');
      } else {
        printed = '{' + printed + '}';
      }
    }

    return opts.spacing + indent(colors.prop.open + name + colors.prop.close + '=') + colors.value.open + printed + colors.value.close;
  }).join('');
}

function printInstance(instance, print, indent, colors, opts) {
  if (typeof instance == 'number') {
    return print(instance);
  } else if (typeof instance === 'string') {
    return colors.content.open + escapeHTML$3(instance) + colors.content.close;
  }

  var closeInNewLine = false;
  var result = colors.tag.open + '<' + instance.type + colors.tag.close;

  if (instance.props) {
    closeInNewLine = !!Object.keys(instance.props).length && !opts.min;
    result += printProps$1(instance.props, print, indent, colors, opts);
  }

  if (instance.children) {
    var children = printChildren$3(instance.children, print, indent, colors, opts);

    result += colors.tag.open + (closeInNewLine ? '\n' : '') + '>' + colors.tag.close + opts.edgeSpacing + indent(children) + opts.edgeSpacing + colors.tag.open + '</' + instance.type + '>' + colors.tag.close;
  } else {
    result += colors.tag.open + (closeInNewLine ? '\n' : ' ') + '/>' + colors.tag.close;
  }

  return result;
}

var print$11 = function print$11(val, print, indent, opts, colors) {
  return printInstance(val, print, indent, colors, opts);
};

var test$10 = function test$10(object) {
  return object && object.$$typeof === reactTestInstance;
};

var ReactTestComponent = { print: print$11, test: test$10 };

var style = index$26; /**
                                     * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
                                     *
                                     * This source code is licensed under the BSD-style license found in the
                                     * LICENSE file in the root directory of this source tree. An additional grant
                                     * of patent rights can be found in the PATENTS file in the same directory.
                                     *
                                     * 
                                     */

var toString = Object.prototype.toString;
var toISOString = Date.prototype.toISOString;
var errorToString = Error.prototype.toString;
var regExpToString = RegExp.prototype.toString;
var symbolToString = Symbol.prototype.toString;

var SYMBOL_REGEXP = /^Symbol\((.*)\)(.*)$/;
var NEWLINE_REGEXP = /\n/gi;

var getSymbols = Object.getOwnPropertySymbols || function (obj) {
  return [];
};

function isToStringedArrayType(toStringed) {
  return toStringed === '[object Array]' || toStringed === '[object ArrayBuffer]' || toStringed === '[object DataView]' || toStringed === '[object Float32Array]' || toStringed === '[object Float64Array]' || toStringed === '[object Int8Array]' || toStringed === '[object Int16Array]' || toStringed === '[object Int32Array]' || toStringed === '[object Uint8Array]' || toStringed === '[object Uint8ClampedArray]' || toStringed === '[object Uint16Array]' || toStringed === '[object Uint32Array]';
}

function printNumber$1(val) {
  if (val != +val) {
    return 'NaN';
  }
  var isNegativeZero = val === 0 && 1 / val < 0;
  return isNegativeZero ? '-0' : '' + val;
}

function printFunction(val, printFunctionName) {
  if (!printFunctionName) {
    return '[Function]';
  } else if (val.name === '') {
    return '[Function anonymous]';
  } else {
    return '[Function ' + val.name + ']';
  }
}

function printSymbol(val) {
  return symbolToString.call(val).replace(SYMBOL_REGEXP, 'Symbol($1)');
}

function printError(val) {
  return '[' + errorToString.call(val) + ']';
}

function printBasicValue(val, printFunctionName, escapeRegex) {
  if (val === true || val === false) {
    return '' + val;
  }
  if (val === undefined) {
    return 'undefined';
  }
  if (val === null) {
    return 'null';
  }

  var typeOf = typeof val === 'undefined' ? 'undefined' : _typeof(val);

  if (typeOf === 'number') {
    return printNumber$1(val);
  }
  if (typeOf === 'string') {
    return '"' + val.replace(/"|\\/g, '\\$&') + '"';
  }
  if (typeOf === 'function') {
    return printFunction(val, printFunctionName);
  }
  if (typeOf === 'symbol') {
    return printSymbol(val);
  }

  var toStringed = toString.call(val);

  if (toStringed === '[object WeakMap]') {
    return 'WeakMap {}';
  }
  if (toStringed === '[object WeakSet]') {
    return 'WeakSet {}';
  }
  if (toStringed === '[object Function]' || toStringed === '[object GeneratorFunction]') {
    return printFunction(val, printFunctionName);
  }
  if (toStringed === '[object Symbol]') {
    return printSymbol(val);
  }
  if (toStringed === '[object Date]') {
    return toISOString.call(val);
  }
  if (toStringed === '[object Error]') {
    return printError(val);
  }
  if (toStringed === '[object RegExp]') {
    if (escapeRegex) {
      // https://github.com/benjamingr/RegExp.escape/blob/master/polyfill.js
      return regExpToString.call(val).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    return regExpToString.call(val);
  }
  if (toStringed === '[object Arguments]' && val.length === 0) {
    return 'Arguments []';
  }
  if (isToStringedArrayType(toStringed) && val.length === 0) {
    return val.constructor.name + ' []';
  }

  if (val instanceof Error) {
    return printError(val);
  }

  return null;
}

function printList(list, indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors) {
  var body = '';

  if (list.length) {
    body += edgeSpacing;

    var innerIndent = prevIndent + indent;

    for (var i = 0; i < list.length; i++) {
      body += innerIndent + print(list[i], indent, innerIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors);

      if (i < list.length - 1) {
        body += ',' + spacing;
      }
    }

    body += (min ? '' : ',') + edgeSpacing + prevIndent;
  }

  return '[' + body + ']';
}

function printArguments(val, indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors) {
  return (min ? '' : 'Arguments ') + printList(val, indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors);
}

function printArray(val, indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors) {
  return (min ? '' : val.constructor.name + ' ') + printList(val, indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors);
}

function printMap(val, indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors) {
  var result = 'Map {';
  var iterator = val.entries();
  var current = iterator.next();

  if (!current.done) {
    result += edgeSpacing;

    var innerIndent = prevIndent + indent;

    while (!current.done) {
      var key = print(current.value[0], indent, innerIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors);

      var value = print(current.value[1], indent, innerIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors);

      result += innerIndent + key + ' => ' + value;

      current = iterator.next();

      if (!current.done) {
        result += ',' + spacing;
      }
    }

    result += (min ? '' : ',') + edgeSpacing + prevIndent;
  }

  return result + '}';
}

function printObject(val, indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors) {
  var constructor = min ? '' : val.constructor ? val.constructor.name + ' ' : 'Object ';
  var result = constructor + '{';
  var keys = Object.keys(val).sort();
  var symbols = getSymbols(val);

  if (symbols.length) {
    keys = keys.filter(function (key) {
      return (
        // $FlowFixMe string literal `symbol`. This value is not a valid `typeof` return value
        !((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'symbol' || toString.call(key) === '[object Symbol]')
      );
    }).concat(symbols);
  }

  if (keys.length) {
    result += edgeSpacing;

    var innerIndent = prevIndent + indent;

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var _name5 = print(key, indent, innerIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors);

      var value = print(val[key], indent, innerIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors);

      result += innerIndent + _name5 + ': ' + value;

      if (i < keys.length - 1) {
        result += ',' + spacing;
      }
    }

    result += (min ? '' : ',') + edgeSpacing + prevIndent;
  }

  return result + '}';
}

function printSet(val, indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors) {
  var result = 'Set {';
  var iterator = val.entries();
  var current = iterator.next();

  if (!current.done) {
    result += edgeSpacing;

    var innerIndent = prevIndent + indent;

    while (!current.done) {
      result += innerIndent + print(current.value[1], indent, innerIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors);

      current = iterator.next();

      if (!current.done) {
        result += ',' + spacing;
      }
    }

    result += (min ? '' : ',') + edgeSpacing + prevIndent;
  }

  return result + '}';
}

function printComplexValue(val, indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors) {
  refs = refs.slice();
  if (refs.indexOf(val) > -1) {
    return '[Circular]';
  } else {
    refs.push(val);
  }

  currentDepth++;

  var hitMaxDepth = currentDepth > maxDepth;

  if (callToJSON && !hitMaxDepth && val.toJSON && typeof val.toJSON === 'function') {
    return print(val.toJSON(), indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors);
  }

  var toStringed = toString.call(val);
  if (toStringed === '[object Arguments]') {
    return hitMaxDepth ? '[Arguments]' : printArguments(val, indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors);
  } else if (isToStringedArrayType(toStringed)) {
    return hitMaxDepth ? '[Array]' : printArray(val, indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors);
  } else if (toStringed === '[object Map]') {
    return hitMaxDepth ? '[Map]' : printMap(val, indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors);
  } else if (toStringed === '[object Set]') {
    return hitMaxDepth ? '[Set]' : printSet(val, indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors);
  }

  return hitMaxDepth ? '[Object]' : printObject(val, indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors);
}

function printPlugin(val, indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors) {
  var plugin = void 0;

  for (var p = 0; p < plugins.length; p++) {
    if (plugins[p].test(val)) {
      plugin = plugins[p];
      break;
    }
  }

  if (!plugin) {
    return null;
  }

  function boundPrint(val) {
    return print(val, indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors);
  }

  function boundIndent(str) {
    var indentation = prevIndent + indent;
    return indentation + str.replace(NEWLINE_REGEXP, '\n' + indentation);
  }

  var opts = {
    edgeSpacing: edgeSpacing,
    min: min,
    spacing: spacing };

  return plugin.print(val, boundPrint, boundIndent, opts, colors);
}

function print(val, indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors) {
  var pluginsResult = printPlugin(val, indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors);

  if (typeof pluginsResult === 'string') {
    return pluginsResult;
  }

  var basicResult = printBasicValue(val, printFunctionName, escapeRegex);
  if (basicResult !== null) {
    return basicResult;
  }

  return printComplexValue(val, indent, prevIndent, spacing, edgeSpacing, refs, maxDepth, currentDepth, plugins, min, callToJSON, printFunctionName, escapeRegex, colors);
}

var DEFAULTS = {
  callToJSON: true,
  edgeSpacing: '\n',
  escapeRegex: false,
  highlight: false,
  indent: 2,
  maxDepth: Infinity,
  min: false,
  plugins: [],
  printFunctionName: true,
  spacing: '\n',
  theme: {
    comment: 'gray',
    content: 'reset',
    prop: 'yellow',
    tag: 'cyan',
    value: 'green' } };

function validateOptions(opts) {
  Object.keys(opts).forEach(function (key) {
    if (!DEFAULTS.hasOwnProperty(key)) {
      throw new Error('pretty-format: Unknown option "' + key + '".');
    }
  });

  if (opts.min && opts.indent !== undefined && opts.indent !== 0) {
    throw new Error('pretty-format: Options "min" and "indent" cannot be used together.');
  }
}

function normalizeOptions$1(opts) {
  var result = {};

  Object.keys(DEFAULTS).forEach(function (key) {
    return result[key] = opts.hasOwnProperty(key) ? key === 'theme' ? normalizeTheme(opts.theme) : opts[key] : DEFAULTS[key];
  });

  if (result.min) {
    result.indent = 0;
  }

  // $FlowFixMe the type cast below means YOU are responsible to verify the code above.
  return result;
}

function normalizeTheme(themeOption) {
  if (!themeOption) {
    throw new Error('pretty-format: Option "theme" must not be null.');
  }

  if ((typeof themeOption === 'undefined' ? 'undefined' : _typeof(themeOption)) !== 'object') {
    throw new Error('pretty-format: Option "theme" must be of type "object" but instead received "' + (typeof themeOption === 'undefined' ? 'undefined' : _typeof(themeOption)) + '".');
  }

  // Silently ignore any keys in `theme` that are not in defaults.
  var themeRefined = themeOption;
  var themeDefaults = DEFAULTS.theme;
  return Object.keys(themeDefaults).reduce(function (theme, key) {
    theme[key] = Object.prototype.hasOwnProperty.call(themeOption, key) ? themeRefined[key] : themeDefaults[key];
    return theme;
  }, {});
}

function createIndent(indent) {
  return new Array(indent + 1).join(' ');
}

function prettyFormat$1(val, initialOptions) {
  var opts = void 0;
  if (!initialOptions) {
    opts = DEFAULTS;
  } else {
    validateOptions(initialOptions);
    opts = normalizeOptions$1(initialOptions);
  }

  var colors = {
    comment: { close: '', open: '' },
    content: { close: '', open: '' },
    prop: { close: '', open: '' },
    tag: { close: '', open: '' },
    value: { close: '', open: '' } };

  Object.keys(opts.theme).forEach(function (key) {
    if (opts.highlight) {
      var color = colors[key] = style[opts.theme[key]];
      if (!color || typeof color.close !== 'string' || typeof color.open !== 'string') {
        throw new Error('pretty-format: Option "theme" has a key "' + key + '" whose value "' + opts.theme[key] + '" is undefined in ansi-styles.');
      }
    }
  });

  var indent = void 0;
  var refs = void 0;
  var prevIndent = '';
  var currentDepth = 0;
  var spacing = opts.min ? ' ' : '\n';
  var edgeSpacing = opts.min ? '' : '\n';

  if (opts && opts.plugins.length) {
    indent = createIndent(opts.indent);
    refs = [];
    var pluginsResult = printPlugin(val, indent, prevIndent, spacing, edgeSpacing, refs, opts.maxDepth, currentDepth, opts.plugins, opts.min, opts.callToJSON, opts.printFunctionName, opts.escapeRegex, colors);

    if (typeof pluginsResult === 'string') {
      return pluginsResult;
    }
  }

  var basicResult = printBasicValue(val, opts.printFunctionName, opts.escapeRegex);

  if (basicResult !== null) {
    return basicResult;
  }

  if (!indent) {
    indent = createIndent(opts.indent);
  }
  if (!refs) {
    refs = [];
  }
  return printComplexValue(val, indent, prevIndent, spacing, edgeSpacing, refs, opts.maxDepth, currentDepth, opts.plugins, opts.min, opts.callToJSON, opts.printFunctionName, opts.escapeRegex, colors);
}

prettyFormat$1.plugins = {
  AsymmetricMatcher: AsymmetricMatcher$1,
  ConvertAnsi: ConvertAnsi,
  HTMLElement: HTMLElement$1,
  Immutable: ImmutablePlugins,
  ReactElement: ReactElement$1,
  ReactTestComponent: ReactTestComponent };

var index$24 = prettyFormat$1;

var chalk$1 = index$6;
var prettyFormat = index$24;var _require$plugins = index$24.plugins;var AsymmetricMatcher = _require$plugins.AsymmetricMatcher;var ReactElement = _require$plugins.ReactElement;var HTMLElement = _require$plugins.HTMLElement;var Immutable = _require$plugins.Immutable;

var PLUGINS = [AsymmetricMatcher, ReactElement, HTMLElement].concat(Immutable);

var EXPECTED_COLOR = chalk$1.green;
var EXPECTED_BG = chalk$1.bgGreen;
var RECEIVED_COLOR = chalk$1.red;
var RECEIVED_BG = chalk$1.bgRed;

var NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen'];

// get the type of a value with handling the edge cases like `typeof []`
// and `typeof null`
var getType$1 = function getType$1(value) {
  if (typeof value === 'undefined') {
    return 'undefined';
  } else if (value === null) {
    return 'null';
  } else if (Array.isArray(value)) {
    return 'array';
  } else if (typeof value === 'boolean') {
    return 'boolean';
  } else if (typeof value === 'function') {
    return 'function';
  } else if (typeof value === 'number') {
    return 'number';
  } else if (typeof value === 'string') {
    return 'string';
  } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
    if (value.constructor === RegExp) {
      return 'regexp';
    } else if (value.constructor === Map) {
      return 'map';
    } else if (value.constructor === Set) {
      return 'set';
    }
    return 'object';
    // $FlowFixMe https://github.com/facebook/flow/issues/1015
  } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'symbol') {
    return 'symbol';
  }

  throw new Error('value of unknown type: ' + value);
};

var stringify = function stringify(object) {
  var maxDepth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
  var MAX_LENGTH = 10000;
  var result = void 0;

  try {
    result = prettyFormat(object, {
      maxDepth: maxDepth,
      min: true,
      plugins: PLUGINS });
  } catch (e) {
    result = prettyFormat(object, {
      callToJSON: false,
      maxDepth: maxDepth,
      min: true,
      plugins: PLUGINS });
  }

  return result.length >= MAX_LENGTH && maxDepth > 1 ? stringify(object, Math.floor(maxDepth / 2)) : result;
};

var highlightTrailingWhitespace = function highlightTrailingWhitespace(text, bgColor) {
  return text.replace(/\s+$/gm, bgColor('$&'));
};

var printReceived = function printReceived(object) {
  return highlightTrailingWhitespace(RECEIVED_COLOR(stringify(object)), RECEIVED_BG);
};
var printExpected = function printExpected(value) {
  return highlightTrailingWhitespace(EXPECTED_COLOR(stringify(value)), EXPECTED_BG);
};

var printWithType = function printWithType(name, received, print) {
  var type = getType$1(received);
  return name + ':' + (type !== 'null' && type !== 'undefined' ? '\n  ' + type + ': ' : ' ') + print(received);
};

var ensureNoExpected = function ensureNoExpected(expected, matcherName) {
  matcherName || (matcherName = 'This');
  if (typeof expected !== 'undefined') {
    throw new Error(matcherHint('[.not]' + matcherName, undefined, '') + '\n\n' + 'Matcher does not accept any arguments.\n' + printWithType('Got', expected, printExpected));
  }
};

var ensureActualIsNumber = function ensureActualIsNumber(actual, matcherName) {
  matcherName || (matcherName = 'This matcher');
  if (typeof actual !== 'number') {
    throw new Error(matcherHint('[.not]' + matcherName) + '\n\n' + 'Received value must be a number.\n' + printWithType('Received', actual, printReceived));
  }
};

var ensureExpectedIsNumber = function ensureExpectedIsNumber(expected, matcherName) {
  matcherName || (matcherName = 'This matcher');
  if (typeof expected !== 'number') {
    throw new Error(matcherHint('[.not]' + matcherName) + '\n\n' + 'Expected value must be a number.\n' + printWithType('Got', expected, printExpected));
  }
};

var ensureNumbers = function ensureNumbers(actual, expected, matcherName) {
  ensureActualIsNumber(actual, matcherName);
  ensureExpectedIsNumber(expected, matcherName);
};

var pluralize = function pluralize(word, count) {
  return (NUMBERS[count] || count) + ' ' + word + (count === 1 ? '' : 's');
};

var matcherHint = function matcherHint(matcherName) {
  var received = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'received';var expected = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'expected';var options = arguments[3];
  var secondArgument = options && options.secondArgument;
  var isDirectExpectCall = options && options.isDirectExpectCall;
  return chalk$1.dim('expect' + (isDirectExpectCall ? '' : '(')) + RECEIVED_COLOR(received) + chalk$1.dim((isDirectExpectCall ? '' : ')') + matcherName + '(') + EXPECTED_COLOR(expected) + (secondArgument ? ', ' + EXPECTED_COLOR(secondArgument) : '') + chalk$1.dim(')');
};

var index$22 = {
  EXPECTED_BG: EXPECTED_BG,
  EXPECTED_COLOR: EXPECTED_COLOR,
  RECEIVED_BG: RECEIVED_BG,
  RECEIVED_COLOR: RECEIVED_COLOR,
  ensureActualIsNumber: ensureActualIsNumber,
  ensureExpectedIsNumber: ensureExpectedIsNumber,
  ensureNoExpected: ensureNoExpected,
  ensureNumbers: ensureNumbers,
  getType: getType$1,
  highlightTrailingWhitespace: highlightTrailingWhitespace,
  matcherHint: matcherHint,
  pluralize: pluralize,
  printExpected: printExpected,
  printReceived: printReceived,
  printWithType: printWithType,
  stringify: stringify };

/* eslint-disable no-nested-ternary */
var arr = [];
var charCodeCache = [];

var index$32 = function index$32(a, b) {
  if (a === b) {
    return 0;
  }

  var swap = a;

  // Swapping the strings if `a` is longer than `b` so we know which one is the
  // shortest & which one is the longest
  if (a.length > b.length) {
    a = b;
    b = swap;
  }

  var aLen = a.length;
  var bLen = b.length;

  if (aLen === 0) {
    return bLen;
  }

  if (bLen === 0) {
    return aLen;
  }

  // Performing suffix trimming:
  // We can linearly drop suffix common to both strings since they
  // don't increase distance at all
  // Note: `~-` is the bitwise way to perform a `- 1` operation
  while (aLen > 0 && a.charCodeAt(~-aLen) === b.charCodeAt(~-bLen)) {
    aLen--;
    bLen--;
  }

  if (aLen === 0) {
    return bLen;
  }

  // Performing prefix trimming
  // We can linearly drop prefix common to both strings since they
  // don't increase distance at all
  var start = 0;

  while (start < aLen && a.charCodeAt(start) === b.charCodeAt(start)) {
    start++;
  }

  aLen -= start;
  bLen -= start;

  if (aLen === 0) {
    return bLen;
  }

  var bCharCode;
  var ret;
  var tmp;
  var tmp2;
  var i = 0;
  var j = 0;

  while (i < aLen) {
    charCodeCache[start + i] = a.charCodeAt(start + i);
    arr[i] = ++i;
  }

  while (j < bLen) {
    bCharCode = b.charCodeAt(start + j);
    tmp = j++;
    ret = j;

    for (i = 0; i < aLen; i++) {
      tmp2 = bCharCode === charCodeCache[start + i] ? tmp : tmp + 1;
      tmp = arr[i];
      ret = arr[i] = tmp > ret ? tmp2 > ret ? ret + 1 : tmp2 : tmp2 > tmp ? tmp + 1 : tmp2;
    }
  }

  return ret;
};

var chalk$2 = index$6;
var BULLET = chalk$2.bold('\u25CF');
var DEPRECATION = BULLET + ' Deprecation Warning';
var ERROR$1 = BULLET + ' Validation Error';
var WARNING = BULLET + ' Validation Warning';

var format$2 = function format$2(value) {
  return typeof value === 'function' ? value.toString() : index$24(value, { min: true });
};

var ValidationError$1 = function (_Error) {
  _inherits(ValidationError$1, _Error);

  function ValidationError$1(name, message, comment) {
    _classCallCheck(this, ValidationError$1);

    var _this4 = _possibleConstructorReturn(this, (ValidationError$1.__proto__ || Object.getPrototypeOf(ValidationError$1)).call(this));

    comment = comment ? '\n\n' + comment : '\n';
    _this4.name = '';
    _this4.stack = '';
    _this4.message = chalk$2.red(chalk$2.bold(name) + ':\n\n' + message + comment);
    Error.captureStackTrace(_this4, function () {});
    return _this4;
  }

  return ValidationError$1;
}(Error);

var logValidationWarning = function logValidationWarning(name, message, comment) {
  comment = comment ? '\n\n' + comment : '\n';
  console.warn(chalk$2.yellow(chalk$2.bold(name) + ':\n\n' + message + comment));
};

var createDidYouMeanMessage = function createDidYouMeanMessage(unrecognized, allowedOptions) {
  var leven = index$32;
  var suggestion = allowedOptions.find(function (option) {
    var steps = leven(option, unrecognized);
    return steps < 3;
  });

  return suggestion ? 'Did you mean ' + chalk$2.bold(format$2(suggestion)) + '?' : '';
};

var utils$2 = {
  DEPRECATION: DEPRECATION,
  ERROR: ERROR$1,
  ValidationError: ValidationError$1,
  WARNING: WARNING,
  createDidYouMeanMessage: createDidYouMeanMessage,
  format: format$2,
  logValidationWarning: logValidationWarning };

var chalk = index$6; /**
                               * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
                               *
                               * This source code is licensed under the BSD-style license found in the
                               * LICENSE file in the root directory of this source tree. An additional grant
                               * of patent rights can be found in the PATENTS file in the same directory.
                               *
                               * 
                               */var _require = index$22;var getType = _require.getType;var _require2 = utils$2;var format$1 = _require2.format;var ValidationError = _require2.ValidationError;var ERROR = _require2.ERROR;var errorMessage = function errorMessage(option, received, defaultValue, options) {
  var message = '  Option ' + chalk.bold('"' + option + '"') + ' must be of type:\n    ' + chalk.bold.green(getType(defaultValue)) + '\n  but instead received:\n    ' + chalk.bold.red(getType(received)) + '\n\n  Example:\n  {\n    ' + chalk.bold('"' + option + '"') + ': ' + chalk.bold(format$1(defaultValue)) + '\n  }';

  var comment = options.comment;
  var name = options.title && options.title.error || ERROR;

  throw new ValidationError(name, message, comment);
};

var errors = {
  ValidationError: ValidationError,
  errorMessage: errorMessage };

var _require$2 = utils$2;var logValidationWarning$1 = _require$2.logValidationWarning;var DEPRECATION$2 = _require$2.DEPRECATION; /**
                                                                                                                                  * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
                                                                                                                                  *
                                                                                                                                  * This source code is licensed under the BSD-style license found in the
                                                                                                                                  * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                  * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                  *
                                                                                                                                  * 
                                                                                                                                  */var deprecationMessage = function deprecationMessage(message, options) {
  var comment = options.comment;var name = options.title && options.title.deprecation || DEPRECATION$2;logValidationWarning$1(name, message, comment);
};
var deprecationWarning$1 = function deprecationWarning$1(config, option, deprecatedOptions, options) {
  if (option in deprecatedOptions) {
    deprecationMessage(deprecatedOptions[option](config), options);

    return true;
  }

  return false;
};

var deprecated = {
  deprecationWarning: deprecationWarning$1 };

var chalk$3 = index$6; /**
                               * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
                               *
                               * This source code is licensed under the BSD-style license found in the
                               * LICENSE file in the root directory of this source tree. An additional grant
                               * of patent rights can be found in the PATENTS file in the same directory.
                               *
                               * 
                               */var _require$3 = utils$2;var format$3 = _require$3.format;var logValidationWarning$2 = _require$3.logValidationWarning;var createDidYouMeanMessage$1 = _require$3.createDidYouMeanMessage;var WARNING$2 = _require$3.WARNING;var unknownOptionWarning$1 = function unknownOptionWarning$1(config, exampleConfig, option, options) {
  var didYouMean = createDidYouMeanMessage$1(option, Object.keys(exampleConfig));

  var message = '  Unknown option ' + chalk$3.bold('"' + option + '"') + ' with value ' + chalk$3.bold(format$3(config[option])) + ' was found.' + (didYouMean && ' ' + didYouMean) + '\n  This is probably a typing mistake. Fixing it will remove this message.';

  var comment = options.comment;
  var name = options.title && options.title.warning || WARNING$2;

  logValidationWarning$2(name, message, comment);
};

var warnings = {
  unknownOptionWarning: unknownOptionWarning$1 };

var config = {
  comment: '  A comment',
  condition: function condition(option, validOption) {
    return true;
  },
  deprecate: function deprecate(config, option, deprecatedOptions, options) {
    return false;
  },
  deprecatedConfig: {
    key: function key(config) {} },

  error: function error(option, received, defaultValue, options) {},
  exampleConfig: { key: 'value', test: 'case' },
  title: {
    deprecation: 'Deprecation Warning',
    error: 'Validation Error',
    warning: 'Validation Warning' },

  unknown: function unknown(config, option, options) {} }; /**
                                                            * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
                                                            *
                                                            * This source code is licensed under the BSD-style license found in the
                                                            * LICENSE file in the root directory of this source tree. An additional grant
                                                            * of patent rights can be found in the PATENTS file in the same directory.
                                                            *
                                                            * 
                                                            */var exampleConfig$2 = config;

var toString$1 = Object.prototype.toString;

var validationCondition$1 = function validationCondition$1(option, validOption) {
  return option === null || option === undefined || toString$1.call(option) === toString$1.call(validOption);
};

var condition = validationCondition$1;

var _require$1 = deprecated;var deprecationWarning = _require$1.deprecationWarning; /**
                                                                                                * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
                                                                                                *
                                                                                                * This source code is licensed under the BSD-style license found in the
                                                                                                * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                *
                                                                                                * 
                                                                                                */var _require2$1 = warnings;var unknownOptionWarning = _require2$1.unknownOptionWarning;var _require3 = errors;var errorMessage$1 = _require3.errorMessage;var exampleConfig$1 = exampleConfig$2;var validationCondition = condition;var _require4 = utils$2;var ERROR$2 = _require4.ERROR;var DEPRECATION$1 = _require4.DEPRECATION;var WARNING$1 = _require4.WARNING;var defaultConfig$1 = { comment: '',
  condition: validationCondition,
  deprecate: deprecationWarning,
  deprecatedConfig: {},
  error: errorMessage$1,
  exampleConfig: exampleConfig$1,
  title: {
    deprecation: DEPRECATION$1,
    error: ERROR$2,
    warning: WARNING$1 },

  unknown: unknownOptionWarning };

var defaultConfig = defaultConfig$1; /**
                                                 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
                                                 *
                                                 * This source code is licensed under the BSD-style license found in the
                                                 * LICENSE file in the root directory of this source tree. An additional grant
                                                 * of patent rights can be found in the PATENTS file in the same directory.
                                                 *
                                                 * 
                                                 */var _validate = function _validate(config, options) {
  var hasDeprecationWarnings = false;for (var key in config) {
    if (options.deprecatedConfig && key in options.deprecatedConfig && typeof options.deprecate === 'function') {
      var isDeprecatedKey = options.deprecate(config, key, options.deprecatedConfig, options);

      hasDeprecationWarnings = hasDeprecationWarnings || isDeprecatedKey;
    } else if (hasOwnProperty.call(options.exampleConfig, key)) {
      if (typeof options.condition === 'function' && typeof options.error === 'function' && !options.condition(config[key], options.exampleConfig[key])) {
        options.error(key, config[key], options.exampleConfig[key], options);
      }
    } else {
      options.unknown && options.unknown(config, options.exampleConfig, key, options);
    }
  }

  return { hasDeprecationWarnings: hasDeprecationWarnings };
};

var validate$1 = function validate$1(config, options) {
  _validate(options, defaultConfig); // validate against jest-validate config

  var defaultedOptions = Object.assign({}, defaultConfig, options, { title: Object.assign({}, defaultConfig.title, options.title) });var _validate2 = _validate(config, defaultedOptions);var hasDeprecationWarnings = _validate2.hasDeprecationWarnings;

  return {
    hasDeprecationWarnings: hasDeprecationWarnings,
    isValid: true };
};

var validate_1 = validate$1;

var index$20 = {
  ValidationError: errors.ValidationError,
  createDidYouMeanMessage: utils$2.createDidYouMeanMessage,
  format: utils$2.format,
  logValidationWarning: utils$2.logValidationWarning,
  validate: validate_1 };

var deprecated$2 = {
  useFlowParser: function useFlowParser(config) {
    return '  The ' + '"useFlowParser"' + ' option is deprecated. Use ' + '"parser"' + ' instead.\n\n  Prettier now treats your configuration as:\n  {\n    ' + '"parser"' + ': ' + (config.useFlowParser ? '"flow"' : '"babylon"') + '\n  }';
  }
};

var deprecated_1 = deprecated$2;

var validate = index$20.validate;
var deprecatedConfig = deprecated_1;

var defaults = {
  cursorOffset: -1,
  rangeStart: 0,
  rangeEnd: Infinity,
  useTabs: false,
  tabWidth: 2,
  printWidth: 80,
  singleQuote: false,
  trailingComma: "none",
  bracketSpacing: true,
  jsxBracketSameLine: false,
  parser: "babylon",
  semi: true
};

var exampleConfig = Object.assign({}, defaults, {
  filepath: "path/to/Filename",
  printWidth: 80,
  originalText: "text"
});

// Copy options and fill in default values.
function normalize(options) {
  var normalized = Object.assign({}, options || {});
  var filepath = normalized.filepath;

  if (/\.(css|less|scss)$/.test(filepath)) {
    normalized.parser = "postcss";
  } else if (/\.html$/.test(filepath)) {
    normalized.parser = "parse5";
  } else if (/\.(ts|tsx)$/.test(filepath)) {
    normalized.parser = "typescript";
  } else if (/\.graphql$/.test(filepath)) {
    normalized.parser = "graphql";
  } else if (/\.json$/.test(filepath)) {
    normalized.parser = "json";
    normalized.trailingComma = "none";
  }

  if (typeof normalized.trailingComma === "boolean") {
    // Support a deprecated boolean type for the trailing comma config
    // for a few versions. This code can be removed later.
    normalized.trailingComma = "es5";

    console.warn("Warning: `trailingComma` without any argument is deprecated. " + 'Specify "none", "es5", or "all".');
  }

  var parserBackup = normalized.parser;
  if (typeof normalized.parser === "function") {
    // Delete the function from the object to pass validation.
    delete normalized.parser;
  }

  validate(normalized, { exampleConfig: exampleConfig, deprecatedConfig: deprecatedConfig });

  // Restore the option back to a function;
  normalized.parser = parserBackup;

  // For backward compatibility. Deprecated in 0.0.10
  if ("useFlowParser" in normalized) {
    normalized.parser = normalized.useFlowParser ? "flow" : "babylon";
    delete normalized.useFlowParser;
  }

  Object.keys(defaults).forEach(function (k) {
    if (normalized[k] == null) {
      normalized[k] = defaults[k];
    }
  });

  return normalized;
}

var options = { normalize: normalize };

function flattenDoc(doc) {
  if (doc.type === "concat") {
    var res = [];

    for (var i = 0; i < doc.parts.length; ++i) {
      var doc2 = doc.parts[i];
      if (typeof doc2 !== "string" && doc2.type === "concat") {
        [].push.apply(res, flattenDoc(doc2).parts);
      } else {
        var flattened = flattenDoc(doc2);
        if (flattened !== "") {
          res.push(flattened);
        }
      }
    }

    return Object.assign({}, doc, { parts: res });
  } else if (doc.type === "if-break") {
    return Object.assign({}, doc, {
      breakContents: doc.breakContents != null ? flattenDoc(doc.breakContents) : null,
      flatContents: doc.flatContents != null ? flattenDoc(doc.flatContents) : null
    });
  } else if (doc.type === "group") {
    return Object.assign({}, doc, {
      contents: flattenDoc(doc.contents),
      expandedStates: doc.expandedStates ? doc.expandedStates.map(flattenDoc) : doc.expandedStates
    });
  } else if (doc.contents) {
    return Object.assign({}, doc, { contents: flattenDoc(doc.contents) });
  }
  return doc;
}

function printDoc(doc) {
  if (typeof doc === "string") {
    return JSON.stringify(doc);
  }

  if (doc.type === "line") {
    if (doc.literalline) {
      return "literalline";
    }
    if (doc.hard) {
      return "hardline";
    }
    if (doc.soft) {
      return "softline";
    }
    return "line";
  }

  if (doc.type === "break-parent") {
    return "breakParent";
  }

  if (doc.type === "concat") {
    return "[" + doc.parts.map(printDoc).join(", ") + "]";
  }

  if (doc.type === "indent") {
    return "indent(" + printDoc(doc.contents) + ")";
  }

  if (doc.type === "align") {
    return "align(" + doc.n + ", " + printDoc(doc.contents) + ")";
  }

  if (doc.type === "if-break") {
    return "ifBreak(" + printDoc(doc.breakContents) + (doc.flatContents ? ", " + printDoc(doc.flatContents) : "") + ")";
  }

  if (doc.type === "group") {
    if (doc.expandedStates) {
      return "conditionalGroup(" + "[" + doc.expandedStates.map(printDoc).join(",") + "])";
    }

    return (doc.break ? "wrappedGroup" : "group") + "(" + printDoc(doc.contents) + ")";
  }

  if (doc.type === "fill") {
    return "fill" + "(" + doc.parts.map(printDoc).join(", ") + ")";
  }

  if (doc.type === "line-suffix") {
    return "lineSuffix(" + printDoc(doc.contents) + ")";
  }

  if (doc.type === "line-suffix-boundary") {
    return "lineSuffixBoundary";
  }

  throw new Error("Unknown doc type " + doc.type);
}

var docDebug = {
  printDocToDebug: function printDocToDebug(doc) {
    return printDoc(flattenDoc(doc));
  }
};

var require$$1$12 = _package$1 && _package$1['default'] || _package$1;

var comments = comments$1;
var version = require$$1$12.version;
var printAstToDoc = printer.printAstToDoc;
var util = util$2;
var _printDocToString = docPrinter.printDocToString;
var normalizeOptions = options.normalize;
var parser = parser$1;
var printDocToDebug = docDebug.printDocToDebug;

function guessLineEnding(text) {
  var index = text.indexOf("\n");
  if (index >= 0 && text.charAt(index - 1) === "\r") {
    return "\r\n";
  }
  return "\n";
}

function attachComments(text, ast, opts) {
  var astComments = ast.comments;
  if (astComments) {
    delete ast.comments;
    comments.attach(astComments, ast, text, opts);
  }
  ast.tokens = [];
  opts.originalText = text.trimRight();
  return astComments;
}

function ensureAllCommentsPrinted(astComments) {
  if (!astComments) {
    return;
  }

  for (var i = 0; i < astComments.length; ++i) {
    if (astComments[i].value.trim() === "prettier-ignore") {
      // If there's a prettier-ignore, we're not printing that sub-tree so we
      // don't know if the comments was printed or not.
      return;
    }
  }

  astComments.forEach(function (comment) {
    if (!comment.printed) {
      throw new Error('Comment "' + comment.value.trim() + '" was not printed. Please report this error!');
    }
    delete comment.printed;
  });
}

function _formatWithCursor(text, opts, addAlignmentSize) {
  addAlignmentSize = addAlignmentSize || 0;

  var ast = parser.parse(text, opts);

  var formattedRangeOnly = formatRange(text, opts, ast);
  if (formattedRangeOnly) {
    return { formatted: formattedRangeOnly };
  }

  var cursorOffset = void 0;
  if (opts.cursorOffset >= 0) {
    var cursorNodeAndParents = findNodeAtOffset(ast, opts.cursorOffset);
    var cursorNode = cursorNodeAndParents.node;
    if (cursorNode) {
      cursorOffset = opts.cursorOffset - util.locStart(cursorNode);
      opts.cursorNode = cursorNode;
    }
  }

  var astComments = attachComments(text, ast, opts);
  var doc = printAstToDoc(ast, opts, addAlignmentSize);
  opts.newLine = guessLineEnding(text);
  var toStringResult = _printDocToString(doc, opts);
  var str = toStringResult.formatted;
  var cursorOffsetResult = toStringResult.cursor;
  ensureAllCommentsPrinted(astComments);
  // Remove extra leading indentation as well as the added indentation after last newline
  if (addAlignmentSize > 0) {
    return { formatted: str.trim() + opts.newLine };
  }

  if (cursorOffset !== undefined) {
    return {
      formatted: str,
      cursorOffset: cursorOffsetResult + cursorOffset
    };
  }

  return { formatted: str };
}

function _format(text, opts, addAlignmentSize) {
  return _formatWithCursor(text, opts, addAlignmentSize).formatted;
}

function findSiblingAncestors(startNodeAndParents, endNodeAndParents) {
  var resultStartNode = startNodeAndParents.node;
  var resultEndNode = endNodeAndParents.node;

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = endNodeAndParents.parentNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var endParent = _step2.value;

      if (endParent.type !== "Program" && endParent.type !== "File" && util.locStart(endParent) >= util.locStart(startNodeAndParents.node)) {
        resultEndNode = endParent;
      } else {
        break;
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = startNodeAndParents.parentNodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var startParent = _step3.value;

      if (startParent.type !== "Program" && startParent.type !== "File" && util.locEnd(startParent) <= util.locEnd(endNodeAndParents.node)) {
        resultStartNode = startParent;
      } else {
        break;
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  return {
    startNode: resultStartNode,
    endNode: resultEndNode
  };
}

function findNodeAtOffset(node, offset, predicate, parentNodes) {
  predicate = predicate || function () {
    return true;
  };
  parentNodes = parentNodes || [];
  var start = util.locStart(node);
  var end = util.locEnd(node);
  if (start <= offset && offset <= end) {
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = comments.getSortedChildNodes(node)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var childNode = _step4.value;

        var childResult = findNodeAtOffset(childNode, offset, predicate, [node].concat(parentNodes));
        if (childResult) {
          return childResult;
        }
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    if (predicate(node)) {
      return {
        node: node,
        parentNodes: parentNodes
      };
    }
  }
}

// See https://www.ecma-international.org/ecma-262/5.1/#sec-A.5
function isSourceElement(node) {
  if (node == null) {
    return false;
  }
  switch (node.type) {
    case "FunctionDeclaration":
    case "BlockStatement":
    case "BreakStatement":
    case "ContinueStatement":
    case "DebuggerStatement":
    case "DoWhileStatement":
    case "EmptyStatement":
    case "ExpressionStatement":
    case "ForInStatement":
    case "ForStatement":
    case "IfStatement":
    case "LabeledStatement":
    case "ReturnStatement":
    case "SwitchStatement":
    case "ThrowStatement":
    case "TryStatement":
    case "VariableDeclaration":
    case "WhileStatement":
    case "WithStatement":
    case "ClassDeclaration": // ES 2015
    case "ImportDeclaration": // Module
    case "ExportDefaultDeclaration": // Module
    case "ExportNamedDeclaration": // Module
    case "ExportAllDeclaration": // Module
    case "TypeAlias": // Flow
    case "InterfaceDeclaration": // Flow, Typescript
    case "TypeAliasDeclaration": // Typescript
    case "ExportAssignment": // Typescript
    case "ExportDeclaration":
      // Typescript
      return true;
  }
  return false;
}

function calculateRange(text, opts, ast) {
  // Contract the range so that it has non-whitespace characters at its endpoints.
  // This ensures we can format a range that doesn't end on a node.
  var rangeStringOrig = text.slice(opts.rangeStart, opts.rangeEnd);
  var startNonWhitespace = Math.max(opts.rangeStart + rangeStringOrig.search(/\S/), opts.rangeStart);
  var endNonWhitespace = void 0;
  for (endNonWhitespace = opts.rangeEnd; endNonWhitespace > opts.rangeStart; --endNonWhitespace) {
    if (text[endNonWhitespace - 1].match(/\S/)) {
      break;
    }
  }

  var startNodeAndParents = findNodeAtOffset(ast, startNonWhitespace, isSourceElement);
  var endNodeAndParents = findNodeAtOffset(ast, endNonWhitespace, isSourceElement);

  if (!startNodeAndParents || !endNodeAndParents) {
    return {
      rangeStart: 0,
      rangeEnd: 0
    };
  }

  var siblingAncestors = findSiblingAncestors(startNodeAndParents, endNodeAndParents);
  var startNode = siblingAncestors.startNode;
  var endNode = siblingAncestors.endNode;
  var rangeStart = Math.min(util.locStart(startNode), util.locStart(endNode));
  var rangeEnd = Math.max(util.locEnd(startNode), util.locEnd(endNode));

  return {
    rangeStart: rangeStart,
    rangeEnd: rangeEnd
  };
}

function formatRange(text, opts, ast) {
  if (0 < opts.rangeStart || opts.rangeEnd < text.length) {
    var range = calculateRange(text, opts, ast);
    var rangeStart = range.rangeStart;
    var rangeEnd = range.rangeEnd;
    var rangeString = text.slice(rangeStart, rangeEnd);

    // Try to extend the range backwards to the beginning of the line.
    // This is so we can detect indentation correctly and restore it.
    // Use `Math.min` since `lastIndexOf` returns 0 when `rangeStart` is 0
    var rangeStart2 = Math.min(rangeStart, text.lastIndexOf("\n", rangeStart) + 1);
    var indentString = text.slice(rangeStart2, rangeStart);

    var alignmentSize = util.getAlignmentSize(indentString, opts.tabWidth);

    var rangeFormatted = _format(rangeString, Object.assign({}, opts, {
      rangeStart: 0,
      rangeEnd: Infinity,
      printWidth: opts.printWidth - alignmentSize
    }), alignmentSize);

    // Since the range contracts to avoid trailing whitespace,
    // we need to remove the newline that was inserted by the `format` call.
    var rangeTrimmed = rangeFormatted.trimRight();

    return text.slice(0, rangeStart) + rangeTrimmed + text.slice(rangeEnd);
  }
}

var index = {
  formatWithCursor: function formatWithCursor(text, opts) {
    return _formatWithCursor(text, normalizeOptions(opts));
  },
  format: function format(text, opts) {
    return _format(text, normalizeOptions(opts));
  },
  check: function check(text, opts) {
    try {
      var formatted = _format(text, normalizeOptions(opts));
      return formatted === text;
    } catch (e) {
      return false;
    }
  },
  version: version,
  __debug: {
    parse: function parse(text, opts) {
      return parser.parse(text, opts);
    },
    formatAST: function formatAST(ast, opts) {
      opts = normalizeOptions(opts);
      var doc = printAstToDoc(ast, opts);
      var str = _printDocToString(doc, opts);
      return str;
    },
    // Doesn't handle shebang for now
    formatDoc: function formatDoc(doc, opts) {
      opts = normalizeOptions(opts);
      var debug = printDocToDebug(doc);
      var str = _format(debug, opts);
      return str;
    },
    printToDoc: function printToDoc(text, opts) {
      opts = normalizeOptions(opts);
      var ast = parser.parse(text, opts);
      attachComments(text, ast, opts);
      var doc = printAstToDoc(ast, opts);
      return doc;
    },
    printDocToString: function printDocToString(doc, opts) {
      opts = normalizeOptions(opts);
      var str = _printDocToString(doc, opts);
      return str;
    }
  }
};

module.exports = index;
