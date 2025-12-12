import { replaceEndOfLine } from "../../document/index.js";
import { isSetextHeading } from "../utilities.js";
import { printChildren } from "./children.js";

function printAtxHeading(path, options, print) {
  return [
    "#".repeat(path.node.depth) + " ",
    printChildren(path, options, print),
  ];
}

function printSetextHeading(path, options) {
  const { originalText } = options;
  // https://spec.commonmark.org/0.31.2/#example-215
  const { node, isFirst } = path;
  let start = node.position.start.offset;
  if (!isFirst) {
    const { previous } = path;
    if (node.position.start.line < previous.position.end.line) {
      const lineBefore = originalText.indexOf(
        "\n",
        previous.position.end.offset,
      );
      if (lineBefore !== -1) {
        start = lineBefore + 1;
      }
    }
  }

  // Not correctly handing descendants of `listItem` or `blockquote` correctly

  return originalText.slice(start, node.position.end.offset);
}

function printHeading(path, options, print) {
  if (options.parser !== "mdx" && isSetextHeading(path.node)) {
    return printSetextHeading(path, options);
  }

  return printAtxHeading(path, options, print);
}

export { printHeading };
