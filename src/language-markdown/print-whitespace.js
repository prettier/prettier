import { hardline, line, softline } from "../document/builders.js";
import {
  KIND_CJ_LETTER,
  KIND_CJK_PUNCTUATION,
  KIND_K_LETTER,
  KIND_NON_CJK,
} from "./utils.js";

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
 * These characters must not immediately precede a line break.
 *
 * e.g. `"（"`:
 *
 * - Bad:  `"檜原村（\nひのはらむら）"`
 * - Good: `"檜原村\n（ひのはらむら）"` or
 *         `"檜原村（ひ\nのはらむら）"`
 */
const noBreakAfter = new Set(
  "$(£¥·'\"〈《「『【〔〖〝﹙﹛＄（［｛￡￥[{‵︴︵︷︹︻︽︿﹁﹃﹏〘｟«",
);

/**
 * These characters must not immediately follow a line break.
 *
 * e.g. `"）"`:
 *
 * - Bad:  `"檜原村（ひのはらむら\n）以外には、"`
 * - Good: `"檜原村（ひのはらむ\nら）以外には、"` or
 *         `"檜原村（ひのはらむら）\n以外には、"`
 */
const noBreakBefore = new Set(
  "!%),.:;?]}¢°·'\"†‡›℃∶、。〃〆〕〗〞﹚﹜！＂％＇），．：；？］｝～–—•〉》」︰︱︲︳﹐﹑﹒﹓﹔﹕﹖﹘︶︸︺︼︾﹀﹂﹗｜､』】〙〟｠»ヽヾーァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎゕゖㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ々〻‐゠〜～‼⁇⁈⁉・゙゚",
);

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
 * @returns {boolean} `true` if `kind` is defined and not CJK punctuation
 */
function isLetter(kind) {
  return (
    kind === KIND_NON_CJK || kind === KIND_CJ_LETTER || kind === KIND_K_LETTER
  );
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

  // Spaces are always breakable
  if (value === " ") {
    return true;
  }

  /** @type {AdjacentNodes} */
  const { previous, next } = path;

  // Simulates Latin words; see https://github.com/prettier/prettier/issues/6516
  // [Latin][""][Hangul] & vice versa => Don't break
  // [Han & Kana][""][Hangul], either
  if (
    value === "" &&
    ((previous?.kind === KIND_K_LETTER && isLetter(next?.kind)) ||
      (next?.kind === KIND_K_LETTER && isLetter(previous?.kind)))
  ) {
    return false;
  }

  // https://en.wikipedia.org/wiki/Line_breaking_rules_in_East_Asian_languages
  const violatesCJKLineBreakingRules =
    !canBeSpace &&
    ((next && noBreakBefore.has(next.value[0])) ||
      (previous && noBreakAfter.has(previous.value.at(-1))));

  if (violatesCJKLineBreakingRules) {
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

  if (isBreakable(path, value, proseWrap, isLink, canBeSpace)) {
    return canBeSpace ? line : softline;
  }

  return canBeSpace ? " " : "";
}

export { printWhitespace };
