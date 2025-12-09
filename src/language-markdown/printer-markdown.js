import collapseWhiteSpace from "collapse-white-space";
import escapeStringRegexp from "escape-string-regexp";
import {
  align,
  DOC_TYPE_STRING,
  fill,
  getDocType,
  group,
  hardline,
  indent,
  line,
  literalline,
  markAsRoot,
  replaceEndOfLine,
  softline,
} from "../document/index.js";
import getMaxContinuousCount from "../utilities/get-max-continuous-count.js";
import getMinNotPresentContinuousCount from "../utilities/get-min-not-present-continuous-count.js";
import getPreferredQuote from "../utilities/get-preferred-quote.js";
import UnexpectedNodeError from "../utilities/unexpected-node-error.js";
import clean from "./clean.js";
import embed from "./embed.js";
import getVisitorKeys from "./get-visitor-keys.js";
import { locEnd, locStart } from "./loc.js";
import { insertPragma } from "./pragma.js";
import { printChildren } from "./print/children.js";
import { printList } from "./print/list.js";
import { printTable } from "./print/table.js";
import { printWord } from "./print/word.js";
import { printParagraph } from "./print-paragraph.js";
import preprocess from "./print-preprocess.js";
import { printSentence } from "./print-sentence.js";
import { printWhitespace } from "./print-whitespace.js";
import {
  getFencedCodeBlockValue,
  getNthListSiblingIndex,
  isAutolink,
  isPrettierIgnore,
  splitText,
} from "./utilities.js";

/**
 * @import {Doc} from "../document/index.js"
 */

function prevOrNextWord(path) {
  const { previous, next } = path;
  const hasPrevOrNextWord =
    (previous?.type === "sentence" &&
      previous.children.at(-1)?.type === "word" &&
      !previous.children.at(-1).hasTrailingPunctuation) ||
    (next?.type === "sentence" &&
      next.children[0]?.type === "word" &&
      !next.children[0].hasLeadingPunctuation);
  return hasPrevOrNextWord;
}

function genericPrint(path, options, print) {
  const { node } = path;

  if (shouldRemainTheSameContent(path)) {
    /*
     * We assume parts always meet following conditions:
     * - parts.length is odd
     * - odd (0-indexed) elements are line-like doc
     */
    /** @type {Doc[]} */
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
      // In this path, doc is line. To meet the condition, we need additional element "".
      parts.push(doc, "");
    }
    return fill(parts);
  }

  switch (node.type) {
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
    case "word":
      return printWord(path);
    case "whitespace": {
      const { next } = path;

      const proseWrap =
        // leading char that may cause different syntax
        next && /^>|^(?:[*+-]|#{1,6}|\d+[).])$/u.test(next.value)
          ? "never"
          : options.proseWrap;

      return printWhitespace(path, node.value, proseWrap);
    }
    case "emphasis": {
      let style;
      if (isAutolink(node.children[0])) {
        style = options.originalText[node.position.start.offset];
      } else {
        const hasPrevOrNextWord = prevOrNextWord(path); // `1*2*3` is considered emphasis but `1_2_3` is not
        const inStrongAndHasPrevOrNextWord = // `1***2***3` is considered strong emphasis but `1**_2_**3` is not
          path.callParent(
            ({ node }) => node.type === "strong" && prevOrNextWord(path),
          );
        style =
          hasPrevOrNextWord ||
          inStrongAndHasPrevOrNextWord ||
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
      const backtickString = "`".repeat(backtickCount);
      const padding =
        code.startsWith("`") ||
        code.endsWith("`") ||
        (/^[\n ]/u.test(code) && /[\n ]$/u.test(code) && /[^\n ]/u.test(code))
          ? " "
          : "";
      return [backtickString, padding, code, padding, backtickString];
    }
    case "wikiLink": {
      let contents = "";
      if (options.proseWrap === "preserve") {
        contents = node.value;
      } else {
        contents = node.value.replaceAll(/[\t\n]+/gu, " ");
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
      const isHtmlComment = /^<!--.*-->$/su.test(value);

      return replaceEndOfLine(
        value,
        isHtmlComment ? hardline : markAsRoot(literalline),
      );
    }
    case "list":
      return printList(path, options, print);
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
      return /\s/u.test(options.originalText[node.position.start.offset])
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
      return node.value.trimEnd();
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

    case "frontMatter": // Handled in core
    case "tableRow": // handled in "table"
    case "listItem": // handled in "list"
    case "text": // handled in other types
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "Markdown");
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

  return new RegExp(
    dangerousChars.map((x) => escapeStringRegexp(x)).join("|"),
    "u",
  ).test(url)
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
  title = title.replaceAll(/\\(?=["')])/gu, "");

  if (title.includes('"') && title.includes("'") && !title.includes(")")) {
    return `(${title})`; // avoid escaped quotes
  }
  const quote = getPreferredQuote(title, options.singleQuote);
  title = title.replaceAll("\\", "\\\\");
  title = title.replaceAll(quote, `\\${quote}`);
  return `${quote}${title}${quote}`;
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
  features: {
    experimental_frontMatterSupport: {
      massageAstNode: true,
      embed: true,
      print: true,
    },
  },
  preprocess,
  print: genericPrint,
  embed,
  massageAstNode: clean,
  hasPrettierIgnore,
  insertPragma,
  getVisitorKeys,
};

export default printer;
