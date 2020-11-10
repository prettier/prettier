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
  return concat([
    node.type === "blockFolded" ? ">" : "|",
    node.indent === null ? "" : node.indent.toString(),
    node.chomping === "clip" ? "" : node.chomping === "keep" ? "+" : "-",
    hasIndicatorComment(node)
      ? concat([" ", path.call(print, "indicatorComment")])
      : "",
    (node.indent === null ? dedent : dedentToRoot)(
      alignWithSpaces(
        node.indent === null
          ? options.tabWidth
          : node.indent - 1 + parentIndent,
        concat(
          getBlockValueLineContents(node, {
            parentIndent,
            isLastDescendant,
            options,
          }).reduce(
            (reduced, lineWords, index, lineContents) =>
              reduced.concat(
                index === 0 ? hardline : "",
                fill(join(line, lineWords).parts),
                index !== lineContents.length - 1
                  ? lineWords.length === 0
                    ? hardline
                    : markAsRoot(literalline)
                  : node.chomping === "keep" && isLastDescendant
                  ? lineWords.length === 0
                    ? dedentToRoot(hardline)
                    : dedentToRoot(literalline)
                  : ""
              ),
            []
          )
        )
      )
    ),
  ]);
}

module.exports = printBlock;
