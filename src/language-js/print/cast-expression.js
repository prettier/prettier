import { group, indent,softline } from "../../document/builders.js";
import { isCallExpression, isMemberExpression } from "../utils/index.js";

function printBinaryCastExpression(path, options, print) {
  const { parent, node } = path;
  let parts = [];
  switch (node.type) {
    case "AsConstExpression":
      parts = [print("expression"), " as const"];
      break;
    case "AsExpression":
    case "TSAsExpression":
      parts = [print("expression"), " ", "as", " ", print("typeAnnotation")];
      break;
    case "SatisfiesExpression":
    case "TSSatisfiesExpression":
      parts = [
        print("expression"),
        " ",
        "satisfies",
        " ",
        print("typeAnnotation"),
      ];
      break;
  }

  if (
    (isCallExpression(parent) && parent.callee === node) ||
    (isMemberExpression(parent) && parent.object === node)
  ) {
    return group([indent([softline, ...parts]), softline]);
  }
  return parts;
}

export { printBinaryCastExpression };
