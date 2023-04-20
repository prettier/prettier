/**
 * @typedef {import("../../common/ast-path.js").default} AstPath
 * @typedef {import("../../document/builders.js").Doc} Doc
 */

import assert from "node:assert";
import {
  printDanglingComments,
  printCommentsSeparately,
} from "../../main/comments/print.js";
import getNextNonSpaceNonCommentCharacterIndex from "../../utils/get-next-non-space-non-comment-character-index.js";
import {
  line,
  softline,
  group,
  indent,
  ifBreak,
  hardline,
  join,
  indentIfBreak,
} from "../../document/builders.js";
import { removeLines, willBreak } from "../../document/utils.js";
import { ArgExpansionBailout } from "../../common/errors.js";
import {
  getFunctionParameters,
  hasLeadingOwnLineComment,
  isJsxElement,
  isTemplateOnItsOwnLine,
  shouldPrintComma,
  startsWithNoLookaheadToken,
  isBinaryish,
  hasComment,
  CommentCheckFlags,
  isCallLikeExpression,
  isCallExpression,
  getCallArguments,
  hasNakedLeftSide,
  getLeftSide,
  isArrayOrTupleExpression,
  isObjectOrRecordExpression,
} from "../utils/index.js";
import { locEnd } from "../loc.js";
import {
  printFunctionParameters,
  shouldGroupFunctionParameters,
  shouldBreakFunctionParameters,
} from "./function-parameters.js";
import { printPropertyKey } from "./property.js";
import { printFunctionTypeParameters, printDeclareToken } from "./misc.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

const isMethod = (node) =>
  node.type === "ObjectMethod" ||
  node.type === "ClassMethod" ||
  node.type === "ClassPrivateMethod" ||
  node.type === "MethodDefinition" ||
  node.type === "TSAbstractMethodDefinition" ||
  node.type === "TSDeclareMethod" ||
  ((node.type === "Property" || node.type === "ObjectProperty") &&
    (node.method || node.kind === "get" || node.kind === "set"));

const isMethodValue = (path) =>
  path.node.type === "FunctionExpression" &&
  path.key === "value" &&
  isMethod(path.parent);

/*
- "FunctionDeclaration"
- "FunctionExpression"
- `TSDeclareFunction`(TypeScript)
*/
function printFunction(path, print, options, args) {
  if (isMethodValue(path)) {
    return printMethodValue(path, options, print);
  }

  const { node } = path;

  let expandArg = false;
  if (
    (node.type === "FunctionDeclaration" ||
      node.type === "FunctionExpression") &&
    args?.expandLastArg
  ) {
    const { parent } = path;
    if (
      isCallExpression(parent) &&
      (getCallArguments(parent).length > 1 ||
        getFunctionParameters(node).every(
          (param) => param.type === "Identifier" && !param.typeAnnotation
        ))
    ) {
      expandArg = true;
    }
  }

  const parts = [
    printDeclareToken(path),
    node.async ? "async " : "",
    `function${node.generator ? "*" : ""} `,
    node.id ? print("id") : "",
  ];

  const parametersDoc = printFunctionParameters(
    path,
    print,
    options,
    expandArg
  );
  const returnTypeDoc = printReturnType(path, print);
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
    print("body")
  );

  if (options.semi && (node.declare || !node.body)) {
    parts.push(";");
  }

  return parts;
}

/*
- `ObjectMethod`
- `Property`
- `ObjectProperty`
- `ClassMethod`
- `ClassPrivateMethod`
- `MethodDefinition
- `TSAbstractMethodDefinition` (TypeScript)
- `TSDeclareMethod` (TypeScript)
*/
function printMethod(path, options, print) {
  const { node } = path;
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
    node.optional || node.key.optional ? "?" : "",
    node === value ? printMethodValue(path, options, print) : print("value")
  );

  return parts;
}

