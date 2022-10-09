import {
  getMinNotPresentContinuousCount,
  getMaxContinuousCount,
  getStringWidth,
  isNonEmptyArray,
} from "../common/util.js";
import {
  breakParent,
  join,
  line,
  literalline,
  markAsRoot,
  hardline,
  softline,
  ifBreak,
  fill,
  align,
  indent,
  group,
  hardlineWithoutBreakParent,
} from "../document/builders.js";
import { normalizeDoc, replaceEndOfLine } from "../document/utils.js";
import { printDocToString } from "../document/printer.js";
import createGetVisitorKeys from "../utils/create-get-visitor-keys.js";
import UnexpectedNodeError from "../utils/unexpected-node-error.js";
import embed from "./embed.js";
import { insertPragma } from "./pragma.js";
import { locStart, locEnd } from "./loc.js";
import preprocess from "./print-preprocess.js";
import clean from "./clean.js";
import {
  getFencedCodeBlockValue,
  hasGitDiffFriendlyOrderedList,
  splitText,
  punctuationPattern,
  punctuationRegex,
  INLINE_NODE_TYPES,
  INLINE_NODE_WRAPPER_TYPES,
  isAutolink,
  KIND_CJK_PUNCTUATION,
  KIND_NON_CJK,
  KIND_K_LETTER,
  KIND_CJ_LETTER,
} from "./utils.js";
import visitorKeys from "./visitor-keys.js";

const getVisitorKeys = createGetVisitorKeys(visitorKeys);

/**
 * @typedef {import("../document/builders.js").Doc} Doc
 */

const TRAILING_HARDLINE_NODES = new Set(["importExport"]);
const SINGLE_LINE_NODE_TYPES = ["heading", "tableCell", "link", "wikiLink"];
const SIBLING_NODE_TYPES = new Set([
  "listItem",
  "definition",
  "footnoteDefinition",
]);
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
const lineBreakBetweenTheseAndCJKConvertToSpaceSymbolSet = new Set(
  "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"
);

