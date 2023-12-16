import assert from "node:assert";
import { printDanglingComments } from "../../main/comments/print.js";
import {
  softline,
  group,
  indent,
  ifBreak,
  hardline,
} from "../../document/builders.js";
import {
  getFunctionParameters,
  hasLeadingOwnLineComment,
  isBinaryish,
  isJsxElement,
  hasComment,
  CommentCheckFlags,
  isCallExpression,
  getCallArguments,
  hasNakedLeftSide,
  getLeftSide,
} from "../utils/index.js";
import hasNewlineInRange from "../../utils/has-newline-in-range.js";
import { locEnd, locStart } from "../loc.js";
import {
  printFunctionParameters,
  shouldGroupFunctionParameters,
  shouldBreakFunctionParameters,
} from "./function-parameters.js";
import { printPropertyKey } from "./property.js";
import { printFunctionTypeParameters, printDeclareToken } from "./misc.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

/**
 * @typedef {import("../../common/ast-path.js").default} AstPath
 * @typedef {import("../../document/builders.js").Doc} Doc
 */

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
          (param) => param.type === "Identifier" && !param.typeAnnotation,
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
    expandArg,
  );
  const returnTypeDoc = printReturnType(path, print);
  const shouldGroupParameters = shouldGroupFunctionParameters(
    node,
    returnTypeDoc,
  );

  parts.push(
    printFunctionTypeParameters(path, options, print),
    group([
      shouldGroupParameters ? group(parametersDoc) : parametersDoc,
      returnTypeDoc,
    ]),
    node.body ? " " : "",
    print("body"),
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
    node === value ? printMethodValue(path, options, print) : print("value"),
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
    returnTypeDoc,
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
    parts.push(print("predicate"));
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
      node.argument.type === "SequenceExpression" ||
      (options.experimentalTernaries &&
        node.argument.type === "ConditionalExpression" &&
        (node.argument.consequent.type === "ConditionalExpression" ||
          node.argument.alternate.type === "ConditionalExpression"))
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
  if (
    hasLeadingOwnLineComment(options.originalText, argument) ||
    (hasComment(argument, CommentCheckFlags.Leading, (comment) =>
      hasNewlineInRange(
        options.originalText,
        locStart(comment),
        locEnd(comment),
      ),
    ) &&
      !isJsxElement(argument))
  ) {
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
  printMethod,
  printReturnStatement,
  printThrowStatement,
  printMethodValue,
  printReturnType,
  shouldPrintParamsWithoutParens,
};
