import { group, indent, line, softline } from "../../document/index.js";
import {
  isAsConstExpression,
  isFlowAsConstExpression,
} from "../utilities/is-as-const-expression.js";
import {
  isCallOrNewExpression,
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

  if (shouldInline(path)) {
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

function shouldInline(path) {
  const { node } = path;
  // Don't break `as const`;
  if (isAsConstExpression(node)) {
    return true;
  }

  const { typeAnnotation } = node;
  if (isObjectType(typeAnnotation)) {
    return true;
  }

  return false;
}

export { printBinaryCastExpression };
