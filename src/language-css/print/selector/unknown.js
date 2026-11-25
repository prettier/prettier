import { breakParent } from "../../../document/index.js";
import { locEnd, locStart } from "../../loc.js";
import {
  lastLineHasInlineComment,
  maybeToLowerCase,
} from "../../utilities/index.js";
import { adjustNumbers, adjustStrings } from "../misc.js";

function printUnknownSelector(path, options /* , print */) {
  const { node } = path;
  const ruleAncestorNode = path.findAncestor(
    (node) => node.type === "css-rule",
  );

  // Nested SCSS property
  if (ruleAncestorNode?.isScssNestedProperty) {
    return adjustNumbers(adjustStrings(maybeToLowerCase(node.value), options));
  }

  const parentNode = path.parent;
  if (parentNode.raws?.selector) {
    return parentNode.raws.selector;
  }

  // Same reason above
  const grandParent = path.grandparent;
  if (
    parentNode.type === "value-paren_group" &&
    grandParent?.type === "value-func" &&
    grandParent.value === "selector"
  ) {
    const start = locEnd(parentNode.open) + 1;
    const end = locStart(parentNode.close);
    const selector = options.originalText.slice(start, end).trim();

    return lastLineHasInlineComment(selector)
      ? [breakParent, selector]
      : selector;
  }

  return node.value;
}

export { printUnknownSelector };
