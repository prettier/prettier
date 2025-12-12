import { hardline } from "../../document/index.js";
import { isSetextHeading } from "../utilities.js";
import { printChildren } from "./children.js";

function printAtxHeading(path, options, print) {
  return [
    "#".repeat(path.node.depth) + " ",
    printChildren(path, options, print),
  ];
}

function printSetextHeading(path, options, print) {
  const { originalText } = options;
  const { node } = path;
  const end = node.position.end.offset;
  const lineStart = originalText.lastIndexOf("\n", end - 1) + 1;
  const lastLine = originalText.slice(lineStart, end);
  const start = Math.max(lastLine.indexOf("="), lastLine.indexOf("-"));
  const underline = lastLine.slice(start);
  return [printChildren(path, options, print), hardline, underline];
}

function printHeading(path, options, print) {
  if (options.parser !== "mdx" && isSetextHeading(path.node)) {
    return printSetextHeading(path, options, print);
  }

  return printAtxHeading(path, options, print);
}

export { printHeading };
