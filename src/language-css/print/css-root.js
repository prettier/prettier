import { hardline } from "../../document/index.js";
import printSequence from "./sequence.js";

function printCssRoot(path, options, print) {
  const nodes = printSequence(path, options, print);
  const { node } = path;
  let after = node.raws.after.trim();
  if (after.startsWith(";")) {
    after = after.slice(1).trim();
  }

  return [
    node.frontMatter
      ? [print("frontMatter"), hardline, node.nodes.length > 0 ? hardline : ""]
      : "",
    nodes,
    after ? ` ${after}` : "",
    node.nodes.length > 0 ? hardline : "",
  ];
}

export { printCssRoot };
