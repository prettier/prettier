import UnexpectedNodeError from "../utilities/unexpected-node-error.js";
import { printCssNode } from "./css/index.js";
import { printMediaQueryNode } from "./media-query/index.js";
import { printSelectorNode } from "./selector/index.js";
import { printValueNode } from "./value-node.js";

function print(path, options, print) {
  const { node } = path;

  if (node.type.startsWith("css-")) {
    return printCssNode(path, options, print);
  }

  if (node.type.startsWith("selector-")) {
    return printSelectorNode(path, options, print);
  }

  if (node.type.startsWith("media-")) {
    return printMediaQueryNode(path, options, print);
  }

  if (node.type.startsWith("value-")) {
    return printValueNode(path, options, print);
  }

  /* c8 ignore next */
  throw new UnexpectedNodeError(node, "PostCSS");
}

export { print };
