import { PUNCTUATION_REGEXP } from "../constants.evaluate.js";
import { isAutolink, isNewLine } from "../utilities.js";

const fakeSetextHeaderRegex = /^(?:=+|-+)$/;
const tableDelimiterCellRegex = /^ *:?-+:? *$/;
const tableDelimiterRowStartRegex = /^[|:-]+$/;

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

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
    if (
      options.proseWrap === "preserve" &&
      path.parent.type === "sentence" &&
      fakeSetextHeaderRegex.test(text) &&
      isNewLine(path.previous) &&
      (path.isLast || isNewLine(path.next))
    ) {
      // escape indented pseudo setext header, e.g. `Previous line↵␣␣␣␣===`
      return `\\${text}`;
    }

    if (
      options.proseWrap === "preserve" &&
      path.parent.type === "sentence" &&
      tableDelimiterRowStartRegex.test(text) &&
      isNewLine(path.previous) &&
      isFakeTableDelimiterRow(path, options)
    ) {
      // escape indented pseudo table delimiter row, e.g. `| x | y |↵␣␣␣␣|---|---|`
      return `\\${text}`;
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
 * The indentation of a line is dropped when the paragraph is printed, so a
 * delimiter row that was too indented to start a table becomes one.
 *
 * @param {AstPath} path
 * @param {*} options
 * @returns {boolean}
 */
function isFakeTableDelimiterRow(path, options) {
  const lines = [[]];
  for (const child of path.grandparent.children) {
    for (const node of child.type === "sentence" ? child.children : [child]) {
      if (isNewLine(node)) {
        lines.push([]);
      } else {
        lines.at(-1).push(node);
      }
    }
  }

  const index = lines.findIndex((line) => line[0] === path.node);
  if (index < 1) {
    return false;
  }

  const delimiterRow = getRowText(lines[index], options);
  const headerRow = getRowText(lines[index - 1], options);
  if (delimiterRow === undefined || headerRow === undefined) {
    return false;
  }

  const delimiterCells = splitCells(delimiterRow);
  return (
    delimiterCells.every((cell) => tableDelimiterCellRegex.test(cell)) &&
    splitCells(headerRow).length === delimiterCells.length
  );
}

/**
 * @param {*[]} line
 * @param {*} options
 * @returns {string | undefined} `undefined` if the line can't be read as text
 */
function getRowText(line, options) {
  let text = "";
  for (const node of line) {
    if (node.type === "word" || node.type === "whitespace") {
      text += node.value;
      continue;
    }
    const source = options.originalText.slice(
      node.position.start.offset,
      node.position.end.offset,
    );
    if (source.includes("\n")) {
      return;
    }
    text += source;
  }
  return text;
}

/**
 * @param {string} row
 * @returns {string[]}
 */
function splitCells(row) {
  // https://github.github.com/gfm/#tables-extension-
  const cells = [""];
  for (let index = 0; index < row.length; index++) {
    const character = row[index];
    if (character === "\\") {
      cells[cells.length - 1] += row.slice(index, index + 2);
      index++;
    } else if (character === "|") {
      cells.push("");
    } else {
      cells[cells.length - 1] += character;
    }
  }

  // The leading and trailing pipes are optional
  if (cells.length > 1 && cells[0] === "") {
    cells.shift();
  }
  if (cells.length > 1 && cells.at(-1) === "") {
    cells.pop();
  }

  return cells;
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
