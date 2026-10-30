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

/** @import {Doc} from "../../document/index.js" */

function printBinaryCastExpression(path, options, print) {
  const { parent, node, key } = path;
  const isFlowAsConstExpression = node.type === "AsConstExpression";
  let expressionDoc = print("expression");
  const typeAnnotationDoc = isFlowAsConstExpression
    ? "const"
    : print("typeAnnotation");
  /** @type {Doc} */
  let suffix = [" ", typeAnnotationDoc];

  // Union type already indented
  if (!isUnionType(node.typeAnnotation)) {
    if (hasLeadingOwnLineComment(options.originalText, node.typeAnnotation)) {
      suffix = indent([hardline, typeAnnotationDoc]);
    } else if (expressionDoc.label?.memberChain) {
      const groupId = Symbol("cast-expression");
      expressionDoc = group(expressionDoc, { id: groupId });
      suffix = indentIfBreak(suffix, { groupId });
    }
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
