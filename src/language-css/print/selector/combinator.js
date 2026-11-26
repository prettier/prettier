import { line } from "../../../document/index.js";
import { isNthPseudoClassNode } from "../../utilities/index.js";
import { adjustNumbers, adjustStrings } from "../misc.js";
import { printSelectorSpace } from "./space.js";

function printCombinatorSelector(path, options /* , print */) {
  const { node } = path;
  const { rawSpaceBefore } = node;
  const hasLeadingComment = rawSpaceBefore.includes("/*");
  if (
    node.value === "+" ||
    node.value === ">" ||
    node.value === "~" ||
    node.value === ">>>" ||
    /^\/[\w-]+\/$/.test(node.value)
  ) {
    const parentNode = path.parent;
    const isFirstNode =
      parentNode.type === "selector-selector" && parentNode.nodes[0] === node;
    const leading = hasLeadingComment
      ? [printSelectorSpace(rawSpaceBefore.trimEnd()), line]
      : isFirstNode
        ? ""
        : line;

    // The leading `+` in An+B notation (e.g. `:nth-child(+2n)`) must stay
    // glued to the following token, a space there is invalid per spec.
    const isNthLeadingSign =
      node.value === "+" &&
      isNthPseudoClassNode(path.grandparent) &&
      parentNode.nodes.find((node) => node.type !== "selector-comment") ===
        node;

    return [
      leading,
      // postcss-selector-parser lowercases a named combinator like `/DEEP/`,
      // the original text is kept in `raws.value`
      // https://github.com/postcss/postcss-selector-parser/blob/44deaeb329a74aedb1e21709028bd2566a6b24fc/src/parser.js#L643-L646
      node.raws?.value ?? node.value,
      path.isLast || isNthLeadingSign ? "" : " ",
    ];
  }

  if (node.value === " ") {
    const raw = String(node);
    return raw.includes("/*") ? printSelectorSpace(raw) : line;
  }

  if (hasLeadingComment) {
    return [
      printSelectorSpace(rawSpaceBefore),
      node.raws?.value ?? node.value,
      node.spaces.after && !path.isLast ? line : "",
    ];
  }

  const leading = node.value.trimStart().startsWith("(") ? line : "";
  const value =
    adjustNumbers(adjustStrings(node.value.trim(), options)) || line;

  return [leading, value];
}

export { printCombinatorSelector };
