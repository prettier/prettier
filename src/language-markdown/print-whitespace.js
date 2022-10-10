import { hardline, line, softline } from "../document/builders.js";
import {
  KIND_CJK_PUNCTUATION,
  KIND_CJ_LETTER,
  KIND_K_LETTER,
  KIND_NON_CJK,
  getAncestorNode,
  punctuationRegex,
} from "./utils.js";

const SINGLE_LINE_NODE_TYPES = ["heading", "tableCell", "link", "wikiLink"];

// https://en.wikipedia.org/wiki/Line_breaking_rules_in_East_Asian_languages
/**
 * The set of characters that must not immediately precede a line break
 *
 * e.g. `"（"`
 *
 * - Bad:  `"檜原村（\nひのはらむら）"`
 * - Good: `"檜原村\n（ひのはらむら）"` or ``"檜原村（ひ\nのはらむら）"`
 */
const noBreakAfter = new Set(
  "$(£¥·'\"〈《「『【〔〖〝﹙﹛＄（［｛￡￥[{‵︴︵︷︹︻︽︿﹁﹃﹏〘｟«"
);

/**
 * The set of characters that must not immediately follow a line break
 *
 * e.g. `"）"`
 *
 * - Bad:  `"檜原村（ひのはらむら\n）以外には、"`
 * - Good: `"檜原村（ひのはらむ\nら）以外には、"` or `"檜原村（ひのはらむら）\n以外には、"`
 */
const noBreakBefore = new Set(
  "!%),.:;?]}¢°·'\"†‡›℃∶、。〃〆〕〗〞﹚﹜！＂％＇），．：；？］｝～–—•〉》」︰︱︲︳﹐﹑﹒﹓﹔﹕﹖﹘︶︸︺︼︾﹀﹂﹗｜､』】〙〟｠»ヽヾーァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎゕゖㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ々〻‐゠〜～‼⁇⁈⁉・"
);

/**
 * The set of characters whose surrounding newline may be converted to Space
 *
 * - ASCII punctuation marks
 */
const lineBreakBetweenTheseAndCJKConvertsToSpace = new Set(
  "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"
);

/**
 * Finds out if Space is tend to be inserted between Chinese or Japanese characters
 * (including ideograph aka han or kanji e.g. `字`, hiragana e.g. `あ`, and katakana e.g. `ア`)
 * and other letters (including alphanumerics; e.g. `A` or `1`) in the sentence.
 *
 * @param {AstPath} path current position in nodes tree
 * @returns {boolean} `true` if Space is tend to be inserted between these types of letters, `false` otherwise.
 */
function isInSentenceWithCJSpaces(path) {
  const sentenceNode = path.parent;
  if (sentenceNode.usesCJSpaces !== undefined) {
    return sentenceNode.usesCJSpaces;
  }

  const cjNonCJKSpacingStatistics = {
    " ": 0,
    "": 0,
  };
  for (let i = 0; i < sentenceNode.children.length; ++i) {
    const node = sentenceNode.children[i];
    if (
      node.type === "whitespace" &&
      (node.value === " " || node.value === "")
    ) {
      const previousKind = sentenceNode.children[i - 1]?.kind;
      const nextKind = sentenceNode.children[i + 1]?.kind;
      if (
        (previousKind === "cj-letter" && nextKind === "non-cjk") ||
        (previousKind === "non-cjk" && nextKind === "cj-letter")
      ) {
        ++cjNonCJKSpacingStatistics[node.value];
      }
    }
  }
  // Injects a property to cache the result.
  sentenceNode.usesCJSpaces =
    cjNonCJKSpacingStatistics[" "] > cjNonCJKSpacingStatistics[""];
  return sentenceNode.usesCJSpaces;
}

/**
 * @typedef {import("./utils.js").WordNode} WordNode
 * @typedef {import("./utils.js").WhitespaceValue} WhitespaceValue
 * @typedef {{next?: WordNode | undefined | null, previous?: WordNode | undefined | null}} AdjacentNodes
 * Adjacent node to `WhitespaceNode`. the consecution of `WhitespaceNode` is a bug, so adjacent nodes must be `WordNode`.
 * @typedef {import("./utils.js").WordKind} WordKind
 * @typedef {import("../common/ast-path.js").default} AstPath
 */

