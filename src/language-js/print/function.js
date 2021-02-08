"use strict";

/** @type {import("assert")} */
const assert = require("assert");
const { printDanglingComments } = require("../../main/comments");
const {
  getNextNonSpaceNonCommentCharacterIndex,
} = require("../../common/util");
const {
  builders: { line, softline, group, indent, ifBreak, hardline },
} = require("../../document");
const {
  getFunctionParameters,
  hasLeadingOwnLineComment,
  isFlowAnnotationComment,
  isJsxNode,
  isTemplateOnItsOwnLine,
  shouldPrintComma,
  startsWithNoLookaheadToken,
  returnArgumentHasLeadingComment,
  isBinaryish,
  isLineComment,
  hasComment,
  getComments,
  CommentCheckFlags,
} = require("../utils");
const { locEnd } = require("../loc");
const { printFunctionParameters } = require("./function-parameters");
const { printPropertyKey } = require("./property");
const { printFunctionTypeParameters } = require("./misc");

function printFunctionDeclaration(path, print, options, expandArg) {
  const n = path.getValue();
  const parts = [];

  // For TypeScript the TSDeclareFunction node shares the AST
  // structure with FunctionDeclaration
  if (n.type === "TSDeclareFunction" && n.declare) {
    parts.push("declare ");
  }

  if (n.async) {
    parts.push("async ");
  }

  if (n.generator) {
    parts.push("function* ");
  } else {
    parts.push("function ");
  }

  if (n.id) {
    parts.push(path.call(print, "id"));
  }

  parts.push(
    printFunctionTypeParameters(path, options, print),
    group([
      printFunctionParameters(path, print, options, expandArg),
      printReturnType(path, print, options),
    ]),
    n.body ? " " : "",
    path.call(print, "body")
  );

  if (options.semi && (n.declare || !n.body)) {
    parts.push(";");
  }

  return parts;
}

function printMethod(path, options, print) {
  const node = path.getNode();
  const { kind } = node;
  const value = node.value || node;
  const parts = [];

  if (!kind || kind === "init" || kind === "method" || kind === "constructor") {
    if (value.async) {
      parts.push("async ");
    }
  } else {
    assert.ok(kind === "get" || kind === "set");

    parts.push(kind, " ");
  }

  // A `getter`/`setter` can't be a generator, but it's recoverable
  if (value.generator) {
    parts.push("*");
  }

  parts.push(
    printPropertyKey(path, options, print),
    node.optional || node.key.optional ? "?" : ""
  );

  if (node === value) {
    parts.push(printMethodInternal(path, options, print));
  } else if (value.type === "FunctionExpression") {
    parts.push(
      path.call((path) => printMethodInternal(path, options, print), "value")
    );
  } else {
    parts.push(path.call(print, "value"));
  }

  return parts;
}

function printMethodInternal(path, options, print) {
  const parts = [
    printFunctionTypeParameters(path, options, print),
    group([
      printFunctionParameters(path, print, options),
      printReturnType(path, print, options),
    ]),
  ];

  if (path.getNode().body) {
    parts.push(" ", path.call(print, "body"));
  } else {
    parts.push(options.semi ? ";" : "");
  }

  return parts;
}

function printArrowFunctionExpression(path, options, print, args) {
  const n = path.getValue();
  const parts = [];

  if (n.async) {
    parts.push("async ");
  }

  if (shouldPrintParamsWithoutParens(path, options)) {
    parts.push(path.call(print, "params", 0));
  } else {
    parts.push(
      group([
        printFunctionParameters(
          path,
          print,
          options,
          /* expandLast */ args && (args.expandLastArg || args.expandFirstArg),
          /* printTypeParams */ true
        ),
        printReturnType(path, print, options),
      ])
    );
  }

  const dangling = printDanglingComments(
    path,
    options,
    /* sameIndent */ true,
    (comment) => {
      const nextCharacter = getNextNonSpaceNonCommentCharacterIndex(
        options.originalText,
        comment,
        locEnd
      );
      return (
        nextCharacter !== false &&
        options.originalText.slice(nextCharacter, nextCharacter + 2) === "=>"
      );
    }
  );
  if (dangling) {
    parts.push(" ", dangling);
  }

  parts.push(" =>");

  const body = path.call((bodyPath) => print(bodyPath, args), "body");

  // We want to always keep these types of nodes on the same line
  // as the arrow.
  if (
    !hasLeadingOwnLineComment(options.originalText, n.body) &&
    (n.body.type === "ArrayExpression" ||
      n.body.type === "ObjectExpression" ||
      n.body.type === "BlockStatement" ||
      isJsxNode(n.body) ||
      isTemplateOnItsOwnLine(n.body, options.originalText) ||
      n.body.type === "ArrowFunctionExpression" ||
      n.body.type === "DoExpression")
  ) {
    return group([...parts, " ", body]);
  }

  // We handle sequence expressions as the body of arrows specially,
  // so that the required parentheses end up on their own lines.
  if (n.body.type === "SequenceExpression") {
    return group([
      ...parts,
      group([" (", indent([softline, body]), softline, ")"]),
    ]);
  }

  // if the arrow function is expanded as last argument, we are adding a
  // level of indentation and need to add a softline to align the closing )
  // with the opening (, or if it's inside a JSXExpression (e.g. an attribute)
  // we should align the expression's closing } with the line with the opening {.
  const shouldAddSoftLine =
    ((args && args.expandLastArg) ||
      path.getParentNode().type === "JSXExpressionContainer") &&
    !hasComment(n);

  const printTrailingComma =
    args && args.expandLastArg && shouldPrintComma(options, "all");

  // In order to avoid confusion between
  // a => a ? a : a
  // a <= a ? a : a
  const shouldAddParens =
    n.body.type === "ConditionalExpression" &&
    !startsWithNoLookaheadToken(n.body, /* forbidFunctionAndClass */ false);

  return group([
    ...parts,
    group([
      indent([
        line,
        shouldAddParens ? ifBreak("", "(") : "",
        body,
        shouldAddParens ? ifBreak("", ")") : "",
      ]),
      shouldAddSoftLine
        ? [ifBreak(printTrailingComma ? "," : ""), softline]
        : "",
    ]),
  ]);
}

