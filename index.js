"use strict";

const stripBom = require("strip-bom");
const comments = require("./src/comments");
const version = require("./package.json").version;
const printAstToDoc = require("./src/printer").printAstToDoc;
const util = require("./src/util");
const printDocToString = require("./src/doc-printer").printDocToString;
const normalizeOptions = require("./src/options").normalize;
const parser = require("./src/parser");
const printDocToDebug = require("./src/doc-debug").printDocToDebug;
const config = require("./src/resolve-config");
const docblock = require("jest-docblock");
const getStream = require("get-stream");

function guessLineEnding(text) {
  const index = text.indexOf("\n");
  if (index >= 0 && text.charAt(index - 1) === "\r") {
    return "\r\n";
  }
  return "\n";
}

function attachComments(text, ast, opts) {
  const astComments = ast.comments;
  if (astComments) {
    delete ast.comments;
    comments.attach(astComments, ast, text, opts);
  }
  ast.tokens = [];
  opts.originalText = text.trimRight();
  return astComments;
}

function hasPragma(text) {
  const pragmas = Object.keys(docblock.parse(docblock.extract(text)));
  return pragmas.indexOf("prettier") !== -1 || pragmas.indexOf("format") !== -1;
}

function ensureAllCommentsPrinted(astComments) {
  if (!astComments) {
    return;
  }

  for (let i = 0; i < astComments.length; ++i) {
    if (astComments[i].value.trim() === "prettier-ignore") {
      // If there's a prettier-ignore, we're not printing that sub-tree so we
      // don't know if the comments was printed or not.
      return;
    }
  }

  astComments.forEach(comment => {
    if (!comment.printed) {
      throw new Error(
        'Comment "' +
          comment.value.trim() +
          '" was not printed. Please report this error!'
      );
    }
    delete comment.printed;
  });
}