/**
 * Checks if given node can be converted to Space
 *
 * For example, if you would like to squash the multi-line string `"You might want\nto use Prettier."` into a single line,
 * you would replace `"\n"` with `" "`. (`"You might want to use Prettier."`)
 *
 * However, you should note that Chinese and Japanese does not use U+0020 Space to divide words, so U+000A End of Line must not be replaced with it.
 * Behavior in other languages (e.g. Thai) will not be changed because there are too much things to consider. (PR welcome)
 *
 * @param {AstPath} path path of given node
 * @param {WhitespaceValue} value value of given node (typically `" "` or `"\n"`)
 * @param {AdjacentNodes | undefined} adjacentNodes adjacent sibling nodes of given node
 * @returns {boolean} `true` if given node can be converted to space, `false` if not (i.e. newline or empty character)
 */
function canBeConvertedToSpace(path, value, adjacentNodes) {
  // "\n" or " ", of course " " always can be converted to Space
  if (value !== "\n") {
    return true;
  }

  // no adjacent nodes
  if (!adjacentNodes) {
    return true;
  }

  // e.g. " \nletter"
  if (!adjacentNodes.previous || !adjacentNodes.next) {
    return true;
  }

  const previousKind = adjacentNodes.previous.kind;
  const nextKind = adjacentNodes.next.kind;

  // "\n" between not western or Korean (han, kana, CJK punctuations) characters always can converted to Space
  // Korean hangul simulates latin words; see #6516 (https://github.com/prettier/prettier/issues/6516)
  if (
    isWesternOrKoreanLetter(previousKind) &&
    isWesternOrKoreanLetter(nextKind)
  ) {
    return true;
  }

  // han & hangul: same way preferred
  if (
    (previousKind === KIND_K_LETTER && nextKind === KIND_CJ_LETTER) ||
    (nextKind === KIND_K_LETTER && previousKind === KIND_CJ_LETTER)
  ) {
    return true;
  }

  // Do not convert it to Space when:
  if (
    // Shall not be converted to Space around CJK punctuation
    previousKind === KIND_CJK_PUNCTUATION ||
    nextKind === KIND_CJK_PUNCTUATION ||
    // "\n" between CJ always SHALL NOT be converted to space
    // "\n" between Korean and CJ is better not to be converted to space
    (isCJK(previousKind) && isCJK(nextKind))
  ) {
    return false;
  }

  const characterBefore = adjacentNodes.previous.value.at(-1);
  const characterAfter = adjacentNodes.next.value[0];

  // From here down, only line breaks between CJ and non-CJK characters are covered.

  // Convert newline between CJ and specific symbol characters (e.g. ASCII punctuation)  to Space.
  // e.g. :::\n句子句子句子\n::: → ::: 句子句子句子 :::
  //
  // Note: Line breaks like "(\n句子句子\n)" or "句子\n." by Prettier are suppressed in `isBreakable(...)`.
  if (
    lineBreakBetweenTheseAndCJKConvertsToSpace.has(characterAfter) ||
    lineBreakBetweenTheseAndCJKConvertsToSpace.has(characterBefore)
  ) {
    return true;
  }

  // Converting newline between CJ and non-ASCII punctuation to Space does not seem to be better in many cases. (PR welcome)
  // e.g.
  // 1. “ア〜エの中から1つ選べ。”
  // "〜" (U+301C) belongs to Pd, and "\n" in "ア〜\nエの中から1つ選べ。" must not be converted to Space.
  // 2. “これはひどい……なんと汚いコミットログなんだ……”
  // "…" (U+2026) belongs to Po, and "\n" in "これはひどい……\nなんと汚いコミットログなんだ……" must not, either.
  if (
    punctuationRegex.test(characterBefore) ||
    punctuationRegex.test(characterAfter)
  ) {
    return false;
  }

  // If the sentence uses the style that Space is injected in between CJ and alphanumerics, "\n" can be converted to Space.
  return isInSentenceWithCJSpaces(path);
}

