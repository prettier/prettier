import {
  group,
  hardline,
  indent,
  indentIfBreak,
  softline,
} from "../../document/index.js";
import { hasLeadingOwnLineComment } from "../utilities/has-leading-own-line-comment.js";
import {
  isCallOrNewExpression,
  isMemberExpression,
  isSatisfiesExpression,
  isUnionType,
} from "../utilities/node-types.js";

function printBinaryCastExpression(path, options, print) {
  const { parent, node, key } = path;
  const isFlowAsConstExpression = node.type === "AsConstExpression";
  const expressionDoc = print("expression");
  const typeAnnotationDoc = isFlowAsConstExpression
    ? "const"
    : print("typeAnnotation");
  let suffix;

  if (
    // Union type already indented
    !isUnionType(node.typeAnnotation) &&
    hasLeadingOwnLineComment(options.originalText, node.typeAnnotation)
  ) {
    suffix = indent([hardline, typeAnnotationDoc]);
  } else {
    suffix = [" ", typeAnnotationDoc];
  }

  if (expressionDoc.label?.memberChain) {
    suffix = indentIfBreak(suffix, {
      groupId: expressionDoc.label.groupId,
    });
  }

  const parts = [
    expressionDoc,
    " ",
    isSatisfiesExpression(node) ? "satisfies" : "as",
    suffix,
  ];

  if (
    (key === "callee" && isCallOrNewExpression(parent)) ||
    (key === "object" && isMemberExpression(parent))
  ) {
    return group([indent([softline, ...parts]), softline]);
  }

  return parts;
}

export { printBinaryCastExpression };