function printMethodValue(path, options, print) {
  const { node } = path;
  const parametersDoc = printFunctionParameters(path, print, options);
  const returnTypeDoc = printReturnType(path, print);
  const shouldBreakParameters = shouldBreakFunctionParameters(node);
  const shouldGroupParameters = shouldGroupFunctionParameters(
    node,
    returnTypeDoc
  );
  const parts = [
    printFunctionTypeParameters(path, options, print),
    group([
      shouldBreakParameters
        ? group(parametersDoc, { shouldBreak: true })
        : shouldGroupParameters
        ? group(parametersDoc)
        : parametersDoc,
      returnTypeDoc,
    ]),
  ];

  if (node.body) {
    parts.push(" ", print("body"));
  } else {
    parts.push(options.semi ? ";" : "");
  }

  return parts;
}

function printArrowFunctionSignature(path, options, print, args) {
  const { node } = path;
  const parts = [];

  if (node.async) {
    parts.push("async ");
  }

  if (shouldPrintParamsWithoutParens(path, options)) {
    parts.push(print(["params", 0]));
  } else {
    const expandArg = args?.expandLastArg || args?.expandFirstArg;
    let returnTypeDoc = printReturnType(path, print);
    if (expandArg) {
      if (willBreak(returnTypeDoc)) {
        throw new ArgExpansionBailout();
      }
      returnTypeDoc = group(removeLines(returnTypeDoc));
    }
    parts.push(
      group([
        printFunctionParameters(
          path,
          print,
          options,
          expandArg,
          /* printTypeParams */ true
        ),
        returnTypeDoc,
      ])
    );
  }

  const dangling = printDanglingComments(path, options, {
    filter(comment) {
      const nextCharacter = getNextNonSpaceNonCommentCharacterIndex(
        options.originalText,
        locEnd(comment)
      );
      return (
        nextCharacter !== false &&
        options.originalText.slice(nextCharacter, nextCharacter + 2) === "=>"
      );
    },
  });
  if (dangling) {
    parts.push(" ", dangling);
  }
  return parts;
}

/**
 *
 * @param {*} node
 * @param {*} bodyDoc
 * @param {*} options
 * @returns {boolean}
 */
function mayBreakAfterShortPrefix(node, bodyDoc, options) {
  return (
    isArrayOrTupleExpression(node) ||
    isObjectOrRecordExpression(node) ||
    node.type === "BlockStatement" ||
    isJsxElement(node) ||
    (bodyDoc.label?.hug !== false &&
      (bodyDoc.label?.embed ||
        isTemplateOnItsOwnLine(node, options.originalText))) ||
    node.type === "ArrowFunctionExpression" ||
    node.type === "DoExpression"
  );
}

/**
 * @param {Doc[]} signatures
 * @param {*} parent
 * @param {Object} flags
 * @param {boolean} flags.isCallee
 * @param {boolean} flags.shouldBreak
 * @param {boolean} flags.isAssignmentRhs
 * @returns {Doc}
 */
function joinArrowFunctionSignatures(
  signatures,
  parent,
  { isCallee, shouldBreak, isAssignmentRhs }
) {
  if (signatures.length === 1) {
    return signatures[0];
  }
  if ((isCallLikeExpression(parent) && !isCallee) || isBinaryish(parent)) {
    return group(
      [
        signatures[0],
        " =>",
        indent([line, join([" =>", line], signatures.slice(1))]),
      ],
      {
        shouldBreak,
      }
    );
  }
  if (isCallee || isAssignmentRhs) {
    return group(join([" =>", line], signatures), {
      shouldBreak,
    });
  }
  return group(indent(join([" =>", line], signatures)), {
    shouldBreak,
  });
}

/**
 * @param {Doc} bodyDoc
 * @param {Doc[]} bodyComments
 * @param {AstPath} path
 * @param {Object} flags
 * @param {boolean} flags.shouldAddParensIfNotBreak
 * @param {boolean} flags.shouldAlwaysAddParens
 * @param {boolean} flags.shouldPutBodyOnSameLine
 * @param {*} args
 * @param {*} options
 */
