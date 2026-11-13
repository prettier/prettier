import { hardline } from "../../document/index.js";
import printSequence from "./sequence.js";

function printRoot(path, options, print) {
  const { node } = path;
  const nodes = printSequence(path, options, print);

  return [
    node.frontMatter
      ? [print("frontMatter"), hardline, node.nodes.length > 0 ? hardline : ""]
      : "",
    nodes,
    node.nodes.length > 0 ? hardline : "",
  ];
}

function printRootLegacy(path, options, print) {
  const { node } = path;
  const nodes = printSequence(path, options, print);
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

export { printRoot, printRootLegacy };
