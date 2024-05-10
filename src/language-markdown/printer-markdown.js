import collapseWhiteSpace from "collapse-white-space";

import {
  align,
  fill,
  group,
  hardline,
  indent,
  line,
  literalline,
  markAsRoot,
  softline,
} from "../document/builders.js";
import { DOC_TYPE_STRING } from "../document/constants.js";
import { getDocType, replaceEndOfLine } from "../document/utils.js";
import getMaxContinuousCount from "../utils/get-max-continuous-count.js";
import getMinNotPresentContinuousCount from "../utils/get-min-not-present-continuous-count.js";
import getPreferredQuote from "../utils/get-preferred-quote.js";
import UnexpectedNodeError from "../utils/unexpected-node-error.js";
import clean from "./clean.js";
import { PUNCTUATION_REGEXP } from "./constants.evaluate.js";
import embed from "./embed.js";
import getVisitorKeys from "./get-visitor-keys.js";
import { locEnd, locStart } from "./loc.js";
import { insertPragma } from "./pragma.js";
import { printTable } from "./print/table.js";
import { printParagraph } from "./print-paragraph.js";
import preprocess from "./print-preprocess.js";
import { printSentence } from "./print-sentence.js";
import { printWhitespace } from "./print-whitespace.js";
import {
  getFencedCodeBlockValue,
  hasGitDiffFriendlyOrderedList,
  INLINE_NODE_TYPES,
  INLINE_NODE_WRAPPER_TYPES,
  isAutolink,
  splitText,
} from "./utils.js";

/**
 * @typedef {import("../document/builders.js").Doc} Doc
 */

const SIBLING_NODE_TYPES = new Set(["listItem", "definition"]);