function canPrintParamsWithoutParens(node) {
  const parameters = getFunctionParameters(node);
  return (
    parameters.length === 1 &&
    !node.typeParameters &&
    !hasComment(node, CommentCheckFlags.Dangling) &&
    parameters[0].type === "Identifier" &&
    !parameters[0].typeAnnotation &&
    !hasComment(parameters[0]) &&
    !parameters[0].optional &&
    !node.predicate &&
    !node.returnType
  );
}

function shouldPrintParamsWithoutParens(path, options) {
  if (options.arrowParens === "always") {
    return false;
  }

  if (options.arrowParens === "avoid") {
    const node = path.getValue();
    return canPrintParamsWithoutParens(node);
  }

  // Fallback default; should be unreachable
  /* istanbul ignore next */
  return false;
}

function printReturnType(path, print, options) {
  const n = path.getValue();
  const returnType = path.call(print, "returnType");

  if (
    n.returnType &&
    isFlowAnnotationComment(options.originalText, n.returnType)
  ) {
    return [" /*: ", returnType, " */"];
  }

  const parts = [returnType];

  // prepend colon to TypeScript type annotation
  if (n.returnType && n.returnType.typeAnnotation) {
    parts.unshift(": ");
  }

  if (n.predicate) {
    // The return type will already add the colon, but otherwise we
    // need to do it ourselves
    parts.push(n.returnType ? " " : ": ", path.call(print, "predicate"));
  }

  return parts;
}

// `ReturnStatement` and `ThrowStatement`
function printReturnAndThrowArgument(path, options, print) {
  const node = path.getValue();
  const semi = options.semi ? ";" : "";
  const parts = [];

  if (node.argument) {
    if (returnArgumentHasLeadingComment(options, node.argument)) {
      parts.push([
        " (",
        indent([hardline, path.call(print, "argument")]),
        hardline,
        ")",
      ]);
    } else if (
      isBinaryish(node.argument) ||
      node.argument.type === "SequenceExpression"
    ) {
      parts.push(
        group([
          ifBreak(" (", " "),
          indent([softline, path.call(print, "argument")]),
          softline,
          ifBreak(")"),
        ])
      );
    } else {
      parts.push(" ", path.call(print, "argument"));
    }
  }

  const comments = getComments(node);
  const lastComment = comments[comments.length - 1];
  const isLastCommentLine = lastComment && isLineComment(lastComment);

  if (isLastCommentLine) {
    parts.push(semi);
  }

  if (hasComment(node, CommentCheckFlags.Dangling)) {
    parts.push(
      " ",
      printDanglingComments(path, options, /* sameIndent */ true)
    );
  }

  if (!isLastCommentLine) {
    parts.push(semi);
  }

  return parts;
}

function printReturnStatement(path, options, print) {
  return ["return", printReturnAndThrowArgument(path, options, print)];
}

function printThrowStatement(path, options, print) {
  return ["throw", printReturnAndThrowArgument(path, options, print)];
}

module.exports = {
  printFunctionDeclaration,
  printArrowFunctionExpression,
  printMethod,
  printReturnStatement,
  printThrowStatement,
  printMethodInternal,
  shouldPrintParamsWithoutParens,
};