function genericPrint(path, options, print) {
  const { node } = path;

  if (shouldRemainTheSameContent(path)) {
    return splitText(
      options.originalText.slice(
        node.position.start.offset,
        node.position.end.offset
      )
    ).map((node) =>
      node.type === "word"
        ? node.value
        : node.value === ""
        ? ""
        : printLine(path, node.value, options)
    );
  }

  switch (node.type) {
    case "front-matter":
      return options.originalText.slice(
        node.position.start.offset,
        node.position.end.offset
      );
    case "root":
      if (node.children.length === 0) {
        return "";
      }
      return [
        normalizeDoc(printRoot(path, options, print)),
        !TRAILING_HARDLINE_NODES.has(getLastDescendantNode(node).type)
          ? hardline
          : "",
      ];
    case "paragraph":
      return printChildren(path, options, print, {
        postprocessor: fill,
      });
    case "sentence":
      return printChildren(path, options, print);
    case "word": {
      let escapedValue = node.value
        .replace(/\*/g, "\\$&") // escape all `*`
        .replace(
          new RegExp(
            [
              `(^|${punctuationPattern})(_+)`,
              `(_+)(${punctuationPattern}|$)`,
            ].join("|"),
            "g"
          ),
          (_, text1, underscore1, underscore2, text2) =>
            (underscore1
              ? `${text1}${underscore1}`
              : `${underscore2}${text2}`
            ).replace(/_/g, "\\_")
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
            isLastChildAutolink
          ))
      ) {
        // backslash is parsed as part of autolinks, so we need to remove it
        escapedValue = escapedValue.replace(/^(\\?[*_])+/, (prefix) =>
          prefix.replace(/\\/g, "")
        );
      }

      return escapedValue;
    }
    case "whitespace": {
      const { next, previous } = path;

      const proseWrap =
        // leading char that may cause different syntax
        next && /^>|^(?:[*+-]|#{1,6}|\d+[).])$/.test(next.value)
          ? "never"
          : options.proseWrap;

      return printLine(path, node.value, { proseWrap }, { previous, next });
    }
    case "emphasis": {
      let style;
      if (isAutolink(node.children[0])) {
        style = options.originalText[node.position.start.offset];
      } else {
        const { previous, next } = path;
        const hasPrevOrNextWord = // `1*2*3` is considered emphasis but `1_2_3` is not
          (previous?.type === "sentence" &&
            previous.children.at(-1)?.type === "word" &&
            !previous.children.at(-1).hasTrailingPunctuation) ||
          (next?.type === "sentence" &&
            next.children[0]?.type === "word" &&
            !next.children[0].hasLeadingPunctuation);
        style =
          hasPrevOrNextWord || getAncestorNode(path, "emphasis") ? "*" : "_";
      }
      return [style, printChildren(path, options, print), style];
    }
    case "strong":
      return ["**", printChildren(path, options, print), "**"];
    case "delete":
      return ["~~", printChildren(path, options, print), "~~"];
    case "inlineCode": {
      const backtickCount = getMinNotPresentContinuousCount(node.value, "`");
      const style = "`".repeat(backtickCount || 1);
      const gap = backtickCount && !/^\s/.test(node.value) ? " " : "";
      return [style, gap, node.value, gap, style];
    }
    case "wikiLink": {
      let contents = "";
      if (options.proseWrap === "preserve") {
        contents = node.value;
      } else {
        contents = node.value.replace(/[\t\n]+/g, " ");
      }

      return ["[[", contents, "]]"];
    }
    case "link":
      switch (options.originalText[node.position.start.offset]) {
        case "<": {
          const mailto = "mailto:";
          const url =
            // <hello@example.com> is parsed as { url: "mailto:hello@example.com" }
            node.url.startsWith(mailto) &&
            options.originalText.slice(
              node.position.start.offset + 1,
              node.position.start.offset + 1 + mailto.length
            ) !== mailto
              ? node.url.slice(mailto.length)
              : node.url;
          return ["<", url, ">"];
        }
        case "[":
          return [
            "[",
            printChildren(path, options, print),
            "](",
            printUrl(node.url, ")"),
            printTitle(node.title, options),
            ")",
          ];
        default:
          return options.originalText.slice(
            node.position.start.offset,
            node.position.end.offset
          );
      }
    case "image":
      return [
        "![",
        node.alt || "",
        "](",
        printUrl(node.url, ")"),
        printTitle(node.title, options),
        ")",
      ];
    case "blockquote":
      return ["> ", align("> ", printChildren(path, options, print))];
    case "heading":
      return [
        "#".repeat(node.depth) + " ",
        printChildren(path, options, print),
      ];
    case "code": {
      if (node.isIndented) {
        // indented code block
        const alignment = " ".repeat(4);
        return align(alignment, [
          alignment,
          replaceEndOfLine(node.value, hardline),
        ]);
      }

      // fenced code block
      const styleUnit = options.__inJsTemplate ? "~" : "`";
      const style = styleUnit.repeat(
        Math.max(3, getMaxContinuousCount(node.value, styleUnit) + 1)
      );
      return [
        style,
        node.lang || "",
        node.meta ? " " + node.meta : "",
        hardline,
        replaceEndOfLine(
          getFencedCodeBlockValue(node, options.originalText),
          hardline
        ),
        hardline,
        style,
      ];
    }
    case "html": {
      const { parent } = path;
      const value =
        parent.type === "root" && parent.children.at(-1) === node
          ? node.value.trimEnd()
          : node.value;
      const isHtmlComment = /^<!--.*-->$/s.test(value);

      return replaceEndOfLine(
        value,
        // @ts-expect-error
        isHtmlComment ? hardline : markAsRoot(literalline)
      );
    }
    case "list": {
      const nthSiblingIndex = getNthListSiblingIndex(node, path.parent);

      const isGitDiffFriendlyOrderedList = hasGitDiffFriendlyOrderedList(
        node,
        options
      );

      return printChildren(path, options, print, {
        processor(childPath, index) {
          const prefix = getPrefix();
          const childNode = childPath.node;

          if (
            childNode.children.length === 2 &&
            childNode.children[1].type === "html" &&
            childNode.children[0].position.start.column !==
              childNode.children[1].position.start.column
          ) {
            return [prefix, printListItem(childPath, options, print, prefix)];
          }

          return [
            prefix,
            align(
              " ".repeat(prefix.length),
              printListItem(childPath, options, print, prefix)
            ),
          ];

          function getPrefix() {
            const rawPrefix = node.ordered
              ? (index === 0
                  ? node.start
                  : isGitDiffFriendlyOrderedList
                  ? 1
                  : node.start + index) +
                (nthSiblingIndex % 2 === 0 ? ". " : ") ")
              : nthSiblingIndex % 2 === 0
              ? "- "
              : "* ";

            return node.isAligned ||
              /* workaround for https://github.com/remarkjs/remark/issues/315 */ node.hasIndentedCodeblock
              ? alignListPrefix(rawPrefix, options)
              : rawPrefix;
          }
        },
      });
    }
    case "thematicBreak": {
      const counter = getAncestorCounter(path, "list");
      if (counter === -1) {
        return "---";
      }
      const nthSiblingIndex = getNthListSiblingIndex(
        path.getParentNode(counter),
        path.getParentNode(counter + 1)
      );
      return nthSiblingIndex % 2 === 0 ? "***" : "---";
    }
    case "linkReference":
      return [
        "[",
        printChildren(path, options, print),
        "]",
        node.referenceType === "full"
          ? ["[", node.identifier, "]"]
          : node.referenceType === "collapsed"
          ? "[]"
          : "",
      ];
    case "imageReference":
      switch (node.referenceType) {
        case "full":
          return ["![", node.alt || "", "][", node.identifier, "]"];
        default:
          return [
            "![",
            node.alt,
            "]",
            node.referenceType === "collapsed" ? "[]" : "",
          ];
      }
    case "definition": {
      const lineOrSpace = options.proseWrap === "always" ? line : " ";
      return group([
        "[",
        node.identifier,
        "]:",
        indent([
          lineOrSpace,
          printUrl(node.url),
          node.title === null
            ? ""
            : [lineOrSpace, printTitle(node.title, options, false)],
        ]),
      ]);
    }
    // `footnote` requires `.use(footnotes, {inlineNotes: true})`, we are not using this option
    // https://github.com/remarkjs/remark-footnotes#optionsinlinenotes
    /* istanbul ignore next */
    case "footnote":
      return ["[^", printChildren(path, options, print), "]"];
    case "footnoteReference":
      return ["[^", node.identifier, "]"];
    case "footnoteDefinition": {
      const shouldInlineFootnote =
        node.children.length === 1 &&
        node.children[0].type === "paragraph" &&
        (options.proseWrap === "never" ||
          (options.proseWrap === "preserve" &&
            node.children[0].position.start.line ===
              node.children[0].position.end.line));
      return [
        "[^",
        node.identifier,
        "]: ",
        shouldInlineFootnote
          ? printChildren(path, options, print)
          : group([
              align(
                " ".repeat(4),
                printChildren(path, options, print, {
                  processor: (childPath, index) =>
                    index === 0 ? group([softline, print()]) : print(),
                })
              ),
              path.next?.type === "footnoteDefinition" ? softline : "",
            ]),
      ];
    }
    case "table":
      return printTable(path, options, print);
    case "tableCell":
      return printChildren(path, options, print);
    case "break":
      return /\s/.test(options.originalText[node.position.start.offset])
        ? ["  ", markAsRoot(literalline)]
        : ["\\", hardline];
    case "liquidNode":
      return replaceEndOfLine(node.value, hardline);
    // MDX
    // fallback to the original text if multiparser failed
    // or `embeddedLanguageFormatting: "off"`
    case "importExport":
      return [node.value, hardline];
    case "esComment":
      return ["{/* ", node.value, " */}"];
    case "jsx":
      return node.value;
    case "math":
      return [
        "$$",
        hardline,
        node.value ? [replaceEndOfLine(node.value, hardline), hardline] : "",
        "$$",
      ];
    case "inlineMath":
      // remark-math trims content but we don't want to remove whitespaces
      // since it's very possible that it's recognized as math accidentally
      return options.originalText.slice(locStart(node), locEnd(node));

    case "tableRow": // handled in "table"
    case "listItem": // handled in "list"
    case "text": // handled in other types
    case "import": // transformed in to `importExport`
    case "export": // transformed in to `importExport`
    default:
      /* istanbul ignore next */
      throw new UnexpectedNodeError(node, "Markdown");
  }
}

