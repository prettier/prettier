import { hardline, line, softline } from "../document/builders.js";

/**
 * @import {WordNode, WhitespaceValue, WordKind} from "./utils.js"
 * @import AstPath from "../common/ast-path.js"
 * @typedef {"always" | "never" | "preserve"} ProseWrap
 * @typedef {{ next?: WordNode | null, previous?: WordNode | null }}
 * AdjacentNodes Nodes adjacent to a `whitespace` node. Are always of type
 * `word`.
 */

const SINGLE_LINE_NODE_TYPES = new Set([
  "heading",
  "tableCell",
  "link",
  "wikiLink",
]);

/**
 * Check whether the given `"\n"` node can be converted to a space.
 *
 * For example, if you would like to squash English text
 *
 *     "You might want\nto use Prettier."
 *
 * into a single line, you would replace `"\n"` with `" "`:
 *
 *     "You might want to use Prettier."
 *
 * However, Chinese and Japanese don't use U+0020 Space to divide words, so line
 * breaks shouldn't be replaced with spaces for those languages.
 *
 * PRs are welcome to support line breaking rules for other languages.
 *
 * @param {AstPath} path
 * @param {boolean} isLink
 * @returns {boolean}
 */
function lineBreakCanBeConvertedToSpace(path, isLink) {
  if (isLink) {
    return true;
  }

  /** @type {AdjacentNodes} */
  const { previous, next } = path;

  // e.g. " \nletter"
  if (!previous || !next) {
    return true;
  }

  // Do not convert \n to a space when it is surrounded only by Chinese or Japanese.
  // We follow the rules of CSS (Text Module) & browsers.
  // See 001-003, 008-010, 015-017 in https://wpt.fyi/results/css/css-text/line-breaking?label=master&label=experimental&aligned&q=segment-break-transformation-rules-
  // See EXAMPLE 16 in https://drafts.csswg.org/css-text-4/#line-break-transform
  // The following rules is (almost) the same as that adopted by Firefox.
  if (previous.isCJ && next.isCJ) {
    return false;
  }

  // If the sentence uses the style with spaces between CJ and non-CJK, "\n" can
  // be converted to a space.
  return true;
}

/**
 * Check whether whitespace can be printed as a line break.
 *
 * @param {AstPath} path
 * @param {WhitespaceValue} value
 * @param {ProseWrap} proseWrap
 * @param {boolean} isLink
 * @param {boolean} canBeSpace
 * @returns {boolean}
 */
function isBreakable(path, value, proseWrap, isLink, canBeSpace) {
  if (
    proseWrap !== "always" ||
    path.hasAncestor((node) => SINGLE_LINE_NODE_TYPES.has(node.type))
  ) {
    return false;
  }

  if (isLink) {
    return value !== "";
  }

  /** @type {AdjacentNodes} */
  const { previous, next } = path;

  if (value === " ") {
    // Space between Chinese or Japanese characters must be kept.
    // If converted to a newline, browsers may omit it.
    // See 001-003, 008-010, 015-017 in https://wpt.fyi/results/css/css-text/line-breaking?label=master&label=experimental&aligned&q=segment-break-transformation-rules-
    return !previous?.isCJ || !next?.isCJ;
  }

  // Don't break line around a CJK character now; some browsers may insert a space there.
  if (value === "") {
    return false;
  }

  // Chrome & Safari always replace "\n" with a space now.
  // If we break the line at a place where a space is unwanted, they will insert a space there.
  return canBeSpace;
}

/**
 * @param {AstPath} path
 * @param {WhitespaceValue} value
 * @param {ProseWrap} proseWrap
 * @param {boolean} [isLink] Special mode of (un)wrapping that preserves the
 * normalized form of link labels. https://spec.commonmark.org/0.30/#matches
 */
function printWhitespace(path, value, proseWrap, isLink) {
  if (proseWrap === "preserve" && value === "\n") {
    return hardline;
  }

  const canBeSpace =
    value === " " ||
    (value === "\n" && lineBreakCanBeConvertedToSpace(path, isLink));

  if (isBreakable(path, value, proseWrap, isLink, canBeSpace)) {
    return canBeSpace ? line : softline;
  }

  return canBeSpace ? " " : "";
}

export { printWhitespace };