function printArrowFunctionBody(
  bodyDoc,
  bodyComments,
  path,
  { shouldAddParensIfNotBreak, shouldAlwaysAddParens, shouldPutBodyOnSameLine },
  args,
  options
) {
  const { node, parent } = path;

  const trailingComma =
    args?.expandLastArg && shouldPrintComma(options, "all") ? ifBreak(",") : "";

  // if the arrow function is expanded as last argument, we are adding a
  // level of indentation and need to add a softline to align the closing )
  // with the opening (, or if it's inside a JSXExpression (e.g. an attribute)
  // we should align the expression's closing } with the line with the opening {.
  const shouldAddSoftLine =
    (args?.expandLastArg || parent.type === "JSXExpressionContainer") &&
    !hasComment(node);

  const trailingSoftline = shouldAddSoftLine ? [trailingComma, softline] : "";

  let decoratedBodyDoc;
  if (shouldAlwaysAddParens) {
    decoratedBodyDoc = group(["(", indent([softline, bodyDoc]), softline, ")"]);
  } else if (shouldAddParensIfNotBreak && shouldPutBodyOnSameLine) {
    decoratedBodyDoc = group([
      ifBreak("", "("),
      indent([softline, bodyDoc]),
      ifBreak("", ")"),
      trailingSoftline,
    ]);
  } else {
    decoratedBodyDoc = bodyDoc;
  }
  return shouldPutBodyOnSameLine
    ? [" ", decoratedBodyDoc, bodyComments]
    : [indent([line, decoratedBodyDoc, bodyComments]), trailingSoftline];
}

