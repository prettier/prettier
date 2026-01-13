import { ArgExpansionBailout } from "../../common/errors.js";
import {
  group,
  hardline,
  ifBreak,
  indent,
  line,
  removeLines,
  softline,
  willBreak,
} from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import {
  getFunctionParameters,
  hasComment,
  hasRestParameter,
  isArrayExpression,
  isFlowObjectTypePropertyAFunction,
  isNextLineEmpty,
  isObjectExpression,
  isObjectType,
  isSimpleType,
  isTestCall,
  isTypeAnnotationAFunction,
  iterateFunctionParametersPath,
  shouldPrintComma,
} from "../utilities/index.js";

/** @import AstPath from "../../common/ast-path.js" */

/*
- `ArrowFunctionExpression`
- `FunctionDeclaration`
- `FunctionExpression`
- `ObjectMethod`
- `Property`
- `ObjectProperty`
- `ClassMethod`
- `ClassPrivateMethod`
- `MethodDefinition
- `TSFunctionType` (TypeScript)
- `TSCallSignatureDeclaration` (TypeScript)
- `TSConstructorType` (TypeScript)
- `TSConstructSignatureDeclaration` (TypeScript)
- `TSDeclareFunction`(TypeScript)
- `TSAbstractMethodDefinition` (TypeScript)
- `TSDeclareMethod` (TypeScript)
- `TSEmptyBodyFunctionExpression` (TypeScript)
- `TSMethodSignature` (TypeScript)
- `FunctionTypeAnnotation` (Flow)
- `HookDeclaration` (Flow)
- `HookTypeAnnotation` (Flow)
*/
function printFunctionParameters(
  path,
  options,
  print,
  shouldExpandArgument,
  shouldPrintTypeParameters,
) {
  const functionNode = path.node;
  const parameters = getFunctionParameters(functionNode);
  const typeParametersDoc =
    shouldPrintTypeParameters && functionNode.typeParameters
      ? print("typeParameters")
      : "";

  if (parameters.length === 0) {
    return [
      typeParametersDoc,
      "(",
      printDanglingComments(path, options, {
        filter: (comment) => comment.mark !== "commentBeforeArrow",
      }),
      ")",
    ];
  }

  const { parent } = path;
  const isParametersInTestCall = isTestCall(parent);
  const shouldHugParameters = shouldHugTheOnlyFunctionParameter(functionNode);
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
  if (shouldExpandArgument && !isDecoratedFunction(path)) {
    if (willBreak(typeParametersDoc) || willBreak(printed)) {
      // Removing lines in this case leads to broken or ugly output
      throw new ArgExpansionBailout();
    }
    return group([
      removeLines(typeParametersDoc),
      "(",
      removeLines(printed),
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
  const hasNotParameterDecorator = parameters.every(
    (node) => !isNonEmptyArray(node.decorators),
  );
  if (shouldHugParameters && hasNotParameterDecorator) {
    return [typeParametersDoc, "(", ...printed, ")"];
  }

  // don't break in specs, eg; `it("should maintain parens around done even when long", (done) => {})`
  if (isParametersInTestCall) {
    return [typeParametersDoc, "(", ...printed, ")"];
  }

  const isFlowShorthandWithOneArg =
    (isFlowObjectTypePropertyAFunction(parent) ||
      isTypeAnnotationAFunction(parent) ||
      parent.type === "TypeAlias" ||
      parent.type === "UnionTypeAnnotation" ||
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
    if (
      options.arrowParens === "always" ||
      functionNode.type === "HookTypeAnnotation"
    ) {
      return ["(", ...printed, ")"];
    }
    return printed;
  }

  return [
    typeParametersDoc,
    "(",
    indent([softline, ...printed]),
    ifBreak(
      !hasRestParameter(functionNode) && shouldPrintComma(options, "all")
        ? ","
        : "",
    ),
    softline,
    ")",
  ];
}

function shouldHugTheOnlyFunctionParameter(node) {
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
        isObjectType(parameter.typeAnnotation) &&
        parameter !== node.rest) ||
      (parameter.type === "AssignmentPattern" &&
        (parameter.left.type === "ObjectPattern" ||
          parameter.left.type === "ArrayPattern") &&
        (parameter.right.type === "Identifier" ||
          (isObjectExpression(parameter.right) &&
            parameter.right.properties.length === 0) ||
          (isArrayExpression(parameter.right) &&
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

  const typeParameters = functionNode.typeParameters?.params;
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

/**
 * The "decorated function" pattern.
 * The arrow function should be kept hugged even if its signature breaks.
 *
 * ```
 * const decoratedFn = decorator(param1, param2)((
 *   ...
 * ) => {
 *   ...
 * });
 * ```
 * @param {AstPath} path
 */
function isDecoratedFunction(path) {
  return path.match(
    (node) =>
      node.type === "ArrowFunctionExpression" &&
      node.body.type === "BlockStatement",
    (node, name) => {
      if (
        node.type === "CallExpression" &&
        name === "arguments" &&
        node.arguments.length === 1 &&
        node.callee.type === "CallExpression"
      ) {
        const decorator = node.callee.callee;
        return (
          decorator.type === "Identifier" ||
          (decorator.type === "MemberExpression" &&
            !decorator.computed &&
            decorator.object.type === "Identifier" &&
            decorator.property.type === "Identifier")
        );
      }
      return false;
    },
    (node, name) =>
      (node.type === "VariableDeclarator" && name === "init") ||
      (node.type === "ExportDefaultDeclaration" && name === "declaration") ||
      (node.type === "TSExportAssignment" && name === "expression") ||
      (node.type === "AssignmentExpression" &&
        name === "right" &&
        node.left.type === "MemberExpression" &&
        node.left.object.type === "Identifier" &&
        node.left.object.name === "module" &&
        node.left.property.type === "Identifier" &&
        node.left.property.name === "exports"),
    (node) =>
      node.type !== "VariableDeclaration" ||
      (node.kind === "const" && node.declarations.length === 1),
  );
}

function shouldBreakFunctionParameters(functionNode) {
  const parameters = getFunctionParameters(functionNode);
  return (
    parameters.length > 1 &&
    parameters.some((parameter) => parameter.type === "TSParameterProperty")
  );
}

function shouldHugTheOnlyParameter(node, name) {
  return (
    (name === "params" || name === "this" || name === "rest") &&
    shouldHugTheOnlyFunctionParameter(node)
  );
}

export {
  printFunctionParameters,
  shouldBreakFunctionParameters,
  shouldGroupFunctionParameters,
  shouldHugTheOnlyParameter,
};
