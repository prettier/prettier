import * as assert from "#universal/assert";
import { group } from "../../document/index.js";
import {
  CommentCheckFlags,
  getCallArguments,
  getFunctionParameters,
  hasComment,
  isCallExpression,
  isMethod,
} from "../utilities/index.js";
import {
  printFunctionParameters,
  shouldBreakFunctionParameters,
  shouldGroupFunctionParameters,
} from "./function-parameters.js";
import { printDeclareToken } from "./miscellaneous.js";
import { printPropertyKey } from "./property.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

const isMethodValue = ({ node, key, parent }) =>
  key === "value" &&
  node.type === "FunctionExpression" &&
  (parent.type === "ObjectMethod" ||
    parent.type === "ClassMethod" ||
    parent.type === "ClassPrivateMethod" ||
    parent.type === "MethodDefinition" ||
    parent.type === "TSAbstractMethodDefinition" ||
    parent.type === "TSDeclareMethod" ||
    (parent.type === "Property" && isMethod(parent)));

/*
- `FunctionDeclaration`
- `FunctionExpression`
- `HookDeclaration` (Flow)
- `TSDeclareFunction`(TypeScript)
*/
function printFunction(path, options, print, args) {
  if (isMethodValue(path)) {
    return printMethodValue(path, options, print);
  }

  const { node } = path;

  let shouldExpandArgument = false;
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
      shouldExpandArgument = true;
    }
  }

  const parametersDoc = printFunctionParameters(
    path,
    options,
    print,
    shouldExpandArgument,
  );
  const returnTypeDoc = printReturnType(path, print);
  const shouldGroupParameters = shouldGroupFunctionParameters(
    node,
    returnTypeDoc,
  );

  const isFlowHookDeclaration = node.type === "HookDeclaration";
  const keyword = isFlowHookDeclaration ? "hook" : "function";

  return [
    printDeclareToken(path),
    node.async ? "async " : "",
    keyword,
    node.generator ? "*" : "",
    " ",
    node.id ? print("id") : "",
    print("typeParameters"),
    group([
      shouldGroupParameters ? group(parametersDoc) : parametersDoc,
      returnTypeDoc,
    ]),
    node.body ? " " : "",
    print("body"),
    options.semi && (node.declare || !node.body) ? ";" : "",
  ];
}

/*
- `FunctionDeclaration`
- `FunctionExpression`
- `TSDeclareFunction`(TypeScript)
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
    node.optional ? "?" : "",
    node === value ? printMethodValue(path, options, print) : print("value"),
  );

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
- `TSEmptyBodyFunctionExpression` (TypeScript)
*/
function printMethodValue(path, options, print) {
  const { node } = path;
  const parametersDoc = printFunctionParameters(path, options, print);
  const returnTypeDoc = printReturnType(path, print);
  const shouldBreakParameters = shouldBreakFunctionParameters(node);
  const shouldGroupParameters = shouldGroupFunctionParameters(
    node,
    returnTypeDoc,
  );
  const parts = [
    print("typeParameters"),
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

export {
  printFunction,
  printMethod,
  printMethodValue,
  printReturnType,
  shouldPrintParamsWithoutParens,
};
