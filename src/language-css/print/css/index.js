import UnexpectedNodeError from "../../../utilities/unexpected-node-error.js";
import { printCssAtrule } from "./arrule.js";
import { printCssComment } from "./comment.js";
import { printCssDeclaration } from "./declaration.js";
import { printCssRoot } from "./root.js";
import { printCssRule } from "./rule.js";

function printCssNode(path, options, print) {
  const { node } = path;

  switch (node.type) {
    case "css-root":
      return printCssRoot(path, options, print);
    case "css-comment":
      return printCssComment(path, options /* , print */);
    case "css-rule":
      return printCssRule(path, options, print);
    case "css-decl":
      return printCssDeclaration(path, options, print);
    case "css-atrule":
      return printCssAtrule(path, options, print);
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "CSS");
  }
}

export { printCssNode };
