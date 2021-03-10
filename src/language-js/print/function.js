"use strict";

/** @type {import("assert")} */
const assert = require("assert");
const { printDanglingComments, printComments } = require("../../main/comments");
const {
  getNextNonSpaceNonCommentCharacterIndex,
} = require("../../common/util");
const {
  builders: {
    line,
    softline,
    group,
    indent,
    ifBreak,
    hardline,
    join,
    indentIfBreak,
  },
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
  isCallLikeExpression,
} = require("../utils");
const { locEnd } = require("../loc");
const {
  printFunctionParameters,
  shouldGroupFunctionParameters,
} = require("./function-parameters");
const { printPropertyKey } = require("./property");
const { printFunctionTypeParameters } = require("./misc");

function printFunctionDeclaration(path, print, options, expandArg) {
  const node = path.getValue();
  const parts = [];

  // For TypeScript the TSDeclareFunction node shares the AST
  // structure with FunctionDeclaration
  if (node.type === "TSDeclareFunction" && node.declare) {
    parts.push("declare ");
  }

  if (node.async) {
    parts.push("async ");
  }

  if (node.generator) {
    parts.push("function* ");
  } else {
    parts.push("function ");
  }

  if (node.id) {
    parts.push(path.call(print, "id"));
  }

  const parametersDoc = printFunctionParameters(
    path,
    print,
    options,
    expandArg
  );
  const returnTypeDoc = printReturnType(path, print, options);
  const shouldGroupParameters = shouldGroupFunctionParameters(
    node,
    returnTypeDoc
  );

  parts.push(
    printFunctionTypeParameters(path, options, print),
    group([
      shouldGroupParameters ? group(parametersDoc) : parametersDoc,
      returnTypeDoc,
    ]),
    node.body ? " " : "",
    path.call(print, "body")
  );

  if (options.semi && (node.declare || !node.body)) {
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
  const node = path.getNode();
  const parametersDoc = printFunctionParameters(path, print, options);
  const returnTypeDoc = printReturnType(path, print, options);
  const shouldGroupParameters = shouldGroupFunctionParameters(
    node,
    returnTypeDoc
  );
  const parts = [
    printFunctionTypeParameters(path, options, print),
    group([
      shouldGroupParameters ? group(parametersDoc) : parametersDoc,
      returnTypeDoc,
    ]),
  ];

  if (node.body) {
    parts.push(" ", path.call(print, "body"));
  } else {
    parts.push(options.semi ? ";" : "");
  }

  return parts;
}

function printArrowFunctionSignature(path, options, print, args) {
  const node = path.getValue();
  const parts = [];

  if (node.async) {
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
  return parts;
}

function printArrowChain(
  path,
  args,
  signatures,
  shouldBreak,
  bodyDoc,
  tailNode
) {
  const name = path.getName();
  const parent = path.getParentNode();
  const isCallee = isCallLikeExpression(parent) && name === "callee";
  const isAssignmentRhs = Boolean(args && args.assignmentLayout);
  const shouldPutBodyOnSeparateLine =
    tailNode.body.type !== "BlockStatement" &&
    tailNode.body.type !== "ObjectExpression";
  const shouldBreakBeforeChain =
    (isCallee && shouldPutBodyOnSeparateLine) ||
    (args && args.assignmentLayout === "chain-tail-arrow-chain");

  const groupId = Symbol("arrow-chain");

  return group([
    group(
      indent([
        isCallee || isAssignmentRhs ? softline : "",
        group(join([" =>", line], signatures), { shouldBreak }),
      ]),
      { id: groupId, shouldBreak: shouldBreakBeforeChain }
    ),
    " =>",
    indentIfBreak(
      shouldPutBodyOnSeparateLine ? indent([line, bodyDoc]) : [" ", bodyDoc],
      { groupId }
    ),
    isCallee ? ifBreak(softline, "", { groupId }) : "",
  ]);
}

function printArrowFunctionExpression(path, options, print, args) {
  let node = path.getValue();
  const signatures = [];
  let body;
  let chainShouldBreak = false;

  path.call(function rec(path) {
    const doc = printArrowFunctionSignature(path, options, print, args);
    signatures.push(
      signatures.length === 0 ? doc : printComments(path, doc, options)
    );

    chainShouldBreak =
      chainShouldBreak ||
      // Always break the chain if:
      (node.returnType && getFunctionParameters(node).length > 0) ||
      node.typeParameters ||
      getFunctionParameters(node).some((param) => param.type !== "Identifier");

    if (
      node.body.type !== "ArrowFunctionExpression" ||
      (args && args.expandLastArg)
    ) {
      body = path.call((bodyPath) => print(bodyPath, args), "body");
    } else {
      node = node.body;
      path.call(rec, "body");
    }
  });

  if (signatures.length > 1) {
    return printArrowChain(
      path,
      args,
      signatures,
      chainShouldBreak,
      body,
      node
    );
  }

  const parts = signatures;
  parts.push(" =>");

  // We want to always keep these types of nodes on the same line
  // as the arrow.
  if (
    !hasLeadingOwnLineComment(options.originalText, node.body) &&
    (node.body.type === "ArrayExpression" ||
      node.body.type === "ObjectExpression" ||
      node.body.type === "BlockStatement" ||
      isJsxNode(node.body) ||
      isTemplateOnItsOwnLine(node.body, options.originalText) ||
      node.body.type === "ArrowFunctionExpression" ||
      node.body.type === "DoExpression")
  ) {
    return group([...parts, " ", body]);
  }

  // We handle sequence expressions as the body of arrows specially,
  // so that the required parentheses end up on their own lines.
  if (node.body.type === "SequenceExpression") {
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
    !hasComment(node);

  const printTrailingComma =
    args && args.expandLastArg && shouldPrintComma(options, "all");

  // In order to avoid confusion between
  // a => a ? a : a
  // a <= a ? a : a
  const shouldAddParens =
    node.body.type === "ConditionalExpression" &&
    !startsWithNoLookaheadToken(node.body, /* forbidFunctionAndClass */ false);

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
  const node = path.getValue();
  const returnType = path.call(print, "returnType");

  if (
    node.returnType &&
    isFlowAnnotationComment(options.originalText, node.returnType)
  ) {
    return [" /*: ", returnType, " */"];
  }

  const parts = [returnType];

  // prepend colon to TypeScript type annotation
  if (node.returnType && node.returnType.typeAnnotation) {
    parts.unshift(": ");
  }

  if (node.predicate) {
    // The return type will already add the colon, but otherwise we
    // need to do it ourselves
    parts.push(node.returnType ? " " : ": ", path.call(print, "predicate"));
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
