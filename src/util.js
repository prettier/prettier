"use strict";

const stringWidth = require("string-width");
const emojiRegex = require("emoji-regex")();
const escapeStringRegexp = require("escape-string-regexp");
const getCjkRegex = require("cjk-regex");
const getUnicodeRegex = require("unicode-regex");

const cjkPattern = getCjkRegex().source;

// http://spec.commonmark.org/0.25/#ascii-punctuation-character
const asciiPunctuationCharRange = escapeStringRegexp(
  "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"
);

// http://spec.commonmark.org/0.25/#punctuation-character
const punctuationCharRange = `${asciiPunctuationCharRange}${getUnicodeRegex([
  "Pc",
  "Pd",
  "Pe",
  "Pf",
  "Pi",
  "Po",
  "Ps"
]).source.slice(1, -1)}`; // remove bracket expression `[` and `]`

const punctuationRegex = new RegExp(`[${punctuationCharRange}]`);

function isExportDeclaration(node) {
  if (node) {
    switch (node.type) {
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

function getParentExportDeclaration(path) {
  const parentNode = path.getParentNode();
  if (path.getName() === "declaration" && isExportDeclaration(parentNode)) {
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
  return (text, index, opts) => {
    const backwards = opts && opts.backwards;

    // Allow `skip` functions to be threaded together without having
    // to check for failures (did someone say monads?).
    if (index === false) {
      return false;
    }

    const length = text.length;
    let cursor = index;
    while (cursor >= 0 && cursor < length) {
      const c = text.charAt(cursor);
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

const skipWhitespace = skip(/\s/);
const skipSpaces = skip(" \t");
const skipToLineEnd = skip(",; \t");
const skipEverythingButNewLine = skip(/[^\r\n]/);

function skipInlineComment(text, index) {
  if (index === false) {
    return false;
  }

  if (text.charAt(index) === "/" && text.charAt(index + 1) === "*") {
    for (let i = index + 2; i < text.length; ++i) {
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
  const backwards = opts && opts.backwards;
  if (index === false) {
    return false;
  }

  const atIndex = text.charAt(index);
  if (backwards) {
    if (text.charAt(index - 1) === "\r" && atIndex === "\n") {
      return index - 2;
    }
    if (
      atIndex === "\n" ||
      atIndex === "\r" ||
      atIndex === "\u2028" ||
      atIndex === "\u2029"
    ) {
      return index - 1;
    }
  } else {
    if (atIndex === "\r" && text.charAt(index + 1) === "\n") {
      return index + 2;
    }
    if (
      atIndex === "\n" ||
      atIndex === "\r" ||
      atIndex === "\u2028" ||
      atIndex === "\u2029"
    ) {
      return index + 1;
    }
  }

  return index;
}

function hasNewline(text, index, opts) {
  opts = opts || {};
  const idx = skipSpaces(text, opts.backwards ? index - 1 : index, opts);
  const idx2 = skipNewline(text, idx, opts);
  return idx !== idx2;
}

function hasNewlineInRange(text, start, end) {
  for (let i = start; i < end; ++i) {
    if (text.charAt(i) === "\n") {
      return true;
    }
  }
  return false;
}

// Note: this function doesn't ignore leading comments unlike isNextLineEmpty
function isPreviousLineEmpty(text, node) {
  let idx = locStart(node) - 1;
  idx = skipSpaces(text, idx, { backwards: true });
  idx = skipNewline(text, idx, { backwards: true });
  idx = skipSpaces(text, idx, { backwards: true });
  const idx2 = skipNewline(text, idx, { backwards: true });
  return idx !== idx2;
}

function isNextLineEmptyAfterIndex(text, index) {
  let oldIdx = null;
  let idx = index;
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

function isNextLineEmpty(text, node) {
  return isNextLineEmptyAfterIndex(text, locEnd(node));
}

function getNextNonSpaceNonCommentCharacterIndex(text, node) {
  let oldIdx = null;
  let idx = locEnd(node);
  while (idx !== oldIdx) {
    oldIdx = idx;
    idx = skipSpaces(text, idx);
    idx = skipInlineComment(text, idx);
    idx = skipTrailingComment(text, idx);
    idx = skipNewline(text, idx);
  }
  return idx;
}

function getNextNonSpaceNonCommentCharacter(text, node) {
  return text.charAt(getNextNonSpaceNonCommentCharacterIndex(text, node));
}

function hasSpaces(text, index, opts) {
  opts = opts || {};
  const idx = skipSpaces(text, opts.backwards ? index - 1 : index, opts);
  return idx !== index;
}

function locStart(node) {
  // Handle nodes with decorators. They should start at the first decorator
  if (
    node.declaration &&
    node.declaration.decorators &&
    node.declaration.decorators.length > 0
  ) {
    return locStart(node.declaration.decorators[0]);
  }
  if (node.decorators && node.decorators.length > 0) {
    return locStart(node.decorators[0]);
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

function locEnd(node) {
  const endNode = node.nodes && getLast(node.nodes);
  if (endNode && node.source && !node.source.end) {
    node = endNode;
  }

  let loc;
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
    return Math.max(loc, locEnd(node.typeAnnotation));
  }

  if (node.loc && !loc) {
    return node.loc.end;
  }

  return loc;
}

// Super inefficient, needs to be cached.
function lineColumnToIndex(lineColumn, text) {
  let index = 0;
  for (let i = 0; i < lineColumn.line - 1; ++i) {
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

const PRECEDENCE = {};
[
  ["|>"],
  ["||", "??"],
  ["&&"],
  ["|"],
  ["^"],
  ["&"],
  ["==", "===", "!=", "!=="],
  ["<", ">", "<=", ">=", "in", "instanceof"],
  [">>", "<<", ">>>"],
  ["+", "-"],
  ["*", "/", "%"],
  ["**"]
].forEach((tier, i) => {
  tier.forEach(op => {
    PRECEDENCE[op] = i;
  });
});

function getPrecedence(op) {
  return PRECEDENCE[op];
}

const equalityOperators = {
  "==": true,
  "!=": true,
  "===": true,
  "!==": true
};
const multiplicativeOperators = {
  "*": true,
  "/": true,
  "%": true
};
const bitshiftOperators = {
  ">>": true,
  ">>>": true,
  "<<": true
};

function shouldFlatten(parentOp, nodeOp) {
  if (getPrecedence(nodeOp) !== getPrecedence(parentOp)) {
    return false;
  }

  // ** is right-associative
  // x ** y ** z --> x ** (y ** z)
  if (parentOp === "**") {
    return false;
  }

  // x == y == z --> (x == y) == z
  if (equalityOperators[parentOp] && equalityOperators[nodeOp]) {
    return false;
  }

  // x * y % z --> (x * y) % z
  if (
    (nodeOp === "%" && multiplicativeOperators[parentOp]) ||
    (parentOp === "%" && multiplicativeOperators[nodeOp])
  ) {
    return false;
  }

  // x << y << z --> (x << y) << z
  if (bitshiftOperators[parentOp] && bitshiftOperators[nodeOp]) {
    return false;
  }

  return true;
}

function isBitwiseOperator(operator) {
  return (
    !!bitshiftOperators[operator] ||
    operator === "|" ||
    operator === "^" ||
    operator === "&"
  );
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
      return (
        !node.prefix &&
        startsWithNoLookaheadToken(node.argument, forbidFunctionAndClass)
      );
    case "BindExpression":
      return (
        node.object &&
        startsWithNoLookaheadToken(node.object, forbidFunctionAndClass)
      );
    case "SequenceExpression":
      return startsWithNoLookaheadToken(
        node.expressions[0],
        forbidFunctionAndClass
      );
    case "TSAsExpression":
      return startsWithNoLookaheadToken(
        node.expression,
        forbidFunctionAndClass
      );
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

function hasClosureCompilerTypeCastComment(text, node) {
  // https://github.com/google/closure-compiler/wiki/Annotating-Types#type-casts
  // Syntax example: var x = /** @type {string} */ (fruit);
  return (
    node.comments &&
    node.comments.some(
      comment =>
        comment.leading &&
        isBlockComment(comment) &&
        comment.value.match(/^\*\s*@type\s*{[^}]+}\s*$/) &&
        getNextNonSpaceNonCommentCharacter(text, comment) === "("
    )
  );
}

function getAlignmentSize(value, tabWidth, startIndex) {
  startIndex = startIndex || 0;

  let size = 0;
  for (let i = startIndex; i < value.length; ++i) {
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

function getIndentSize(value, tabWidth) {
  const lastNewlineIndex = value.lastIndexOf("\n");
  if (lastNewlineIndex === -1) {
    return 0;
  }

  return getAlignmentSize(
    // All the leading whitespaces
    value.slice(lastNewlineIndex + 1).match(/^[ \t]*/)[0],
    tabWidth
  );
}

function printString(raw, options, isDirectiveLiteral) {
  // `rawContent` is the string exactly like it appeared in the input source
  // code, without its enclosing quotes.
  const rawContent = raw.slice(1, -1);

  const double = { quote: '"', regex: /"/g };
  const single = { quote: "'", regex: /'/g };

  const preferred = options.singleQuote ? single : double;
  const alternate = preferred === single ? double : single;

  let shouldUseAlternateQuote = false;
  let canChangeDirectiveQuotes = false;

  // If `rawContent` contains at least one of the quote preferred for enclosing
  // the string, we might want to enclose with the alternate quote instead, to
  // minimize the number of escaped quotes.
  // Also check for the alternate quote, to determine if we're allowed to swap
  // the quotes on a DirectiveLiteral.
  if (
    rawContent.includes(preferred.quote) ||
    rawContent.includes(alternate.quote)
  ) {
    const numPreferredQuotes = (rawContent.match(preferred.regex) || []).length;
    const numAlternateQuotes = (rawContent.match(alternate.regex) || []).length;

    shouldUseAlternateQuote = numPreferredQuotes > numAlternateQuotes;
  } else {
    canChangeDirectiveQuotes = true;
  }

  const enclosingQuote =
    options.parser === "json"
      ? double.quote
      : shouldUseAlternateQuote ? alternate.quote : preferred.quote;

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

  // It might sound unnecessary to use `makeString` even if the string already
  // is enclosed with `enclosingQuote`, but it isn't. The string could contain
  // unnecessary escapes (such as in `"\'"`). Always using `makeString` makes
  // sure that we consistently output the minimum amount of escaped quotes.
  return makeString(
    rawContent,
    enclosingQuote,
    !(
      options.parser === "css" ||
      options.parser === "less" ||
      options.parser === "scss"
    )
  );
}

function makeString(rawContent, enclosingQuote, unescapeUnnecessaryEscapes) {
  const otherQuote = enclosingQuote === '"' ? "'" : '"';

  // Matches _any_ escape and unescaped quotes (both single and double).
  const regex = /\\([\s\S])|(['"])/g;

  // Escape and unescape single and double quotes as needed to be able to
  // enclose `rawContent` with `enclosingQuote`.
  const newContent = rawContent.replace(regex, (match, escaped, quote) => {
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
    return unescapeUnnecessaryEscapes &&
      /^[^\\nrvtbfux\r\n\u2028\u2029"'0-7]$/.test(escaped)
      ? escaped
      : "\\" + escaped;
  });

  return enclosingQuote + newContent + enclosingQuote;
}

function printNumber(rawNumber) {
  return (
    rawNumber
      .toLowerCase()
      // Remove unnecessary plus and zeroes from scientific notation.
      .replace(/^([+-]?[\d.]+e)(?:\+|(-))?0*(\d)/, "$1$2$3")
      // Remove unnecessary scientific notation (1e0).
      .replace(/^([+-]?[\d.]+)e[+-]?0+$/, "$1")
      // Make sure numbers always start with a digit.
      .replace(/^([+-])?\./, "$10.")
      // Remove extraneous trailing decimal zeroes.
      .replace(/(\.\d+?)0+(?=e|$)/, "$1")
      // Remove trailing dot.
      .replace(/\.(?=e|$)/, "")
  );
}

function getMaxContinuousCount(str, target) {
  const results = str.match(
    new RegExp(`(${escapeStringRegexp(target)})+`, "g")
  );

  if (results === null) {
    return 0;
  }

  return results.reduce(
    (maxCount, result) => Math.max(maxCount, result.length / target.length),
    0
  );
}

function mapDoc(doc, callback) {
  if (doc.parts) {
    const parts = doc.parts.map(part => mapDoc(part, callback));
    return callback(Object.assign({}, doc, { parts }));
  }

  if (doc.contents) {
    const contents = mapDoc(doc.contents, callback);
    return callback(Object.assign({}, doc, { contents }));
  }

  return callback(doc);
}

/**
 * split text into whitespaces and words
 * @param {string} text
 * @return {Array<{ type: "whitespace", value: " " | "\n" | "" } | { type: "word", value: string }>}
 */
function splitText(text) {
  const KIND_NON_CJK = "non-cjk";
  const KIND_CJK_CHARACTER = "cjk-character";
  const KIND_CJK_PUNCTUATION = "cjk-punctuation";

  const nodes = [];

  text
    .replace(new RegExp(`(${cjkPattern})\n(${cjkPattern})`, "g"), "$1$2")
    .split(/([ \t\n]+)/)
    .forEach((token, index, tokens) => {
      // whitespace
      if (index % 2 === 1) {
        nodes.push({
          type: "whitespace",
          value: /\n/.test(token) ? "\n" : " "
        });
        return;
      }

      // word separated by whitespace

      if ((index === 0 || index === tokens.length - 1) && token === "") {
        return;
      }

      token
        .split(new RegExp(`(${cjkPattern})`))
        .forEach((innerToken, innerIndex, innerTokens) => {
          if (
            (innerIndex === 0 || innerIndex === innerTokens.length - 1) &&
            innerToken === ""
          ) {
            return;
          }

          // non-CJK word
          if (innerIndex % 2 === 0) {
            if (innerToken !== "") {
              appendNode({
                type: "word",
                value: innerToken,
                kind: KIND_NON_CJK,
                hasLeadingPunctuation: punctuationRegex.test(innerToken[0]),
                hasTrailingPunctuation: punctuationRegex.test(
                  getLast(innerToken)
                )
              });
            }
            return;
          }

          // CJK character
          appendNode(
            punctuationRegex.test(innerToken)
              ? {
                  type: "word",
                  value: innerToken,
                  kind: KIND_CJK_PUNCTUATION,
                  hasLeadingPunctuation: true,
                  hasTrailingPunctuation: true
                }
              : {
                  type: "word",
                  value: innerToken,
                  kind: KIND_CJK_CHARACTER,
                  hasLeadingPunctuation: false,
                  hasTrailingPunctuation: false
                }
          );
        });
    });

  return nodes;

  function appendNode(node) {
    const lastNode = getLast(nodes);
    if (lastNode && lastNode.type === "word") {
      if (
        (lastNode.kind === KIND_NON_CJK &&
          node.kind === KIND_CJK_CHARACTER &&
          !lastNode.hasTrailingPunctuation) ||
        (lastNode.kind === KIND_CJK_CHARACTER &&
          node.kind === KIND_NON_CJK &&
          !node.hasLeadingPunctuation)
      ) {
        nodes.push({ type: "whitespace", value: " " });
      } else if (
        !isBetween(KIND_NON_CJK, KIND_CJK_PUNCTUATION) &&
        // disallow leading/trailing full-width whitespace
        ![lastNode.value, node.value].some(value => /\u3000/.test(value))
      ) {
        nodes.push({ type: "whitespace", value: "" });
      }
    }
    nodes.push(node);

    function isBetween(kind1, kind2) {
      return (
        (lastNode.kind === kind1 && node.kind === kind2) ||
        (lastNode.kind === kind2 && node.kind === kind1)
      );
    }
  }
}

function getStringWidth(text) {
  if (!text) {
    return 0;
  }

  // emojis are considered 2-char width for consistency
  // see https://github.com/sindresorhus/string-width/issues/11
  // for the reason why not implemented in `string-width`
  return stringWidth(text.replace(emojiRegex, "  "));
}

module.exports = {
  punctuationRegex,
  punctuationCharRange,
  getStringWidth,
  splitText,
  mapDoc,
  getMaxContinuousCount,
  getPrecedence,
  shouldFlatten,
  isBitwiseOperator,
  isExportDeclaration,
  getParentExportDeclaration,
  getPenultimate,
  getLast,
  getNextNonSpaceNonCommentCharacterIndex,
  getNextNonSpaceNonCommentCharacter,
  skipWhitespace,
  skipSpaces,
  skipNewline,
  isNextLineEmptyAfterIndex,
  isNextLineEmpty,
  isPreviousLineEmpty,
  hasNewline,
  hasNewlineInRange,
  hasSpaces,
  locStart,
  locEnd,
  setLocStart,
  setLocEnd,
  startsWithNoLookaheadToken,
  hasBlockComments,
  isBlockComment,
  hasClosureCompilerTypeCastComment,
  getAlignmentSize,
  getIndentSize,
  printString,
  printNumber
};
