import { group, indent, softline } from "../../document/index.js";
import {
  createTypeCheckFunction,
  isCallExpression,
  isMemberExpression,
} from "../utilities/index.js";

const isSatisfiesExpression = createTypeCheckFunction([
  "SatisfiesExpression",
  "TSSatisfiesExpression",
]);

function printBinaryCastExpression(path, options, print) {
  const { parent, node, key } = path;
  const isFlowAsConstExpression = node.type === "AsConstExpression";
  const typeAnnotationDoc = isFlowAsConstExpression
    ? "const"
    : print("typeAnnotation");

  const parts = [
    print("expression"),
    " ",
    isSatisfiesExpression(node) ? "satisfies" : "as",
    " ",
    typeAnnotationDoc,
  ];

  if (
    (key === "callee" && isCallExpression(parent)) ||
    (key === "object" && isMemberExpression(parent))
  ) {
    return group([indent([softline, ...parts]), softline]);
  }

  return parts;
}

export { printBinaryCastExpression };
