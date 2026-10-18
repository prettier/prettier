import { group, hardline, indent, softline, willBreak } from "../../document/index.js";
import { hasLeadingOwnLineComment } from "../utilities/has-leading-own-line-comment.js";
import {
  isCallExpression,
  isCallOrNewExpression,
  isMemberExpression,
  isObjectType,
  isSatisfiesExpression,
  isUnionType,
} from "../utilities/node-types.js";

function printBinaryCastExpression(path, options, print) {
  const { parent, node, key } = path;
  const isFlowAsConstExpression = node.type === "AsConstExpression";
  const typeAnnotationDoc = isFlowAsConstExpression
    ? "const"
    : print("typeAnnotation");

  const expressionDoc = print("expression");
  const parts = [
    expressionDoc,
    " ",
    isSatisfiesExpression(node) ? "satisfies" : "as",
  ];

  // A broken member chain indents its later calls, but the type following
  // `as` or `satisfies` is printed at the enclosing indentation level.
  const indentTypeAfterChain =
    isObjectType(node.typeAnnotation) &&
    isCallExpression(node.expression) &&
    isMemberExpression(node.expression.callee) &&
    willBreak(expressionDoc);

  if (
    // Union type already indented
    !isUnionType(node.typeAnnotation) &&
    hasLeadingOwnLineComment(options.originalText, node.typeAnnotation)
  ) {
    parts.push(indent([hardline, typeAnnotationDoc]));
  } else {
    parts.push(" ", indentTypeAfterChain ? indent(typeAnnotationDoc) : typeAnnotationDoc);
  }

  if (
    (key === "callee" && isCallOrNewExpression(parent)) ||
    (key === "object" && isMemberExpression(parent))
  ) {
    return group([indent([softline, ...parts]), softline]);
  }

  return parts;
}

export { printBinaryCastExpression };
