import { group, hardline, indent, softline } from "../../document/index.js";
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
  const typeAnnotationDoc = isFlowAsConstExpression
    ? "const"
    : print("typeAnnotation");

  // A comment written on its own line before the type has to stay there. Printing it
  // after the operator makes it a trailing comment, and the next format then moves it
  // to the end of the statement. A union already prints its members on their own
  // lines, so it does not need the break and would be indented twice.
  const keepTypeOnOwnLine =
    !isUnionType(node.typeAnnotation) &&
    hasLeadingOwnLineComment(options.originalText, node.typeAnnotation);

  const parts = [
    print("expression"),
    " ",
    isSatisfiesExpression(node) ? "satisfies" : "as",
    keepTypeOnOwnLine
      ? indent([hardline, typeAnnotationDoc])
      : [" ", typeAnnotationDoc],
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
