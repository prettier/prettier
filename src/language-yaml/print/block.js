/** @import {Doc} from "../../document/index.js" */

import {
  dedent,
  dedentToRoot,
  fill,
  hardline,
  join,
  line,
  literalline,
  markAsRoot,
} from "../../document/index.js";
import {
  getBlockValueLineContents,
  hasIndicatorComment,
  hasTrailingContentWhitespace,
  isLastDescendantNode,
} from "../utilities.js";
import { alignWithSpaces } from "./misc.js";

function printBlock(path, options, print) {
  const { node } = path;
  const parent = path.findAncestor(
    (node) => node.type === "sequenceItem" || node.type === "mappingItem",
  );
  // Read the scalar relative to its original parent indentation. The parent
  // may move when we normalize indentation, for example an indentless sequence.
  const parentIndent = parent ? parent.position.start.column - 1 : 0;
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
    contentsParts.push(fill(join(line, lineWords)));
    if (index !== lineContents.length - 1) {
      contentsParts.push(
        lineWords.length === 0 ? hardline : markAsRoot(literalline),
      );
    } else if (
      (isLastDescendant && node.chomping === "keep") ||
      hasTrailingContentWhitespace(node)
    ) {
      contentsParts.push(
        isLastDescendant
          ? dedentToRoot(lineWords.length === 0 ? hardline : literalline)
          : dedent(lineWords.length === 0 ? hardline : literalline),
      );
    }
  }
  if (node.indent === null) {
    parts.push(dedent(alignWithSpaces(options.tabWidth, contentsParts)));
  } else {
    parts.push(dedent(alignWithSpaces(node.indent, contentsParts)));
  }

  return parts;
}

export default printBlock;