function printListItem(path, options, print, listPrefix) {
  const { node } = path;
  const prefix = node.checked === null ? "" : node.checked ? "[x] " : "[ ] ";
  return [
    prefix,
    printChildren(path, options, print, {
      processor(childPath, index) {
        if (index === 0 && childPath.node.type !== "list") {
          return align(" ".repeat(prefix.length), print());
        }

        const alignment = " ".repeat(
          clamp(options.tabWidth - listPrefix.length, 0, 3) // 4+ will cause indented code block
        );
        return [alignment, align(alignment, print())];
      },
    }),
  ];
}

function alignListPrefix(prefix, options) {
  const additionalSpaces = getAdditionalSpaces();
  return (
    prefix +
    " ".repeat(
      additionalSpaces >= 4 ? 0 : additionalSpaces // 4+ will cause indented code block
    )
  );

  function getAdditionalSpaces() {
    const restSpaces = prefix.length % options.tabWidth;
    return restSpaces === 0 ? 0 : options.tabWidth - restSpaces;
  }
}

function getNthListSiblingIndex(node, parentNode) {
  return getNthSiblingIndex(
    node,
    parentNode,
    (siblingNode) => siblingNode.ordered === node.ordered
  );
}

function getNthSiblingIndex(node, parentNode, condition) {
  let index = -1;

  for (const childNode of parentNode.children) {
    if (childNode.type === node.type && condition(childNode)) {
      index++;
    } else {
      index = -1;
    }

    if (childNode === node) {
      return index;
    }
  }
}

