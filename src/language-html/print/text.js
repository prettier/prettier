/**
 * @import {Doc} from "../../document/index.js"
 */

import {
  breakParent,
  fill,
  hardline,
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

const isAscii = (character) => character.codePointAt(0) <= 0x7f;

function printTextValue(node) {
  const { value } = node;

  if (node.parent.isWhitespaceSensitive) {
    if (node.parent.isIndentationSensitive) {
      return replaceEndOfLine(value);
    }

    return replaceEndOfLine(
      htmlWhitespace.dedentString(htmlTrimPreserveIndentation(value)),
      hardline,
    );
  }

  const parts = htmlWhitespace.split(value, /* captureWhitespace */ true);
  return parts.map((part, index) => {
    if (index % 2 === 0) {
      return part;
    }

    // Only replace line break between ascii characters with space
    if (
      part.includes("\n") &&
      (!isAscii(parts[index - 1].at(-1)) || !isAscii(parts[index + 1][0]))
    ) {
      return hardline;
    }

    return line;
  });
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

  const prefix = printOpeningTagPrefix(node, options);
  const printed = printTextValue(node);

  const suffix = printClosingTagSuffix(node, options);
  // We can't use `fill([prefix, printed, suffix])` because it violates rule of fill: elements with odd indices must be line break
  printed[0] = [prefix, printed[0]];
  printed.push([printed.pop(), suffix]);

  return fill(printed);
}

export { printText };
