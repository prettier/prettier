import { line } from "../../../document/index.js";
import { isNthPseudoClassNode } from "../../utilities/index.js";
import { adjustNumbers, adjustStrings } from "../misc.js";

function printCombinatorSelector(path, options /* , print*/) {
  const { node } = path;
  if (
    node.value === "+" ||
    node.value === ">" ||
    node.value === "~" ||
    node.value === ">>>"
  ) {
    const parentNode = path.parent;
    const isFirstNode =
      parentNode.type === "selector-selector" && parentNode.nodes[0] === node;
    const leading = isFirstNode ? "" : line;

    // The leading `+` in An+B notation (e.g. `:nth-child(+2n)`) must stay
    // glued to the following token, a space there is invalid per spec.
    const isNthLeadingSign =
      isFirstNode &&
      node.value === "+" &&
      isNthPseudoClassNode(path.grandparent);

    return [leading, node.value, path.isLast || isNthLeadingSign ? "" : " "];
  }

  const leading = node.value.trimStart().startsWith("(") ? line : "";
  const value =
    adjustNumbers(adjustStrings(node.value.trim(), options)) || line;

  return [leading, value];
}

export { printCombinatorSelector };
