import { printChildren } from "./children.js";

function printAtxHeading(path, options, print) {
  return [
    "#".repeat(path.node.depth) + " ",
    printChildren(path, options, print),
  ];
}

function printHeading(path, options, print) {
  if (options.parser !== "mdx") {
    const { start, end } = path.node.position;

    if (start.line !== end.line) {
      return options.originalText.slice(start.offset, end.offset);
    }
  }

  return printAtxHeading(path, options, print);
}

export { printHeading };
