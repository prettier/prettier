import { isNewLine } from "../utilities.js";

const tableDelimiterCellRegex = /^ *:?-+:? *$/;
const tableDelimiterRowStartRegex = /^[ |:-]+$/;

/**
 * The indentation of a line is dropped when the paragraph is printed, so a
 * delimiter row that was too indented to start a table becomes one.
 *
 * Only the word's own shape is checked, so a dedented `|---|---|` is escaped
 * even where GFM wouldn't have made a table out of it anyway, e.g. after a
 * one-cell line like `foo`. The extra backslash renders the same.
 *
 * @param {string} value
 * @returns {boolean}
 */
function isFakeTableDelimiterRow(value) {
  return (
    tableDelimiterRowStartRegex.test(value) &&
    splitCells(value).every((cell) => tableDelimiterCellRegex.test(cell))
  );
}

/**
 * Callers only ever pass a value that already matched `tableDelimiterRowStartRegex`
 * (space, `|`, `:`, `-`), so there's no `\` in it to escape a `|` with.
 *
 * @param {string} row
 * @returns {string[]}
 */
function splitCells(row) {
  // https://github.github.com/gfm/#tables-extension-
  const cells = row.split("|");

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
 * A delimiter row with spaces around its cells, e.g. `| --- | --- |`, is
 * split into several sibling word nodes by the whitespace in between, so
 * checking a single word alone (`|`) misses it. Starting at `startIndex`,
 * collect consecutive delimiter-row-shaped words up to the next newline and
 * check the reconstructed line instead.
 *
 * @param {import("../utilities.js").TextNode[]} siblings
 * @param {number} startIndex
 * @returns {boolean}
 */
function isFakeTableDelimiterRowLine(siblings, startIndex) {
  const words = [];
  for (let i = startIndex; i < siblings.length; i++) {
    const sibling = siblings[i];
    if (sibling.type === "whitespace") {
      if (isNewLine(sibling)) {
        break;
      }
      continue;
    }
    if (
      sibling.type !== "word" ||
      !tableDelimiterRowStartRegex.test(sibling.value)
    ) {
      break;
    }
    words.push(sibling.value);
  }
  return isFakeTableDelimiterRow(words.join(" "));
}

export { isFakeTableDelimiterRowLine };