/**
 * @param {WordKind | undefined} kind
 * @returns {boolean} `true` if `kind` is CJK (including punctuation marks)
 */
function isCJK(kind) {
  return (
    kind === KIND_CJ_LETTER ||
    kind === KIND_K_LETTER ||
    kind === KIND_CJK_PUNCTUATION
  );
}

/**
 * @param {WordKind | undefined} kind
 * @returns {boolean} `true` if `kind` is letter (not CJK punctuation)
 */
function isLetter(kind) {
  return (
    kind === KIND_NON_CJK || kind === KIND_CJ_LETTER || kind === KIND_K_LETTER
  );
}

/**
 * @param {WordKind | undefined} kind
 * @returns {boolean} `true` if `kind` is western or Korean letters (divides words by Space)
 */
function isWesternOrKoreanLetter(kind) {
  return kind === KIND_NON_CJK || kind === KIND_K_LETTER;
}

/**
 * Returns whether “whitespace” (`"" | " " | "\n"`; see `WhitespaceValue`) can converted to `"\n"`
 *
 * @param {AstPath} path
 * @param {WhitespaceValue} value
 * @param {*} options
 * @param {AdjacentNodes | undefined} [adjacentNodes]
 * @returns {boolean} `true` if “whitespace” can be converted to `"\n"`
 */
function isBreakable(path, value, options, adjacentNodes) {
  if (
    options.proseWrap !== "always" ||
    getAncestorNode(path, SINGLE_LINE_NODE_TYPES)
  ) {
    return false;
  }

  if (
    adjacentNodes === undefined ||
    // Space & newline are always breakable
    value !== ""
  ) {
    return true;
  }

  // Simulates latin words; see #6516 (https://github.com/prettier/prettier/issues/6516)
  // [Latin][""][Hangul] & vice versa => Don't break
  // [han & kana][""][hangul], either
  if (
    (adjacentNodes.previous?.kind === KIND_K_LETTER &&
      isLetter(adjacentNodes.next?.kind)) ||
    (adjacentNodes.next?.kind === KIND_K_LETTER &&
      isLetter(adjacentNodes.previous?.kind))
  ) {
    return false;
  }

  // https://en.wikipedia.org/wiki/Line_breaking_rules_in_East_Asian_languages
  const violatesCJKLineBreakingRule =
    (adjacentNodes.next?.value !== undefined &&
      noBreakBefore.has(adjacentNodes.next?.value?.[0])) ||
    (adjacentNodes.previous?.value !== undefined &&
      noBreakAfter.has(adjacentNodes.previous?.value?.at(-1)));

  // For "" (CJK and some non-space) higher priority than the following rule
  if (violatesCJKLineBreakingRule) {
    return false;
  }

  return true;
}

/**
 * @param {AstPath} path
 * @param {WhitespaceValue} value
 * @param {*} options
 * @param {AdjacentNodes | undefined} [adjacentNodes]
 */
function printWhitespace(path, value, options, adjacentNodes) {
  if (options.proseWrap === "preserve" && value === "\n") {
    return hardline;
  }

  const isBreakable_ = isBreakable(path, value, options, adjacentNodes);

  // Space or empty
  if (value !== "\n") {
    return convertToLineIfBreakable(value);
  }

  // Chinese and Japanese does not use U+0020 Space to divide words, so U+000A End of Line must not be replaced with it.
  // Behavior in other languages will not be changed because there are too much things to consider. (PR welcome)
  // e.g. Word segmentation in Thai etc.
  return convertToLineIfBreakable(
    canBeConvertedToSpace(path, value, adjacentNodes) ? " " : ""
  );

  /**
   * @param value {" " | ""}
   */
  function convertToLineIfBreakable(value) {
    if (!isBreakable_) {
      return value;
    }
    return value === " " ? line : softline;
  }
}

export { printWhitespace };
