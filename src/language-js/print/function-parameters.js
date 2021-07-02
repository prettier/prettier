"use strict";

const { getNextNonSpaceNonCommentCharacter } = require("../../common/util");
const { printDanglingComments } = require("../../main/comments");
const {
  builders: { line, hardline, softline, group, indent, ifBreak },
  utils: { removeLines, willBreak },
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
const { ArgExpansionBailout } = require("../../common/errors");
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

  // [prettierx] --space-in-parens option support (...)
  const insideSpace = options.spaceInParens ? " " : "";
  const innerLineBreak = options.spaceInParens ? line : softline;

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
  const printed = [];
  iterateFunctionParametersPath(path, (parameterPath, index) => {
    const isLastParameter = index === parameters.length - 1;
    if (isLastParameter && functionNode.rest) {
      printed.push("...");
    }
    printed.push(print());
    if (isLastParameter) {
      return;
    }
    printed.push(",");
    if (isParametersInTestCall || shouldHugParameters) {
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
  //   )                     ) => {
  //                         })
  if (expandArg) {
    if (willBreak(typeParams) || willBreak(printed)) {
      // Removing lines in this case leads to broken or ugly output
      throw new ArgExpansionBailout();
    }
    // [prettierx] with --space-in-parens option support (...)
    return group([
      removeLines(typeParams),
      "(",
      // [prettierx] --space-in-parens option support (...)
      insideSpace,
      removeLines(printed),
      // [prettierx] --space-in-parens option support (...)
      insideSpace,
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
    // [prettierx] with --space-in-parens option support (...)
    return [
      typeParams,
      "(",
      // [prettierx] --space-in-parens option support (...)
      insideSpace,
      ...printed,
      // [prettierx] --space-in-parens option support (...)
      insideSpace,
      ")",
    ];
  }

  // don't break in specs, eg; `it("should maintain parens around done even when long", (done) => {})`
  if (isParametersInTestCall) {
    // [prettierx] with --space-in-parens option support (...)
    return [
      typeParams,
      "(",
      // [prettierx] --space-in-parens option support (...)
      insideSpace,
      ...printed,
      // [prettierx] --space-in-parens option support (...)
      insideSpace,
      ")",
    ];
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
      // [prettierx] --space-in-parens option support (...)
      return ["(", insideSpace, ...printed, insideSpace, ")"];
    }
    return printed;
  }

  // [prettierx] with --space-in-parens option support (...)
  return [
    typeParams,
    "(",
    // [prettierx] --space-in-parens option support (...)
    indent([innerLineBreak, ...printed]),
    ifBreak(
      !hasRestParameter(functionNode) && shouldPrintComma(options, "all")
        ? ","
        : ""
    ),
    // [prettierx] --space-in-parens option support (...)
    innerLineBreak,
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

function getReturnTypeNode(functionNode) {
  let returnTypeNode;
  if (functionNode.returnType) {
    returnTypeNode = functionNode.returnType;
    if (returnTypeNode.typeAnnotation) {
      returnTypeNode = returnTypeNode.typeAnnotation;
    }
  } else if (functionNode.typeAnnotation) {
    returnTypeNode = functionNode.typeAnnotation;
  }
  return returnTypeNode;
}

// When parameters are grouped, the return type annotation breaks first.
function shouldGroupFunctionParameters(functionNode, returnTypeDoc) {
  const returnTypeNode = getReturnTypeNode(functionNode);
  if (!returnTypeNode) {
    return false;
  }

  const typeParameters =
    functionNode.typeParameters && functionNode.typeParameters.params;
  if (typeParameters) {
    if (typeParameters.length > 1) {
      return false;
    }
    if (typeParameters.length === 1) {
      const typeParameter = typeParameters[0];
      if (typeParameter.constraint || typeParameter.default) {
        return false;
      }
    }
  }

  return (
    getFunctionParameters(functionNode).length === 1 &&
    (isObjectType(returnTypeNode) || willBreak(returnTypeDoc))
  );
}

module.exports = {
  printFunctionParameters,
  shouldHugFunctionParameters,
  shouldGroupFunctionParameters,
};
