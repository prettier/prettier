"use strict";

/** @typedef {import("../../document").Doc} Doc */

const {
  builders: {
    dedent,
    dedentToRoot,
    fill,
    hardline,
    join,
    line,
    literalline,
    markAsRoot,
  },
  utils: { getDocParts },
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
  /** @type {Doc[]} */
  const parts = [node.type === "blockFolded" ? ">" : "|"];
  if (node.indent !== null) {
    parts.push(node.indent.toString());
  }

  if (node.chomping !== "clip") {
    parts.push(node.chomping === "keep" ? "+" : "-");
  }

  if (hasIndicatorComment(node)) {
    parts.push(" ", print("indicatorComment"));
  }

  const lineContents = getBlockValueLineContents(node, {
    parentIndent,
    isLastDescendant,
    options,
  });
  /** @type {Doc[]} */
  const contentsParts = [];
  for (const [index, lineWords] of lineContents.entries()) {
    if (index === 0) {
      contentsParts.push(hardline);
    }
    contentsParts.push(fill(getDocParts(join(line, lineWords))));
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
  if (node.indent === null) {
    parts.push(dedent(alignWithSpaces(options.tabWidth, contentsParts)));
  } else {
    parts.push(
      dedentToRoot(
        alignWithSpaces(node.indent - 1 + parentIndent, contentsParts)
      )
    );
  }

  return parts;
}

module.exports = printBlock;
