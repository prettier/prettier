/** @import {Doc} from "../../document/builders.js" */

import {
  dedent,
  dedentToRoot,
  fill,
  hardline,
  join,
  line,
  literalline,
  markAsRoot,
} from "../../document/builders.js";
import {
  getBlockValueLineContents,
  hasIndicatorComment,
  isLastDescendantNode,
} from "../utils.js";
import { alignWithSpaces } from "./misc.js";

function printBlock(path, options, print) {
  const { node } = path;
  const parentIndent = path.ancestors.filter(
    (node) => node.type === "sequence" || node.type === "mapping",
  ).length;
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
    } else if (node.chomping === "keep" && isLastDescendant) {
      contentsParts.push(
        dedentToRoot(lineWords.length === 0 ? hardline : literalline),
      );
    }
  }
  if (node.indent === null) {
    parts.push(dedent(alignWithSpaces(options.tabWidth, contentsParts)));
  } else {
    parts.push(
      dedentToRoot(
        alignWithSpaces(node.indent - 1 + parentIndent, contentsParts),
      ),
    );
  }

  return parts;
}

export default printBlock;
