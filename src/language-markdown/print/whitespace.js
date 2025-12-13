import { hardline, line, softline } from "../../document/index.js";
import {
  KIND_CJ_LETTER,
  KIND_CJK_PUNCTUATION,
  KIND_K_LETTER,
  KIND_NON_CJK,
} from "../utilities.js";

/**
 * @import {WordNode, WhitespaceValue, WordKind} from "../utilities.js"
 * @import AstPath from "../../common/ast-path.js"
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
 * A line break between a character from this set and CJ can be converted to a
 * space. Includes only ASCII punctuation marks for now.
 */
const lineBreakBetweenTheseAndCJConvertsToSpace = new Set(
  "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
);

/**
 * Determine the preferred style of spacing between Chinese or Japanese and non-CJK
 * characters in the parent `sentence` node.
 *
 * @param {AstPath} path
 * @returns {boolean} `true` if Space tends to be inserted between CJ and
 * non-CJK, `false` otherwise.
 */
function isInSentenceWithCJSpaces({ parent: sentenceNode }) {
  if (sentenceNode.usesCJSpaces === undefined) {
    const stats = { " ": 0, "": 0 };
    const { children } = sentenceNode;

    for (let i = 1; i < children.length - 1; ++i) {
      const node = children[i];
      if (
        node.type === "whitespace" &&
        (node.value === " " || node.value === "")
      ) {
        const previousKind = children[i - 1].kind;
        const nextKind = children[i + 1].kind;
        if (
          (previousKind === KIND_CJ_LETTER && nextKind === KIND_NON_CJK) ||
          (previousKind === KIND_NON_CJK && nextKind === KIND_CJ_LETTER)
        ) {
          ++stats[node.value];
        }
      }
    }

    // Inject a property to cache the result.
    sentenceNode.usesCJSpaces = stats[" "] > stats[""];
  }

  return sentenceNode.usesCJSpaces;
}

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

  const previousKind = previous.kind;
  const nextKind = next.kind;

  if (
    // "\n" between non-CJK or Korean characters always can be converted to a
    // space. Korean Hangul simulates Latin words. See
    // https://github.com/prettier/prettier/issues/6516
    (isNonCJKOrKoreanLetter(previousKind) &&
      isNonCJKOrKoreanLetter(nextKind)) ||
    // Han & Hangul: same way preferred
    (previousKind === KIND_K_LETTER && nextKind === KIND_CJ_LETTER) ||
    (nextKind === KIND_K_LETTER && previousKind === KIND_CJ_LETTER)
  ) {
    return true;
  }

  // Do not convert \n to a space:
  if (
    // around CJK punctuation
    previousKind === KIND_CJK_PUNCTUATION ||
    nextKind === KIND_CJK_PUNCTUATION ||
    // between CJ
    (previousKind === KIND_CJ_LETTER && nextKind === KIND_CJ_LETTER)
  ) {
    return false;
  }

  // The rest of this function deals only with line breaks between CJ and
  // non-CJK characters.

  // Convert a line break between CJ and certain non-letter characters (e.g.
  // ASCII punctuation) to a space.
  //
  // E.g. :::\n句子句子句子\n::: → ::: 句子句子句子 :::
  //
  // Note: line breaks like "(\n句子句子\n)" or "句子\n." are suppressed in
  // `isBreakable(...)`.
  if (
    lineBreakBetweenTheseAndCJConvertsToSpace.has(next.value[0]) ||
    lineBreakBetweenTheseAndCJConvertsToSpace.has(previous.value.at(-1))
  ) {
    return true;
  }

  // Converting a line break between CJ and non-ASCII punctuation to a space is
  // undesired in many cases. PRs are welcome to fine-tune this logic.
  //
  // Examples where \n must not be converted to a space:
  //
  // 1. "〜" (U+301C, belongs to Pd) in
  //
  //     "ア〜\nエの中から1つ選べ。"
  //
  // 2. "…" (U+2026, belongs to Po) in
  //
  //     "これはひどい……\nなんと汚いコミットログなんだ……"
  if (previous.hasTrailingPunctuation || next.hasLeadingPunctuation) {
    return false;
  }

  // If the sentence uses the style with spaces between CJ and non-CJK, "\n" can
  // be converted to a space.
  return isInSentenceWithCJSpaces(path);
}

/**
 * @param {WordKind | undefined} kind
 * @returns {boolean} `true` if `kind` is Korean letter or non-CJK
 */
function isNonCJKOrKoreanLetter(kind) {
  return kind === KIND_NON_CJK || kind === KIND_K_LETTER;
}

/**
 * Check whether whitespace can be printed as a line break.
 *
 * @param {AstPath} path
 * @param {WhitespaceValue} value
 * @param {ProseWrap} proseWrap
 * @param {boolean} isLink
 * @returns {boolean}
 */
function isBreakable(path, value, proseWrap, isLink) {
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

  // [1]: We will make a breaking change to the rule to convert spaces between
  //      a Chinese or Japanese character and another character in the future.
  //      Such a space must have been always interchangeable with a line break.
  //      https://wpt.fyi/results/css/css-text/line-breaking?label=master&label=experimental&aligned&q=segment-break-transformation-rules-
  // [2]: we should not break lines even between Chinese/Japanese characters because Chrome & Safari replaces "\n" between such characters with " " now.
  // [3]: Hangul (Korean) must simulate Latin words; see https://github.com/prettier/prettier/issues/6516
  //      [printable][""][Hangul] & vice versa => Don't break
  //      [printable][\n][Hangul] will be interchangeable to [printable][" "][Hangul] in the future
  //      (will be compatible with Firefox's behavior)

  if (!previous || !next) {
    // empty side is Latin ASCII symbol (e.g. *, [, ], or `)
    // value is " " or "\n" (not "")
    // [1] & [2]? No, it's the only exception because " " & "\n" have been always interchangeable only here
    return true;
  }

  if (value === "") {
    // [1] & [2] & [3]
    // At least either of previous or next is non-Latin (=CJK)
    return false;
  }

  if (
    // See the same product terms as the following in lineBreakCanBeConvertedToSpace
    // The behavior is consistent between browsers and Prettier in that line breaks between Korean and Chinese/Japanese letters are equivalent to spaces.
    // Currently, [CJK punctuation][\n][Hangul] is interchangeable to [CJK punctuation][""][Hangul],
    // but this is not compatible with Firefox's behavior.
    // Will be changed to [CJK punctuation][" "][Hangul] in the future
    (previous.kind === KIND_K_LETTER && next.kind === KIND_CJ_LETTER) ||
    (next.kind === KIND_K_LETTER && previous.kind === KIND_CJ_LETTER)
  ) {
    return true;
  }

  // [1] & [2]
  if (previous.isCJ || next.isCJ) {
    return false;
  }

  return true;
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

  if (isBreakable(path, value, proseWrap, isLink)) {
    return canBeSpace ? line : softline;
  }

  return canBeSpace ? " " : "";
}

export { printWhitespace };
