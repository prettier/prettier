import { PUNCTUATION_REGEXP } from "../constants.evaluate.js";
import {
  isAutolink,
  isNewLine,
  LINE_LEADING_MARKER_REGEXP,
} from "../utilities.js";

const fakeSetextHeaderRegex = /^(?:=+|-+)$/;
// A single cell of a table delimiter row, https://github.github.com/gfm/#delimiter-row
const tableDelimiterCellRegex = /^[\t ]*:?-+:?[\t ]*$/;

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

/**
 * A table delimiter row inside a paragraph is plain text only because it is
 * indented, and printing drops that indentation. Tell whether the line starting
 * at the current `word` is such a row, so that it can be escaped.
 * @param {AstPath} path
 * @returns {boolean}
 */
function isFakeTableDelimiterRow(path) {
  const { siblings, index } = path;
  let row = "";
  for (let i = index; i < siblings.length; i++) {
    const node = siblings[i];
    if (isNewLine(node)) {
      break;
    }
    if (node.type !== "word" && node.type !== "whitespace") {
      // a delimiter row consists of `|`, `-`, `:`, and spaces only
      return false;
    }
    row += node.value;
  }

  const cells = row.split("|");
  // a delimiter row may start and/or end with a `|`
  if (cells.length > 1) {
    if (cells[0].trim() === "") {
      cells.shift();
    }
    if (cells.at(-1).trim() === "") {
      cells.pop();
    }
  }

  return (
    cells.length > 0 &&
    cells.every((cell) => tableDelimiterCellRegex.test(cell))
  );
}

/**
 * @param {AstPath} path
 * @param {*} options
 * @return {Doc}
 */
function printWord(path, options) {
  const { node } = path;
  const emphasisOrStrong = path.findAncestor(
    (p) => p.type === "emphasis" || p.type === "strong",
  );
  let text = node.value;
  if (!emphasisOrStrong) {
    // the indentation of a line inside a paragraph is dropped, so a line that
    // owes its meaning to it has to be escaped
    if (
      options.proseWrap === "preserve" &&
      path.parent.type === "sentence" &&
      isNewLine(path.previous)
    ) {
      if (
        fakeSetextHeaderRegex.test(text) &&
        (path.isLast || isNewLine(path.next))
      ) {
        // escape indented pseudo setext header, e.g. `Previous line↵␣␣␣␣===`
        return `\\${text}`;
      }

      if (
        // a line starting with one of these is joined with the previous line
        // instead, which already keeps the meaning of the line unchanged
        !LINE_LEADING_MARKER_REGEXP.test(text) &&
        isFakeTableDelimiterRow(path)
      ) {
        // escape indented pseudo table delimiter row,
        // e.g. `| a | b |↵␣␣␣␣| - | - |`
        return `\\${text}`;
      }
    }

    return text;
  }

  // escape leading `*` or `_` if it's the first character in an emphasis/strong
  if (
    path.isFirst &&
    (text.startsWith("*") || text.startsWith("_")) &&
    path.callParent(() => path.isFirst) &&
    path.grandparent === emphasisOrStrong
  ) {
    text = `\\${text}`;
  }

  // escape internal `*` or `_` that can open or close emphasis/strong
  text = text.replaceAll(
    /(\\+|^|.)(\*+|_+)($|.)/g,
    (match, preceding, delimiterRun, following) => {
      if (
        [...preceding].every((c) => c === "\\") &&
        preceding.length % 2 === 1
      ) {
        // already escaped
        return match;
      }
      if (
        canOpenOrCloseStrongOrEmphasis(
          preceding.at(-1) || path.previous?.value.at(-1),
          delimiterRun,
          following[0] || path.next?.value[0],
        )
      ) {
        return `${preceding}\\${delimiterRun}${following}`;
      }
      return match;
    },
  );

  return text;
}

/**
 * @param {string | undefined} preceding
 * @param {string} delimiterRun
 * @param {string | undefined} following
 * @returns {boolean | null}
 */
function canOpenOrCloseStrongOrEmphasis(preceding, delimiterRun, following) {
  if (!preceding || !following) {
    return null; // cannot determine
  }

  // https://spec.commonmark.org/0.31.2/#emphasis-and-strong-emphasis
  const followedByWhitespace = /[\p{Space_Separator}\t\n\f\r]/u.test(following);
  const precededByWhitespace = /[\p{Space_Separator}\t\n\f\r]/u.test(preceding);
  const followedByPunctuation = PUNCTUATION_REGEXP.test(following);
  const precededByPunctuation = PUNCTUATION_REGEXP.test(preceding);

  const isLeftFlanking =
    !followedByWhitespace &&
    (!followedByPunctuation ||
      (followedByPunctuation &&
        (precededByWhitespace || precededByPunctuation)));
  const isRightFlanking =
    !precededByWhitespace &&
    (!precededByPunctuation ||
      (precededByPunctuation &&
        (followedByWhitespace || followedByPunctuation)));

  const indicator = delimiterRun[0];
  if (indicator === "*") {
    return isLeftFlanking || isRightFlanking;
  }

  if (isLeftFlanking) {
    return !isRightFlanking || precededByPunctuation;
  }

  if (isRightFlanking) {
    return !isLeftFlanking || followedByPunctuation;
  }

  return false;
}

/**
 * @param {AstPath} path
 * @return {Doc}
 */
function printWordLegacy(path) {
  const { node } = path;
  let escapedValue = node.value
    .replaceAll("*", String.raw`\*`) // escape all `*`
    .replaceAll(
      new RegExp(
        [
          `(^|${PUNCTUATION_REGEXP.source})(_+)`,
          `(_+)(${PUNCTUATION_REGEXP.source}|$)`,
        ].join("|"),
        "gu",
      ),
      (_, text1, underscore1, underscore2, text2) =>
        (underscore1
          ? `${text1}${underscore1}`
          : `${underscore2}${text2}`
        ).replaceAll("_", String.raw`\_`),
    ); // escape all `_` except concating with non-punctuation, e.g. `1_2_3` is not considered emphasis

  const isFirstSentence = (node, name, index) =>
    node.type === "sentence" && index === 0;
  const isLastChildAutolink = (node, name, index) =>
    isAutolink(node.children[index - 1]);

  if (
    escapedValue !== node.value &&
    (path.match(undefined, isFirstSentence, isLastChildAutolink) ||
      path.match(
        undefined,
        isFirstSentence,
        (node, name, index) => node.type === "emphasis" && index === 0,
        isLastChildAutolink,
      ))
  ) {
    // backslash is parsed as part of autolinks, so we need to remove it
    escapedValue = escapedValue.replace(/^(\\?[*_])+/, (prefix) =>
      prefix.replaceAll("\\", ""),
    );
  }

  return escapedValue;
}

export { printWord, printWordLegacy };
