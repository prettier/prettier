"use strict";

const { getNextNonSpaceNonCommentCharacter } = require("../../common/util");
const { printDanglingComments } = require("../../main/comments");
const {
  builders: { line, hardline, softline, group, indent, ifBreak },
  utils: { removeLines },
} = require("../../document");
const {
  getFunctionParameters,
  iterateFunctionParametersPath,
  isSimpleType,
  isTestCall,
  isTypeAnnotationAFunction,
  isObjectType,
  isObjectTypePropertyAFunction,
  hasRestParameter,
  shouldPrintComma,
  hasComment,
  isNextLineEmpty,
} = require("../utils");
const { locEnd } = require("../loc");
const { printFunctionTypeParameters } = require("./misc");

function printFunctionParameters(
  path,
  print,
  options,
  expandArg,
  printTypeParams
) {
  const functionNode = path.getValue();
  const parameters = getFunctionParameters(functionNode);
  const typeParams = printTypeParams
    ? printFunctionTypeParameters(path, options, print)
    : "";

  if (parameters.length === 0) {
    return [
      typeParams,
      "(",
      printDanglingComments(
        path,
        options,
        /* sameIndent */ true,
        (comment) =>
          getNextNonSpaceNonCommentCharacter(
            options.originalText,
            comment,
            locEnd
          ) === ")"
      ),
      ")",
    ];
  }

  const parent = path.getParentNode();
  const isParametersInTestCall = isTestCall(parent);
  const shouldHugParameters = shouldHugFunctionParameters(functionNode);
  const shouldExpandParameters =
    expandArg && !parameters.some((node) => hasComment(node));
  const printed = [];
  iterateFunctionParametersPath(path, (parameterPath, index) => {
    const isLastParameter = index === parameters.length - 1;
    if (isLastParameter && functionNode.rest) {
      printed.push("...");
    }
    printed.push(parameterPath.call(print));
    if (isLastParameter) {
      return;
    }
    printed.push(",");
    if (
      isParametersInTestCall ||
      shouldHugParameters ||
      shouldExpandParameters
    ) {
      printed.push(" ");
    } else if (isNextLineEmpty(parameters[index], options)) {
      printed.push(hardline, hardline);
    } else {
      printed.push(line);
    }
  });

  // If the parent is a call with the first/last argument expansion and this is the
  // params of the first/last argument, we don't want the arguments to break and instead
  // want the whole expression to be on a new line.
  //
  // Good:                 Bad:
  //   verylongcall(         verylongcall((
  //     (a, b) => {           a,
  //     }                     b,
  //   })                    ) => {
  //                         })
  if (shouldExpandParameters) {
    return group([
      removeLines(typeParams),
      "(",
      ...printed.map(removeLines),
      ")",
    ]);
  }

  // Single object destructuring should hug
  //
  // function({
  //   a,
  //   b,
  //   c
  // }) {}
  const hasNotParameterDecorator = parameters.every((node) => !node.decorators);
  if (shouldHugParameters && hasNotParameterDecorator) {
    return [typeParams, "(", ...printed, ")"];
  }

  // don't break in specs, eg; `it("should maintain parens around done even when long", (done) => {})`
  if (isParametersInTestCall) {
    return [typeParams, "(", ...printed, ")"];
  }

  const isFlowShorthandWithOneArg =
    (isObjectTypePropertyAFunction(parent) ||
      isTypeAnnotationAFunction(parent) ||
      parent.type === "TypeAlias" ||
      parent.type === "UnionTypeAnnotation" ||
      parent.type === "TSUnionType" ||
      parent.type === "IntersectionTypeAnnotation" ||
      (parent.type === "FunctionTypeAnnotation" &&
        parent.returnType === functionNode)) &&
    parameters.length === 1 &&
    parameters[0].name === null &&
    // `type q = (this: string) => void;`
    functionNode.this !== parameters[0] &&
    parameters[0].typeAnnotation &&
    functionNode.typeParameters === null &&
    isSimpleType(parameters[0].typeAnnotation) &&
    !functionNode.rest;

  if (isFlowShorthandWithOneArg) {
    if (options.arrowParens === "always") {
      return ["(", ...printed, ")"];
    }
    return printed;
  }

  return [
    typeParams,
    "(",
    indent([softline, ...printed]),
    ifBreak(
      !hasRestParameter(functionNode) && shouldPrintComma(options, "all")
        ? ","
        : ""
    ),
    softline,
    ")",
  ];
}

function shouldHugFunctionParameters(node) {
  if (!node) {
    return false;
  }
  const parameters = getFunctionParameters(node);
  if (parameters.length !== 1) {
    return false;
  }
  const [parameter] = parameters;
  return (
    !hasComment(parameter) &&
    (parameter.type === "ObjectPattern" ||
      parameter.type === "ArrayPattern" ||
      (parameter.type === "Identifier" &&
        parameter.typeAnnotation &&
        (parameter.typeAnnotation.type === "TypeAnnotation" ||
          parameter.typeAnnotation.type === "TSTypeAnnotation") &&
        isObjectType(parameter.typeAnnotation.typeAnnotation)) ||
      (parameter.type === "FunctionTypeParam" &&
        isObjectType(parameter.typeAnnotation)) ||
      (parameter.type === "AssignmentPattern" &&
        (parameter.left.type === "ObjectPattern" ||
          parameter.left.type === "ArrayPattern") &&
        (parameter.right.type === "Identifier" ||
          (parameter.right.type === "ObjectExpression" &&
            parameter.right.properties.length === 0) ||
          (parameter.right.type === "ArrayExpression" &&
            parameter.right.elements.length === 0))))
  );
}

module.exports = { printFunctionParameters, shouldHugFunctionParameters };