function printArrowFunction(path, options, print, args) {
  const { node, parent, key } = path;
  /** @type {Doc[]} */
  const signatures = [];
  /** @type {Doc} */
  let bodyDoc;
  /** @type {*[]} */
  const bodyComments = [];
  let chainShouldBreak = false;
  let tailNode = node;

  (function rec() {
    const { node: currentNode } = path;
    const doc = printArrowFunctionSignature(path, options, print, args);
    if (signatures.length === 0) {
      signatures.push(doc);
    } else {
      const { leading, trailing } = printCommentsSeparately(path, options);
      signatures.push([leading, doc]);
      bodyComments.unshift(trailing);
    }

    chainShouldBreak =
      chainShouldBreak ||
      // Always break the chain if:
      (currentNode.returnType &&
        getFunctionParameters(currentNode).length > 0) ||
      currentNode.typeParameters ||
      getFunctionParameters(currentNode).some(
        (param) => param.type !== "Identifier"
      );

    if (
      currentNode.body.type !== "ArrowFunctionExpression" ||
      args?.expandLastArg
    ) {
      bodyDoc = print("body", args);
    } else {
      tailNode = currentNode.body;
      path.call(rec, "body");
    }
  })();

  const { body } = tailNode;

  // In order to avoid confusion between
  // a => a ? a : a
  // a <= a ? a : a
  const shouldAddParensIfNotBreak =
    body.type === "ConditionalExpression" &&
    !startsWithNoLookaheadToken(
      body,
      (node) => node.type === "ObjectExpression"
    );

  // We handle sequence expressions as the body of arrows specially,
  // so that the required parentheses end up on their own lines.
  const shouldAlwaysAddParens = body.type === "SequenceExpression";

  const shouldAddParens = shouldAddParensIfNotBreak || shouldAlwaysAddParens;

  // We want to always keep these types of nodes on the same line
  // as the arrow.
  const shouldPutBodyOnSameLine =
    !hasLeadingOwnLineComment(options.originalText, body) &&
    (mayBreakAfterShortPrefix(body, bodyDoc, options) || shouldAddParens);

  const isCallee = isCallLikeExpression(parent) && key === "callee";
  const shouldBreakBeforeChain =
    (isCallee && !shouldPutBodyOnSameLine) ||
    args?.assignmentLayout === "chain-tail-arrow-chain";

  const isAssignmentRhs = Boolean(args?.assignmentLayout);

  const isChain = signatures.length > 1;

  const chainGroupId = Symbol("arrow-chain");

  const maybeBreakFirst = (doc) => {
    if ((isCallee || isAssignmentRhs) && isChain) {
      return group(indent([softline, doc]), {
        shouldBreak: shouldBreakBeforeChain,
        id: chainGroupId,
      });
    }
    return group(doc, { id: chainGroupId });
  };

  const indentIfChainBreaks = (doc) => {
    if (!isChain) {
      return group(doc);
    }
    return indentIfBreak(doc, { groupId: chainGroupId });
  };

  return group([
    maybeBreakFirst(
      joinArrowFunctionSignatures(signatures, parent, {
        isCallee,
        isAssignmentRhs,
        shouldBreak: chainShouldBreak,
      })
    ),
    " =>",
    indentIfChainBreaks(
      printArrowFunctionBody(
        bodyDoc,
        bodyComments,
        path,
        {
          shouldAddParensIfNotBreak,
          shouldAlwaysAddParens,
          shouldPutBodyOnSameLine,
        },
        args,
        options
      )
    ),
    isChain && isCallee ? ifBreak(softline, "", { groupId: chainGroupId }) : "",
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
    const { node } = path;
    return canPrintParamsWithoutParens(node);
  }

  // Fallback default; should be unreachable
  /* c8 ignore next */
  return false;
}

/** @returns {Doc} */
function printReturnType(path, print) {
  const { node } = path;
  const returnType = printTypeAnnotationProperty(path, print, "returnType");

  const parts = [returnType];

  if (node.predicate) {
    // The return type will already add the colon, but otherwise we
    // need to do it ourselves
    parts.push(node.returnType ? " " : ": ", print("predicate"));
  }

  return parts;
}

// `ReturnStatement` and `ThrowStatement`
function printReturnOrThrowArgument(path, options, print) {
  const { node } = path;
  const semi = options.semi ? ";" : "";
  const parts = [];

  if (node.argument) {
    let argumentDoc = print("argument");

    if (returnArgumentHasLeadingComment(options, node.argument)) {
      argumentDoc = ["(", indent([hardline, argumentDoc]), hardline, ")"];
    } else if (
      isBinaryish(node.argument) ||
      node.argument.type === "SequenceExpression"
    ) {
      argumentDoc = group([
        ifBreak("("),
        indent([softline, argumentDoc]),
        softline,
        ifBreak(")"),
      ]);
    }

    parts.push(" ", argumentDoc);
  }

  const hasDanglingComments = hasComment(node, CommentCheckFlags.Dangling);
  const shouldPrintSemiBeforeComments =
    semi &&
    hasDanglingComments &&
    hasComment(node, CommentCheckFlags.Last | CommentCheckFlags.Line);

  if (shouldPrintSemiBeforeComments) {
    parts.push(semi);
  }

  if (hasDanglingComments) {
    parts.push(" ", printDanglingComments(path, options));
  }

  if (!shouldPrintSemiBeforeComments) {
    parts.push(semi);
  }

  return parts;
}

function printReturnStatement(path, options, print) {
  return ["return", printReturnOrThrowArgument(path, options, print)];
}

function printThrowStatement(path, options, print) {
  return ["throw", printReturnOrThrowArgument(path, options, print)];
}

// This recurses the return argument, looking for the first token
// (the leftmost leaf node) and, if it (or its parents) has any
// leadingComments, returns true (so it can be wrapped in parens).
function returnArgumentHasLeadingComment(options, argument) {
  if (hasLeadingOwnLineComment(options.originalText, argument)) {
    return true;
  }

  if (hasNakedLeftSide(argument)) {
    let leftMost = argument;
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

export {
  printFunction,
  printArrowFunction,
  printMethod,
  printReturnStatement,
  printThrowStatement,
  printMethodValue,
  shouldPrintParamsWithoutParens,
};
