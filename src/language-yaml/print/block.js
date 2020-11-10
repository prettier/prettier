"use strict";
const {
  builders: {
    concat,
    dedent,
    dedentToRoot,
    fill,
    hardline,
    join,
    line,
    literalline,
    markAsRoot,
  },
} = require("../../document");
const {
  getAncestorCount,
  getBlockValueLineContents,
  hasIndicatorComment,
  isLastDescendantNode,
  isNode,
} = require("../utils");
const { alignWithSpaces } = require("./misc");

function printBlock(path, print, options) {
  const node = path.getValue();
  const parentIndent = getAncestorCount(path, (ancestorNode) =>
    isNode(ancestorNode, ["sequence", "mapping"])
  );
  const isLastDescendant = isLastDescendantNode(path);
  const parts = [node.type === "blockFolded" ? ">" : "|"];
  if (node.indent !== null) {
    parts.push(node.indent.toString());
  }

  if (node.chomping !== "clip") {
    parts.push(node.chomping === "keep" ? "+" : "-");
  }

  if (hasIndicatorComment(node)) {
    parts.push(concat([" ", path.call(print, "indicatorComment")]));
  }

  const lineContents = getBlockValueLineContents(node, {
    parentIndent,
    isLastDescendant,
    options,
  });
  const contentsParts = [];
  for (const [index, lineWords] of lineContents.entries()) {
    if (index === 0) {
      contentsParts.push(hardline);
    }
    contentsParts.push(fill(join(line, lineWords).parts));
    if (index !== lineContents.length - 1) {
      contentsParts.push(
        lineWords.length === 0 ? hardline : markAsRoot(literalline)
      );
    } else if (node.chomping === "keep" && isLastDescendant) {
      contentsParts.push(
        dedentToRoot(lineWords.length === 0 ? hardline : literalline)
      );
    }
  }
  const contents = alignWithSpaces(
    node.indent === null ? options.tabWidth : node.indent - 1 + parentIndent,
    concat(contentsParts)
  );
  parts.push(node.indent === null ? dedent(contents) : dedentToRoot(contents));

  return concat(parts);
}

module.exports = printBlock;
