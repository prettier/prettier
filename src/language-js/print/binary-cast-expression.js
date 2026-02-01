import { group, indent, line, softline } from "../../document/index.js";
import {
  isAsConstExpression,
  isFlowAsConstExpression,
} from "../utilities/is-as-const-expression.js";
import { isGenericType } from "../utilities/is-generic-type.js";
import {
  isArrayType,
  isCallOrNewExpression,
  isFunctionType,
  isIntersectionType,
  isMemberExpression,
  isObjectType,
  isSatisfiesExpression,
} from "../utilities/node-types.js";

function printBinaryCastExpression(path, options, print) {
  const { parent, node, key } = path;
  const typeAnnotationDoc = isFlowAsConstExpression(node)
    ? "const"
    : print("typeAnnotation");

  const parts = [
    print("expression"),
    " ",
    isSatisfiesExpression(node) ? "satisfies" : "as",
  ];

  if (shouldInlineBinaryCastExpression(path)) {
    parts.push(" ", typeAnnotationDoc);
  } else {
    parts.push(group(indent([line, typeAnnotationDoc])));
  }

  if (
    (key === "callee" && isCallOrNewExpression(parent)) ||
    (key === "object" && isMemberExpression(parent))
  ) {
    return group([indent([softline, ...parts]), softline]);
  }

  return parts;
}

function shouldInlineBinaryCastExpression(path) {
  const { node } = path;
  // Don't break `as const`;
  if (isAsConstExpression(node)) {
    return true;
  }

  const { expression } = node;
  if (isCallOrNewExpression(expression)) {
    return true;
  }

  const { typeAnnotation } = node;
  if (
    isObjectType(typeAnnotation) ||
    isIntersectionType(typeAnnotation) ||
    isGenericType(typeAnnotation) ||
    isFunctionType(typeAnnotation) ||
    isArrayType(typeAnnotation)
  ) {
    return true;
  }

  return false;
}

export { printBinaryCastExpression };