function genericPrint(path, options, print) {
  const { node } = path;

  if (shouldRemainTheSameContent(path)) {
    /** @type {Doc} */
    const parts = [""];
    const textsNodes = splitText(
      options.originalText.slice(
        node.position.start.offset,
        node.position.end.offset,
      ),
    );
    for (const node of textsNodes) {
      if (node.type === "word") {
        parts.push([parts.pop(), node.value]);
        continue;
      }
      const doc = printWhitespace(path, node.value, options.proseWrap, true);
      if (getDocType(doc) === DOC_TYPE_STRING) {
        parts.push([parts.pop(), doc]);
        continue;
      }
      parts.push(doc);
    }
    return fill(parts);
  }

  switch (node.type) {
    case "front-matter":
      return options.originalText.slice(
        node.position.start.offset,
        node.position.end.offset,
      );
    case "root":
      /* c8 ignore next 3 */
      if (node.children.length === 0) {
        return "";
      }
      return [printRoot(path, options, print), hardline];
    case "paragraph":
      return printParagraph(path, options, print);
    case "sentence":
      return printSentence(path, print);
    case "word": {
      let escapedValue = node.value
        .replaceAll("*", String.raw`\*`) // escape all `*`
        .replaceAll(
          new RegExp(
            [
              `(^|${PUNCTUATION_REGEXP.source})(_+)`,
              `(_+)(${PUNCTUATION_REGEXP.source}|$)`,
            ].join("|"),
            "g",
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
    case "whitespace": {
      const { next } = path;

      const proseWrap =
        // leading char that may cause different syntax
        next && /^>|^(?:[*+-]|#{1,6}|\d+[).])$/.test(next.value)
          ? "never"
          : options.proseWrap;

      return printWhitespace(path, node.value, proseWrap);
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
          hasPrevOrNextWord ||
          path.hasAncestor((node) => node.type === "emphasis")
            ? "*"
            : "_";
      }
      return [style, printChildren(path, options, print), style];
    }
    case "strong":
      return ["**", printChildren(path, options, print), "**"];
    case "delete":
      return ["~~", printChildren(path, options, print), "~~"];
    case "inlineCode": {
      const code =
        options.proseWrap === "preserve"
          ? node.value
          : node.value.replaceAll("\n", " ");
      const backtickCount = getMinNotPresentContinuousCount(code, "`");
      const backtickString = "`".repeat(backtickCount || 1);
      const padding =
        code.startsWith("`") ||
        code.endsWith("`") ||
        (/^[\n ]/.test(code) && /[\n ]$/.test(code) && /[^\n ]/.test(code))
          ? " "
          : "";
      return [backtickString, padding, code, padding, backtickString];
    }
    case "wikiLink": {
      let contents = "";
      if (options.proseWrap === "preserve") {
        contents = node.value;
      } else {
        contents = node.value.replaceAll(/[\t\n]+/g, " ");
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
              node.position.start.offset + 1 + mailto.length,
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
            node.position.end.offset,
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
        Math.max(3, getMaxContinuousCount(node.value, styleUnit) + 1),
      );
      return [
        style,
        node.lang || "",
        node.meta ? " " + node.meta : "",
        hardline,
        replaceEndOfLine(
          getFencedCodeBlockValue(node, options.originalText),
          hardline,
        ),
        hardline,
        style,
      ];
    }
    case "html": {
      const { parent, isLast } = path;
      const value =
        parent.type === "root" && isLast ? node.value.trimEnd() : node.value;
      const isHtmlComment = /^<!--.*-->$/s.test(value);

      return replaceEndOfLine(
        value,
        // @ts-expect-error
        isHtmlComment ? hardline : markAsRoot(literalline),
      );
    }
    case "list": {
      const nthSiblingIndex = getNthListSiblingIndex(node, path.parent);

      const isGitDiffFriendlyOrderedList = hasGitDiffFriendlyOrderedList(
        node,
        options,
      );

      return printChildren(path, options, print, {
        processor(childPath) {
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
              printListItem(childPath, options, print, prefix),
            ),
          ];

          function getPrefix() {
            const rawPrefix = node.ordered
              ? (childPath.isFirst
                  ? node.start
                  : isGitDiffFriendlyOrderedList
                    ? 1
                    : node.start + childPath.index) +
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
      const { ancestors } = path;
      const counter = ancestors.findIndex((node) => node.type === "list");
      if (counter === -1) {
        return "---";
      }
      const nthSiblingIndex = getNthListSiblingIndex(
        ancestors[counter],
        ancestors[counter + 1],
      );
      return nthSiblingIndex % 2 === 0 ? "***" : "---";
    }
    case "linkReference":
      return [
        "[",
        printChildren(path, options, print),
        "]",
        node.referenceType === "full"
          ? printLinkReference(node)
          : node.referenceType === "collapsed"
            ? "[]"
            : "",
      ];
    case "imageReference":
      switch (node.referenceType) {
        case "full":
          return ["![", node.alt || "", "]", printLinkReference(node)];
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
        printLinkReference(node),
        ":",
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
    /* c8 ignore next 2 */
    case "footnote":
      return ["[^", printChildren(path, options, print), "]"];
    case "footnoteReference":
      return printFootnoteReference(node);
    case "footnoteDefinition": {
      const shouldInlineFootnote =
        node.children.length === 1 &&
        node.children[0].type === "paragraph" &&
        (options.proseWrap === "never" ||
          (options.proseWrap === "preserve" &&
            node.children[0].position.start.line ===
              node.children[0].position.end.line));
      return [
        printFootnoteReference(node),
        ": ",
        shouldInlineFootnote
          ? printChildren(path, options, print)
          : group([
              align(
                " ".repeat(4),
                printChildren(path, options, print, {
                  processor: ({ isFirst }) =>
                    isFirst ? group([softline, print()]) : print(),
                }),
              ),
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
    case "import":
    case "export":
    case "jsx":
      return node.value;
    case "esComment":
      return ["{/* ", node.value, " */}"];
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
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "Markdown");
  }
}

function printListItem(path, options, print, listPrefix) {
  const { node } = path;
  const prefix = node.checked === null ? "" : node.checked ? "[x] " : "[ ] ";
  return [
    prefix,
    printChildren(path, options, print, {
      processor({ node, isFirst }) {
        if (isFirst && node.type !== "list") {
          return align(" ".repeat(prefix.length), print());
        }

        const alignment = " ".repeat(
          clamp(options.tabWidth - listPrefix.length, 0, 3), // 4+ will cause indented code block
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
      additionalSpaces >= 4 ? 0 : additionalSpaces, // 4+ will cause indented code block
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
    (siblingNode) => siblingNode.ordered === node.ordered,
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
    processor({ index }) {
      if (ignoreRanges.length > 0) {
        const ignoreRange = ignoreRanges[0];

        if (index === ignoreRange.start.index) {
          return [
            printIgnoreComment(children[ignoreRange.start.index]),
            options.originalText.slice(
              ignoreRange.start.offset,
              ignoreRange.end.offset,
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
  const { processor = print } = events;

  const parts = [];

  path.each(() => {
    const result = processor(path);
    if (result !== false) {
      if (parts.length > 0 && shouldPrePrintHardline(path)) {
        parts.push(hardline);

        if (
          shouldPrePrintDoubleHardline(path, options) ||
          shouldPrePrintTripleHardline(path)
        ) {
          parts.push(hardline);
        }

        if (shouldPrePrintTripleHardline(path)) {
          parts.push(hardline);
        }
      }

      parts.push(result);
    }
  }, "children");

  return parts;
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

function shouldPrePrintHardline({ node, parent }) {
  const isInlineNode = INLINE_NODE_TYPES.has(node.type);

  const isInlineHTML =
    node.type === "html" && INLINE_NODE_WRAPPER_TYPES.has(parent.type);

  return !isInlineNode && !isInlineHTML;
}

function isLooseListItem(node, options) {
  return (
    node.type === "listItem" &&
    (node.spread ||
      // Check if `listItem` ends with `\n`
      // since it can't be empty, so we only need check the last character
      options.originalText.charAt(node.position.end.offset - 1) === "\n")
  );
}

function shouldPrePrintDoubleHardline({ node, previous, parent }, options) {
  const isPrevNodeLooseListItem = isLooseListItem(previous, options);

  if (isPrevNodeLooseListItem) {
    return true;
  }

  const isSequence = previous.type === node.type;
  const isSiblingNode = isSequence && SIBLING_NODE_TYPES.has(node.type);
  const isInTightListItem =
    parent.type === "listItem" && !isLooseListItem(parent, options);
  const isPrevNodePrettierIgnore = isPrettierIgnore(previous) === "next";
  const isBlockHtmlWithoutBlankLineBetweenPrevHtml =
    node.type === "html" &&
    previous.type === "html" &&
    previous.position.end.line + 1 === node.position.start.line;
  const isHtmlDirectAfterListItem =
    node.type === "html" &&
    parent.type === "listItem" &&
    previous.type === "paragraph" &&
    previous.position.end.line + 1 === node.position.start.line;

  return !(
    isSiblingNode ||
    isInTightListItem ||
    isPrevNodePrettierIgnore ||
    isBlockHtmlWithoutBlankLineBetweenPrevHtml ||
    isHtmlDirectAfterListItem
  );
}

function shouldPrePrintTripleHardline({ node, previous }) {
  const isPrevNodeList = previous.type === "list";
  const isIndentedCode = node.type === "code" && node.isIndented;

  return isPrevNodeList && isIndentedCode;
}

function shouldRemainTheSameContent(path) {
  const node = path.findAncestor(
    (node) => node.type === "linkReference" || node.type === "imageReference",
  );
  return (
    node && (node.type !== "linkReference" || node.referenceType !== "full")
  );
}

const encodeUrl = (url, characters) => {
  for (const character of characters) {
    url = url.replaceAll(character, encodeURIComponent(character));
  }
  return url;
};

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
    ? `<${encodeUrl(url, "<>")}>`
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
  title = title.replaceAll(/\\(?=["')])/g, "");

  if (title.includes('"') && title.includes("'") && !title.includes(")")) {
    return `(${title})`; // avoid escaped quotes
  }
  const quote = getPreferredQuote(title, options.singleQuote);
  title = title.replaceAll("\\", "\\\\");
  title = title.replaceAll(quote, `\\${quote}`);
  return `${quote}${title}${quote}`;
}

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

function hasPrettierIgnore(path) {
  return path.index > 0 && isPrettierIgnore(path.previous) === "next";
}

// `remark-parse` lowercase the `label` as `identifier`, we don't want do that
// https://github.com/remarkjs/remark/blob/daddcb463af2d5b2115496c395d0571c0ff87d15/packages/remark-parse/lib/tokenize/reference.js
function printLinkReference(node) {
  return `[${collapseWhiteSpace(node.label)}]`;
}

function printFootnoteReference(node) {
  return `[^${node.label}]`;
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
