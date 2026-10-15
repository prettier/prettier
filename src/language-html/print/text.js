/**
 * @import {Doc} from "../document/index.js"
 */

import {
  breakParent,
  fill,
  hardline,
  replaceEndOfLine,
} from "../document/index.js";
import {
  needsToBorrowPrevClosingTagEndMarker,
  printClosingTagSuffix,
  printOpeningTagPrefix,
} from "./print/tag.js";
import { getTextValueParts } from "./utilities/index.js";

function printText(path, options /* , print*/) {
  const { node } = path;

  if (node.parent.kind === "interpolation") {
    let { value } = node;
    // replace the trailing literalline with hardline for better readability
    const trailingNewlineRegex = /\n[^\S\n]*$/;
    const hasTrailingNewline = trailingNewlineRegex.test(value);

    if (hasTrailingNewline) {
      value = value.replace(trailingNewlineRegex, "");
    }

    const parts = [replaceEndOfLine(value)];

    if (hasTrailingNewline) {
      // The interpolation's trailing softline already prints this newline.
      if (
        node.parent.next &&
        needsToBorrowPrevClosingTagEndMarker(node.parent.next)
      ) {
        parts.push(breakParent);
      } else {
        parts.push(hardline);
      }
    }

    return parts;
  }

  const prefix = printOpeningTagPrefix(node, options);
  const printed = getTextValueParts(node);

  const suffix = printClosingTagSuffix(node, options);
  // We can't use `fill([prefix, printed, suffix])` because it violates rule of fill: elements with odd indices must be line break
  printed[0] = [prefix, printed[0]];
  // @ts-expect-error -- Need investigate how `replaceEndOfLine` works
  printed.push([printed.pop(), suffix]);

  // @ts-expect-error -- Need investigate how `replaceEndOfLine` works
  return fill(printed);
}

export { printText };
