import { group, indent, softline } from "../../document/builders.js";
import { isCallExpression, isMemberExpression } from "../utils/index.js";

function printBinaryCastExpression(path, options, print) {
  const { parent, node, key } = path;
  const parts = [print("expression")];
  switch (node.type) {
    case "AsConstExpression":
      parts.push(" as const");
      break;
    case "AsExpression":
    case "TSAsExpression":
      parts.push(" as ", print("typeAnnotation"));
      break;
    case "SatisfiesExpression":
    case "TSSatisfiesExpression":
      parts.push(" satisfies ", print("typeAnnotation"));
      break;
  }

  if (
    (key === "callee" && isCallExpression(parent)) ||
    (key === "object" && isMemberExpression(parent))
  ) {
    return group([indent([softline, ...parts]), softline]);
  }
  return parts;
}

export { printBinaryCastExpression };