function formatWithCursor(text, opts, addAlignmentSize) {
  if (opts.requirePragma && !hasPragma(text)) {
    return { formatted: text };
  }

  text = stripBom(text);

  if (
    opts.insertPragma &&
    !hasPragma(text) &&
    opts.rangeStart === 0 &&
    opts.rangeEnd === Infinity
  ) {
    const parsedDocblock = docblock.parseWithComments(docblock.extract(text));
    const pragmas = Object.assign({ format: "" }, parsedDocblock.pragmas);
    const newDocblock = docblock.print({
      pragmas,
      comments: parsedDocblock.comments.replace(/^(\r?\n)+/, "") // remove leading newlines
    });
    const strippedText = docblock.strip(text);
    const separatingNewlines = strippedText.startsWith("\n") ? "\n" : "\n\n";
    text = newDocblock + separatingNewlines + strippedText;
  }

  addAlignmentSize = addAlignmentSize || 0;

  const ast = parser.parse(text, opts);

  const formattedRangeOnly = formatRange(text, opts, ast);
  if (formattedRangeOnly) {
    return { formatted: formattedRangeOnly };
  }

  let cursorOffset;
  if (opts.cursorOffset >= 0) {
    const cursorNodeAndParents = findNodeAtOffset(ast, opts.cursorOffset);
    const cursorNode = cursorNodeAndParents.node;
    if (cursorNode) {
      cursorOffset = opts.cursorOffset - util.locStart(cursorNode);
      opts.cursorNode = cursorNode;
    }
  }

  const astComments = attachComments(text, ast, opts);
  const doc = printAstToDoc(ast, opts, addAlignmentSize);
  opts.newLine = guessLineEnding(text);
  const toStringResult = printDocToString(doc, opts);
  const str = toStringResult.formatted;
  const cursorOffsetResult = toStringResult.cursor;
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

function format(text, opts, addAlignmentSize) {
  return formatWithCursor(text, opts, addAlignmentSize).formatted;
}

function findSiblingAncestors(startNodeAndParents, endNodeAndParents) {
  let resultStartNode = startNodeAndParents.node;
  let resultEndNode = endNodeAndParents.node;

  if (resultStartNode === resultEndNode) {
    return {
      startNode: resultStartNode,
      endNode: resultEndNode
    };
  }

  for (const endParent of endNodeAndParents.parentNodes) {
    if (
      endParent.type !== "Program" &&
      endParent.type !== "File" &&
      util.locStart(endParent) >= util.locStart(startNodeAndParents.node)
    ) {
      resultEndNode = endParent;
    } else {
      break;
    }
  }

  for (const startParent of startNodeAndParents.parentNodes) {
    if (
      startParent.type !== "Program" &&
      startParent.type !== "File" &&
      util.locEnd(startParent) <= util.locEnd(endNodeAndParents.node)
    ) {
      resultStartNode = startParent;
    } else {
      break;
    }
  }

  return {
    startNode: resultStartNode,
    endNode: resultEndNode
  };
}

function findNodeAtOffset(node, offset, predicate, parentNodes) {
  predicate = predicate || (() => true);
  parentNodes = parentNodes || [];
  const start = util.locStart(node);
  const end = util.locEnd(node);
  if (start <= offset && offset <= end) {
    for (const childNode of comments.getSortedChildNodes(node)) {
      const childResult = findNodeAtOffset(
        childNode,
        offset,
        predicate,
        [node].concat(parentNodes)
      );
      if (childResult) {
        return childResult;
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
function isSourceElement(opts, node) {
  if (node == null) {
    return false;
  }
  switch (node.type || node.kind) {
    case "ObjectExpression": // JSON
    case "ArrayExpression": // JSON
    case "StringLiteral": // JSON
    case "NumericLiteral": // JSON
    case "BooleanLiteral": // JSON
    case "NullLiteral": // JSON
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
    case "ExportDeclaration": // Typescript
    case "OperationDefinition": // GraphQL
    case "FragmentDefinition": // GraphQL
    case "VariableDefinition": // GraphQL
    case "TypeExtensionDefinition": // GraphQL
    case "ObjectTypeDefinition": // GraphQL
    case "FieldDefinition": // GraphQL
    case "DirectiveDefinition": // GraphQL
    case "EnumTypeDefinition": // GraphQL
    case "EnumValueDefinition": // GraphQL
    case "InputValueDefinition": // GraphQL
    case "InputObjectTypeDefinition": // GraphQL
    case "SchemaDefinition": // GraphQL
    case "OperationTypeDefinition": // GraphQL
    case "InterfaceTypeDefinition": // GraphQL
    case "UnionTypeDefinition": // GraphQL
    case "ScalarTypeDefinition": // GraphQL
      return true;
  }
  return false;
}

function calculateRange(text, opts, ast) {
  // Contract the range so that it has non-whitespace characters at its endpoints.
  // This ensures we can format a range that doesn't end on a node.
  const rangeStringOrig = text.slice(opts.rangeStart, opts.rangeEnd);
  const startNonWhitespace = Math.max(
    opts.rangeStart + rangeStringOrig.search(/\S/),
    opts.rangeStart
  );
  let endNonWhitespace;
  for (
    endNonWhitespace = opts.rangeEnd;
    endNonWhitespace > opts.rangeStart;
    --endNonWhitespace
  ) {
    if (text[endNonWhitespace - 1].match(/\S/)) {
      break;
    }
  }

  const startNodeAndParents = findNodeAtOffset(ast, startNonWhitespace, node =>
    isSourceElement(opts, node)
  );
  const endNodeAndParents = findNodeAtOffset(ast, endNonWhitespace, node =>
    isSourceElement(opts, node)
  );

  if (!startNodeAndParents || !endNodeAndParents) {
    return {
      rangeStart: 0,
      rangeEnd: 0
    };
  }

  const siblingAncestors = findSiblingAncestors(
    startNodeAndParents,
    endNodeAndParents
  );
  const startNode = siblingAncestors.startNode;
  const endNode = siblingAncestors.endNode;
  const rangeStart = Math.min(util.locStart(startNode), util.locStart(endNode));
  const rangeEnd = Math.max(util.locEnd(startNode), util.locEnd(endNode));

  return {
    rangeStart: rangeStart,
    rangeEnd: rangeEnd
  };
}

function formatRange(text, opts, ast) {
  if (opts.rangeStart <= 0 && text.length <= opts.rangeEnd) {
    return;
  }

  const range = calculateRange(text, opts, ast);
  const rangeStart = range.rangeStart;
  const rangeEnd = range.rangeEnd;
  const rangeString = text.slice(rangeStart, rangeEnd);

  // Try to extend the range backwards to the beginning of the line.
  // This is so we can detect indentation correctly and restore it.
  // Use `Math.min` since `lastIndexOf` returns 0 when `rangeStart` is 0
  const rangeStart2 = Math.min(
    rangeStart,
    text.lastIndexOf("\n", rangeStart) + 1
  );
  const indentString = text.slice(rangeStart2, rangeStart);

  const alignmentSize = util.getAlignmentSize(indentString, opts.tabWidth);

  const rangeFormatted = format(
    rangeString,
    Object.assign({}, opts, {
      rangeStart: 0,
      rangeEnd: Infinity,
      printWidth: opts.printWidth - alignmentSize
    }),
    alignmentSize
  );

  // Since the range contracts to avoid trailing whitespace,
  // we need to remove the newline that was inserted by the `format` call.
  const rangeTrimmed = rangeFormatted.trimRight();

  return text.slice(0, rangeStart) + rangeTrimmed + text.slice(rangeEnd);
}

module.exports = {
  formatWithCursor: function(text, opts) {
    return formatWithCursor(text, normalizeOptions(opts));
  },

  format: function(text, opts) {
    return format(text, normalizeOptions(opts));
  },

  check: function(text, opts) {
    try {
      const formatted = format(text, normalizeOptions(opts));
      return formatted === text;
    } catch (e) {
      return false;
    }
  },

  resolveConfig: config.resolveConfig,
  clearConfigCache: config.clearCache,

  version,

  /* istanbul ignore next */
  __debug: {
    getStream,
    parse: function(text, opts) {
      return parser.parse(text, opts);
    },
    formatAST: function(ast, opts) {
      opts = normalizeOptions(opts);
      const doc = printAstToDoc(ast, opts);
      const str = printDocToString(doc, opts);
      return str;
    },
    // Doesn't handle shebang for now
    formatDoc: function(doc, opts) {
      opts = normalizeOptions(opts);
      const debug = printDocToDebug(doc);
      const str = format(debug, opts);
      return str;
    },
    printToDoc: function(text, opts) {
      opts = normalizeOptions(opts);
      const ast = parser.parse(text, opts);
      attachComments(text, ast, opts);
      const doc = printAstToDoc(ast, opts);
      return doc;
    },
    printDocToString: function(doc, opts) {
      opts = normalizeOptions(opts);
      const str = printDocToString(doc, opts);
      return str;
    }
  }
};
