import UnexpectedNodeError from "../../utilities/unexpected-node-error.js";
import { printCssAtrule } from "./css-arrule.js";
import { printCssComment } from "./css-comment.js";
import { printCssDeclaration } from "./css-declaration.js";
import { printCssRoot } from "./css-root.js";
import { printCssRule } from "./css-rule.js";

function printCssNode(path, options, print) {
  const { node } = path;

  // TypeScript nodes always starts with `TS`
  if (!node.type.startsWith("css-")) {
    return;
  }

  switch (node.type) {
    case "css-root":
      return printCssRoot(path, options, print);
    case "css-comment":
      return printCssComment(path, options, print);
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
