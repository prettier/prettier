import {
  assertDocArray,
  breakParent,
  fill,
  hardline,
  join,
  line,
  replaceEndOfLine,
} from "../../document/index.js";
import {
  CJK_REGEXP,
  PUNCTUATION_REGEXP,
} from "../../language-markdown/constants.evaluate.js";
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

function printTextValue(node, options) {
  const { value } = node;
  return node.parent.isWhitespaceSensitive
    ? node.parent.isIndentationSensitive
      ? replaceEndOfLine(value)
      : replaceEndOfLine(
          htmlWhitespace.dedentString(htmlTrimPreserveIndentation(value)),
          hardline,
        )
    : // Angular does not follow newline conversion rules aligned with the current CSS specifications.
      options.parser === "angular"
      ? join(line, htmlWhitespace.split(value))
      : joinCjkSensitiveParts(htmlWhitespace.split(value, true));
}

/**
 * @param {string[]} docs
 * @returns {(string | typeof line | typeof hardline)[]}
 */
function joinCjkSensitiveParts(docs) {
  assertDocArray(docs);

  /** @type {(string | typeof line | typeof hardline)[]} */
  const parts = [];
  let previous = docs[0];
  if (previous) {
    parts.push(previous);
  }
  for (let i = 1; i < docs.length; i++) {
    const spaces = docs[i++];
    const next = docs[i];
    if (previous && next) {
      const previousCategory = getCharacterCategory(
        getLastPrintableCharacter(previous),
      );
      const nextCategory = getCharacterCategory(getFirstCharacter(next));
      const keepNewLine =
        (previousCategory !== "other" && nextCategory !== "other") ||
        // Line breaks around ideographic punctuation are simply removed
        // only when the element's `lang` is zh or ja
        previousCategory === "ideoPunctuation" ||
        nextCategory === "ideoPunctuation";
      if (keepNewLine) {
        if (spaces.includes("\n")) {
          parts.push(hardline);
        } else {
          parts[parts.length - 1] += ` ${next}`;
          previous = next;
          continue;
        }
      } else {
        parts.push(line);
      }
    }
    if (next) {
      parts.push(next);
    }
    previous = next;
  }
  return parts;
}

/**
 *
 * @param {string} char
 * @returns {"other" | "ideoLetter" | "ideoPunctuation"}
 */
function getCharacterCategory(char) {
  if (!char || char.codePointAt(0) < 0x231a) {
    return "other";
  }
  if (PUNCTUATION_REGEXP.test(char)) {
    return "ideoPunctuation";
  }
  if (CJK_REGEXP.test(char) && !/^\p{Script=Hangul}/u.test(char)) {
    return "ideoLetter";
  }
  return "other";
}

/**
 * @param {string} str
 * @returns string
 */
function getFirstCharacter(str) {
  return str[Symbol.iterator]().next().value ?? "";
}

function getLastPrintableCharacter(str) {
  for (const char of enumerateCharacterReversed(str)) {
    if (/\p{Default_Ignorable_Code_Point}/u.test(char)) {
      continue;
    }
    return char;
  }
  return "";
}

/**
 * @param {string} str
 * @returns {Generator<string>}
 */
function* enumerateCharacterReversed(str) {
  if (str.length === 0) {
    return;
  }
  let i = str.length - 1;
  do {
    const bmpOrLastCode = str.charCodeAt(i);
    const bmpOrLast = str[i];
    if (bmpOrLastCode < 0xdc00 || bmpOrLastCode >= 0xe000 || i === 0) {
      yield bmpOrLast;
    } else if (str.codePointAt(i - 1) >= 0x10000) {
      yield str[--i] + bmpOrLast;
    } /* c8 ignore next */
    else {
      yield bmpOrLast;
    }
  } while (i-- !== 0);
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
  const printed = printTextValue(node, options);

  const suffix = printClosingTagSuffix(node, options);
  // We can't use `fill([prefix, printed, suffix])` because it violates rule of fill: elements with odd indices must be line break
  printed[0] = [prefix, printed[0]];
  // @ts-expect-error -- Need investigate how `replaceEndOfLine` works
  printed.push([printed.pop(), suffix]);

  // @ts-expect-error -- Need investigate how `replaceEndOfLine` works
  return fill(printed);
}

export { printText };
