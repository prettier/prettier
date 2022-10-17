import { hardline, line, softline } from "../document/builders.js";
import {
  KIND_CJK_PUNCTUATION,
  KIND_CJ_LETTER,
  KIND_K_LETTER,
  KIND_NON_CJK,
  getAncestorNode,
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
 * Finds out if Space tends to be inserted between Chinese or Japanese characters
 * (including ideograph aka han or kanji e.g. `字`, hiragana e.g. `あ`, and katakana e.g. `ア`)
 * and other letters (including alphanumerics; e.g. `A` or `1`) in the sentence.
 *
 * @param {AstPath} path current position in nodes tree
 * @returns {boolean} `true` if Space tends to be inserted between these types of letters, `false` otherwise.
 */
function isInSentenceWithCJSpaces(path) {
  const sentenceNode = path.parent;
  if (sentenceNode.usesCJSpaces !== undefined) {
    return sentenceNode.usesCJSpaces;
  }

  const stats = { " ": 0, "": 0 };

  for (let i = 1; i < sentenceNode.children.length - 1; ++i) {
    const node = sentenceNode.children[i];
    if (
      node.type === "whitespace" &&
      (node.value === " " || node.value === "")
    ) {
      const previousKind = sentenceNode.children[i - 1].kind;
      const nextKind = sentenceNode.children[i + 1].kind;
      if (
        (previousKind === KIND_CJ_LETTER && nextKind === KIND_NON_CJK) ||
        (previousKind === KIND_NON_CJK && nextKind === KIND_CJ_LETTER)
      ) {
        ++stats[node.value];
      }
    }
  }

  // Injects a property to cache the result.
  sentenceNode.usesCJSpaces = stats[" "] > stats[""];
  return sentenceNode.usesCJSpaces;
}

/**
 * @typedef {import("./utils.js").WordNode} WordNode
 * @typedef {import("./utils.js").WhitespaceValue} WhitespaceValue
 * @typedef {{ next?: WordNode | null, previous?: WordNode | null }} AdjacentNodes
 * Adjacent node to `WhitespaceNode`. the consecution of `WhitespaceNode` is a bug, so adjacent nodes must be `WordNode`.
 * @typedef {import("./utils.js").WordKind} WordKind
 * @typedef {import("../common/ast-path.js").default} AstPath
 */

/**
 * Checks if given `"\n"` node can be converted to Space
 *
 * For example, if you would like to squash the multi-line string `"You might want\nto use Prettier."` into a single line,
 * you would replace `"\n"` with `" "`. (`"You might want to use Prettier."`)
 *
 * However, you should note that Chinese and Japanese do not use U+0020 Space to divide words, so U+000A End of Line must not be replaced with it.
 * Behavior in other languages (e.g. Thai) will not be changed because there are too much things to consider. (PR welcome)
 *
 * @param {AstPath} path path of given node
 * @param {AdjacentNodes | undefined} adjacentNodes adjacent sibling nodes of given node
 * @returns {boolean} `true` if given node can be convertedToSpace, `false` if not (i.e. newline or empty character)
 */
function canBeConvertedToSpace(path, adjacentNodes) {
  if (
    // no adjacent nodes - this happens for linkReference and imageReference nodes
    !adjacentNodes ||
    // e.g. " \nletter"
    !adjacentNodes.previous ||
    !adjacentNodes.next
  ) {
    return true;
  }

  const previousKind = adjacentNodes.previous.kind;
  const nextKind = adjacentNodes.next.kind;

  // "\n" between not western or Korean (han, kana, CJK punctuations) characters always can be converted to Space
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
    // "\n" between CJ always SHALL NOT be convertedToSpace
    (previousKind === KIND_CJ_LETTER && nextKind === KIND_CJ_LETTER)
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
    adjacentNodes.previous.hasTrailingPunctuation ||
    adjacentNodes.next.hasLeadingPunctuation
  ) {
    return false;
  }

  // If the sentence uses the style with spaces between CJ and alphanumerics, "\n" can be converted to Space.
  return isInSentenceWithCJSpaces(path);
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
 * Returns whether “whitespace” (`"" | " " | "\n"`; see `WhitespaceValue`) can be converted to `"\n"`
 *
 * @param {AstPath} path
 * @param {WhitespaceValue} value
 * @param {*} options
 * @param {AdjacentNodes | undefined} adjacentNodes
 * @param {boolean} canBeSpace
 * @returns {boolean} `true` if “whitespace” can be converted to `"\n"`
 */
function isBreakable(path, value, options, adjacentNodes, canBeSpace) {
  if (
    options.proseWrap !== "always" ||
    getAncestorNode(path, SINGLE_LINE_NODE_TYPES)
  ) {
    return false;
  }

  if (
    adjacentNodes === undefined ||
    // Space are always breakable
    value === " "
  ) {
    return true;
  }

  // Simulates latin words; see #6516 (https://github.com/prettier/prettier/issues/6516)
  // [Latin][""][Hangul] & vice versa => Don't break
  // [han & kana][""][hangul], either
  if (
    value === "" &&
    ((adjacentNodes.previous?.kind === KIND_K_LETTER &&
      isLetter(adjacentNodes.next?.kind)) ||
      (adjacentNodes.next?.kind === KIND_K_LETTER &&
        isLetter(adjacentNodes.previous?.kind)))
  ) {
    return false;
  }

  // https://en.wikipedia.org/wiki/Line_breaking_rules_in_East_Asian_languages
  const violatesCJKLineBreakingRule =
    (adjacentNodes.next !== undefined &&
      noBreakBefore.has(adjacentNodes.next.value[0])) ||
    (adjacentNodes.previous !== undefined &&
      noBreakAfter.has(adjacentNodes.previous.value.at(-1)));

  // When violates the CJK line breaking rules if breaks lines there ("") or leaves surrounding lines divided ("\n")...
  // - ""   => always `false` (i.e. disallows to break lines there)
  // - "\n" => `true` (i.e. don't force surrounding lines to be joined) only when it should be converted to Space
  //           `false` (i.e. join surrounding lines into a single line) otherwise
  // The mandatory joining behavior when Space is not allowed is necessary because intentional violation of the line breaking rules (e.g. “ル\nール守れ\n！”) tends to be “corrected” ("\n" -> "") by formatted with a large value of `printWidth`.
  // Eventually, by reformatted with a smaller value of `printWidth` or because of a paragraph revision, the rules are going to be applied to the place that used to violate them.
  // e.g. “シ\nョ\nートカ\nット\n！\n？” (completely violates the rules on purpose) --[printWidth = 6]-->“ショー\nトカッ\nト！？” --[s/^/こんなところで/]--> “こんな\nところ\nで\nショー\nトカッ\nト！？” (completely complies to the rules)
  // On the contrary, if `false` even should be Space, the following loop will occur:
  //   the surrounding lines are joined with `" "` -> divided into 2 lines by `" "` -> joined again -> ...
  if (violatesCJKLineBreakingRule) {
    return value === "\n" && canBeSpace;
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

  const canBeSpace =
    value === " " ||
    (value === "\n" && canBeConvertedToSpace(path, adjacentNodes));

  if (isBreakable(path, value, options, adjacentNodes, canBeSpace)) {
    return canBeSpace ? line : softline;
  }

  return canBeSpace ? " " : "";
}

export { printWhitespace };
