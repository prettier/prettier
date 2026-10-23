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

/**
@import {Doc} from "../../document/index.js"
*/

function printTextValue(node) {
  const { value } = node;
  return node.parent.isWhitespaceSensitive
    ? node.parent.isIndentationSensitive
      ? replaceEndOfLine(value)
      : replaceEndOfLine(
          htmlWhitespace.dedentString(htmlTrimPreserveIndentation(value)),
          hardline,
        )
    : join(line, htmlWhitespace.split(value));
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

  const printed = printTextValue(node);
  const prefix = printOpeningTagPrefix(node, options);
  const suffix = printClosingTagSuffix(node, options);

  // We can't use `fill([prefix, printed, suffix])` because it violates rule of fill: elements with odd indices must be line break
  if (prefix) {
    printed[0] = [prefix, printed[0]];
  }
  if (suffix) {
    // @ts-expect-error -- Need investigate how `replaceEndOfLine` works
    printed.push([printed.pop(), suffix]);
  }

  // @ts-expect-error -- Need investigate how `replaceEndOfLine` works
  return fill(printed);
}

export { printText };