function getAncestorCounter(path, typeOrTypes) {
  const types = Array.isArray(typeOrTypes) ? typeOrTypes : [typeOrTypes];

  let counter = -1;
  let ancestorNode;

  while ((ancestorNode = path.getParentNode(++counter))) {
    if (types.includes(ancestorNode.type)) {
      return counter;
    }
  }

  return -1;
}

function getAncestorNode(path, typeOrTypes) {
  const counter = getAncestorCounter(path, typeOrTypes);
  return counter === -1 ? null : path.getParentNode(counter);
}

/**
 * Finds out if Space is tend to be inserted between Chinese or Japanese characters
 * (including ideograph aka han or kanji e.g. `字`, hiragana e.g. `あ`, and katakana e.g. `ア`)
 * and other letters (including alphanumerics; e.g. `A` or `1`) in the sentence.
 *
 * @param {*} path current position in nodes tree
 * @returns {boolean} `true` if Space is tend to be inserted between these types of letters, `false` otherwise.
 */
function isInSentenceWithCJSpaces(path) {
  const sentenceNode = getAncestorNode(path, "sentence");
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
 * @typedef {import("./utils.js").TextNode} TextNode
 * @typedef {import("./utils.js").WhitespaceValue} WhitespaceValue
 * @typedef {{next?: TextNode | undefined | null, previous?: TextNode | undefined | null}} AdjacentNodes
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
  const previousLastChar = adjacentNodes.previous.value?.at(-1);
  const nextFirstChar = adjacentNodes.next.value?.[0];

  // From here down, only line breaks between CJ and alphanumeric characters are covered.

  // Convert newline between CJ and specific symbol characters (e.g. ASCII punctuation)  to Space.
  // e.g. :::\n句子句子句子\n::: → ::: 句子句子句子 :::
  //
  // Note: Line breaks like "(\n句子句子\n)" or "句子\n." by Prettier are suppressed in `isBreakable(...)`.
  if (
    lineBreakBetweenTheseAndCJKConvertToSpaceSymbolSet.has(nextFirstChar) ||
    lineBreakBetweenTheseAndCJKConvertToSpaceSymbolSet.has(previousLastChar)
  ) {
    return true;
  }
  // Converting newline between CJ and non-ASCII punctuation to Space does not seem to be better in many cases. (PR welcome)
  if (
    punctuationRegex.test(previousLastChar) ||
    punctuationRegex.test(nextFirstChar)
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
  if (options.proseWrap !== "always") {
    return false;
  }
  if (getAncestorNode(path, SINGLE_LINE_NODE_TYPES)) {
    return false;
  }
  if (adjacentNodes === undefined) {
    return true;
  }
  // Space & newline are always breakable
  if (value !== "") {
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
  const isBreakingCJKLineBreakingRule =
    (adjacentNodes.next?.value !== undefined &&
      noBreakBefore.has(adjacentNodes.next?.value?.[0])) ||
    (adjacentNodes.previous?.value !== undefined &&
      noBreakAfter.has(adjacentNodes.previous?.value?.at(-1)));
  // For "" (CJK and some non-space) higher priority than the following rule
  if (isBreakingCJKLineBreakingRule) {
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
function printLine(path, value, options, adjacentNodes) {
  if (options.proseWrap === "preserve" && value === "\n") {
    return hardline;
  }

  const isBreakable_ = isBreakable(path, value, options, adjacentNodes);

  // Space or empty
  if (value !== "\n") {
    return convertToLineIfBreakable(value);
  }
  // Chinese and Japanese does not use U+0020 Space to divide words, so U+00A0 No-break space must not be replaced with it.
  // Behavior in other languages will not be changed because there are too much things to consider. (PR welcome)
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

function printTable(path, options, print) {
  const { node } = path;

  const columnMaxWidths = [];
  // { [rowIndex: number]: { [columnIndex: number]: {text: string, width: number} } }
  const contents = path.map(
    (rowPath) =>
      rowPath.map((cellPath, columnIndex) => {
        const text = printDocToString(print(), options).formatted;
        const width = getStringWidth(text);
        columnMaxWidths[columnIndex] = Math.max(
          columnMaxWidths[columnIndex] || 3, // minimum width = 3 (---, :--, :-:, --:)
          width
        );
        return { text, width };
      }, "children"),
    "children"
  );

  const alignedTable = printTableContents(/* isCompact */ false);
  if (options.proseWrap !== "never") {
    return [breakParent, alignedTable];
  }

  // Only if the --prose-wrap never is set and it exceeds the print width.
  const compactTable = printTableContents(/* isCompact */ true);
  return [breakParent, group(ifBreak(compactTable, alignedTable))];

  function printTableContents(isCompact) {
    /** @type{Doc[]} */
    const parts = [printRow(contents[0], isCompact), printAlign(isCompact)];
    if (contents.length > 1) {
      parts.push(
        join(
          hardlineWithoutBreakParent,
          contents
            .slice(1)
            .map((rowContents) => printRow(rowContents, isCompact))
        )
      );
    }
    return join(hardlineWithoutBreakParent, parts);
  }

  function printAlign(isCompact) {
    const align = columnMaxWidths.map((width, index) => {
      const align = node.align[index];
      const first = align === "center" || align === "left" ? ":" : "-";
      const last = align === "center" || align === "right" ? ":" : "-";
      const middle = isCompact ? "-" : "-".repeat(width - 2);
      return `${first}${middle}${last}`;
    });

    return `| ${align.join(" | ")} |`;
  }

  function printRow(rowContents, isCompact) {
    const columns = rowContents.map(({ text, width }, columnIndex) => {
      if (isCompact) {
        return text;
      }
      const spaces = columnMaxWidths[columnIndex] - width;
      const align = node.align[columnIndex];
      let before = 0;
      if (align === "right") {
        before = spaces;
      } else if (align === "center") {
        before = Math.floor(spaces / 2);
      }
      const after = spaces - before;
      return `${" ".repeat(before)}${text}${" ".repeat(after)}`;
    });

    return `| ${columns.join(" | ")} |`;
  }
}

function printRoot(path, options, print) {
  /** @typedef {{ index: number, offset: number }} IgnorePosition */
  /** @type {Array<{start: IgnorePosition, end: IgnorePosition}>} */
  const ignoreRanges = [];

  /** @type {IgnorePosition | null} */
  let ignoreStart = null;

  const { children } = path.node;
  for (const [index, childNode] of children.entries()) {
    switch (isPrettierIgnore(childNode)) {
      case "start":
        if (ignoreStart === null) {
          ignoreStart = { index, offset: childNode.position.end.offset };
        }
        break;
      case "end":
        if (ignoreStart !== null) {
          ignoreRanges.push({
            start: ignoreStart,
            end: { index, offset: childNode.position.start.offset },
          });
          ignoreStart = null;
        }
        break;
      default:
        // do nothing
        break;
    }
  }

  return printChildren(path, options, print, {
    processor(childPath, index) {
      if (ignoreRanges.length > 0) {
        const ignoreRange = ignoreRanges[0];

        if (index === ignoreRange.start.index) {
          return [
            printIgnoreComment(children[ignoreRange.start.index]),
            options.originalText.slice(
              ignoreRange.start.offset,
              ignoreRange.end.offset
            ),
            printIgnoreComment(children[ignoreRange.end.index]),
          ];
        }

        if (ignoreRange.start.index < index && index < ignoreRange.end.index) {
          return false;
        }

        if (index === ignoreRange.end.index) {
          ignoreRanges.shift();
          return false;
        }
      }

      return print();
    },
  });
}

function printChildren(path, options, print, events = {}) {
  const { postprocessor } = events;
  const processor = events.processor || (() => print());

  const { node } = path;
  const parts = [];

  let lastChildNode;

  path.each((childPath, index) => {
    const childNode = childPath.node;

    const result = processor(childPath, index);
    if (result !== false) {
      const data = {
        parts,
        prevNode: lastChildNode,
        parentNode: node,
        options,
      };

      if (shouldPrePrintHardline(childNode, data)) {
        parts.push(hardline);

        // Can't find a case to pass `shouldPrePrintTripleHardline`
        /* istanbul ignore next */
        if (lastChildNode && TRAILING_HARDLINE_NODES.has(lastChildNode.type)) {
          if (shouldPrePrintTripleHardline(childNode, data)) {
            parts.push(hardline);
          }
        } else {
          if (
            shouldPrePrintDoubleHardline(childNode, data) ||
            shouldPrePrintTripleHardline(childNode, data)
          ) {
            parts.push(hardline);
          }

          if (shouldPrePrintTripleHardline(childNode, data)) {
            parts.push(hardline);
          }
        }
      }

      parts.push(result);

      lastChildNode = childNode;
    }
  }, "children");

  return postprocessor ? postprocessor(parts) : parts;
}

function printIgnoreComment(node) {
  if (node.type === "html") {
    return node.value;
  }

  if (
    node.type === "paragraph" &&
    Array.isArray(node.children) &&
    node.children.length === 1 &&
    node.children[0].type === "esComment"
  ) {
    return ["{/* ", node.children[0].value, " */}"];
  }
}

function getLastDescendantNode(node) {
  let current = node;
  while (isNonEmptyArray(current.children)) {
    current = current.children.at(-1);
  }
  return current;
}

/** @return {false | 'next' | 'start' | 'end'} */
function isPrettierIgnore(node) {
  let match;

  if (node.type === "html") {
    match = node.value.match(/^<!--\s*prettier-ignore(?:-(start|end))?\s*-->$/);
  } else {
    let comment;

    if (node.type === "esComment") {
      comment = node;
    } else if (
      node.type === "paragraph" &&
      node.children.length === 1 &&
      node.children[0].type === "esComment"
    ) {
      comment = node.children[0];
    }

    if (comment) {
      match = comment.value.match(/^prettier-ignore(?:-(start|end))?$/);
    }
  }

  return match ? match[1] || "next" : false;
}

function shouldPrePrintHardline(node, data) {
  const isFirstNode = data.parts.length === 0;
  const isInlineNode = INLINE_NODE_TYPES.includes(node.type);

  const isInlineHTML =
    node.type === "html" &&
    INLINE_NODE_WRAPPER_TYPES.includes(data.parentNode.type);

  return !isFirstNode && !isInlineNode && !isInlineHTML;
}

function shouldPrePrintDoubleHardline(node, data) {
  const isSequence = (data.prevNode && data.prevNode.type) === node.type;
  const isSiblingNode = isSequence && SIBLING_NODE_TYPES.has(node.type);

  const isInTightListItem =
    data.parentNode.type === "listItem" && !data.parentNode.loose;

  const isPrevNodeLooseListItem =
    data.prevNode?.type === "listItem" && data.prevNode.loose;

  const isPrevNodePrettierIgnore = isPrettierIgnore(data.prevNode) === "next";

  const isBlockHtmlWithoutBlankLineBetweenPrevHtml =
    node.type === "html" &&
    data.prevNode?.type === "html" &&
    data.prevNode.position.end.line + 1 === node.position.start.line;

  const isHtmlDirectAfterListItem =
    node.type === "html" &&
    data.parentNode.type === "listItem" &&
    data.prevNode?.type === "paragraph" &&
    data.prevNode.position.end.line + 1 === node.position.start.line;

  return (
    isPrevNodeLooseListItem ||
    !(
      isSiblingNode ||
      isInTightListItem ||
      isPrevNodePrettierIgnore ||
      isBlockHtmlWithoutBlankLineBetweenPrevHtml ||
      isHtmlDirectAfterListItem
    )
  );
}

function shouldPrePrintTripleHardline(node, data) {
  const isPrevNodeList = data.prevNode?.type === "list";
  const isIndentedCode = node.type === "code" && node.isIndented;

  return isPrevNodeList && isIndentedCode;
}

function shouldRemainTheSameContent(path) {
  const ancestorNode = getAncestorNode(path, [
    "linkReference",
    "imageReference",
  ]);

  return (
    ancestorNode &&
    (ancestorNode.type !== "linkReference" ||
      ancestorNode.referenceType !== "full")
  );
}

/**
 * @param {string} url
 * @param {string[] | string} [dangerousCharOrChars]
 * @returns {string}
 */
function printUrl(url, dangerousCharOrChars = []) {
  const dangerousChars = [
    " ",
    ...(Array.isArray(dangerousCharOrChars)
      ? dangerousCharOrChars
      : [dangerousCharOrChars]),
  ];
  return new RegExp(dangerousChars.map((x) => `\\${x}`).join("|")).test(url)
    ? `<${url}>`
    : url;
}

function printTitle(title, options, printSpace = true) {
  if (!title) {
    return "";
  }
  if (printSpace) {
    return " " + printTitle(title, options, false);
  }

  // title is escaped after `remark-parse` v7
  title = title.replace(/\\(["')])/g, "$1");

  if (title.includes('"') && title.includes("'") && !title.includes(")")) {
    return `(${title})`; // avoid escaped quotes
  }
  // faster than using RegExps: https://jsperf.com/performance-of-match-vs-split
  const singleCount = title.split("'").length - 1;
  const doubleCount = title.split('"').length - 1;
  const quote =
    singleCount > doubleCount
      ? '"'
      : doubleCount > singleCount
      ? "'"
      : options.singleQuote
      ? "'"
      : '"';
  title = title.replace(/\\/, "\\\\");
  title = title.replace(new RegExp(`(${quote})`, "g"), "\\$1");
  return `${quote}${title}${quote}`;
}

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

function hasPrettierIgnore(path) {
  return path.index > 0 && isPrettierIgnore(path.previous) === "next";
}

const printer = {
  preprocess,
  print: genericPrint,
  embed,
  massageAstNode: clean,
  hasPrettierIgnore,
  insertPragma,
  getVisitorKeys,
};

export default printer;
