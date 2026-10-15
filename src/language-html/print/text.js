/**
 * @import {Doc} from "../../document/index.js"
 */

import {
  breakParent,
  fill,
  hardline,
  join,
  line,
  replaceEndOfLine,
} from "../../document/index.js";
import htmlWhitespace from "../../utilities/html-whitespace.js";
import { htmlTrimPreserveIndentation } from "../utilities/index.js";
import {
  needsToBorrowPrevClosingTagEndMarker,
  printClosingTagSuffix,
  printOpeningTagPrefix,
} from "./tag.js";

function printTextValue(node) {
  const { value } = node;
  return node.parent.isWhitespaceSensitive
    ? node.parent.isIndentationSensitive
      ? replaceEndOfLine(value)
      : replaceEndOfLine(
          htmlWhitespace.dedentString(htmlTrimPreserveIndentation(value)),
          hardline,
        )
    : fill(join(line, htmlWhitespace.split(value)));
}

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

  return [
    printOpeningTagPrefix(node, options),
    printTextValue(node),
    printClosingTagSuffix(node, options),
  ];
}

export { printText };
