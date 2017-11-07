"use strict";

const util = require("./util");
const docBuilders = require("./doc-builders");
const concat = docBuilders.concat;
const join = docBuilders.join;
const line = docBuilders.line;
const hardline = docBuilders.hardline;
const softline = docBuilders.softline;
const fill = docBuilders.fill;
const align = docBuilders.align;
const docPrinter = require("./doc-printer");
const printDocToString = docPrinter.printDocToString;
const escapeStringRegexp = require("escape-string-regexp");

// http://spec.commonmark.org/0.25/#ascii-punctuation-character
const asciiPunctuationPattern = escapeStringRegexp(
  "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"
);

const SINGLE_LINE_NODE_TYPES = ["heading", "tableCell", "footnoteDefinition"];

const SIBLING_NODE_TYPES = ["listItem", "definition", "footnoteDefinition"];

const INLINE_NODE_TYPES = [
  "inlineCode",
  "emphasis",
  "strong",
  "delete",
  "link",
  "linkReference",
  "image",
  "imageReference",
  "footnote",
  "footnoteReference",
  "sentence",
  "whitespace",
  "word",
  "break"
];

const INLINE_NODE_WRAPPER_TYPES = INLINE_NODE_TYPES.concat([
  "tableCell",
  "paragraph"
]);

function genericPrint(path, options, print) {
  const node = path.getValue();

  if (shouldRemainTheSameContent(path)) {
    return concat(
      util
        .splitText(
          options.originalText.slice(
            node.position.start.offset,
            node.position.end.offset
          )
        )
        .map(
          node =>
            node.type === "word"
              ? node.value
              : node.value === "" ? "" : printLine(path, line)
        )
    );
  }

  switch (node.type) {
    case "root":
      return normalizeDoc(
        concat([printChildren(path, options, print), hardline])
      );
    case "paragraph":
      return printChildren(path, options, print, {
        postprocessor: fill
      });
    case "sentence":
      return printChildren(path, options, print);
    case "word":
      return getAncestorNode(path, "inlineCode")
        ? node.value
        : node.value
            .replace(/(^|[^\\])\*/g, "$1\\*") // escape all unescaped `*` and `_`
            .replace(/\b(^|[^\\])_\b/g, "$1\\_"); // `1_2_3` is not considered emphasis
    case "whitespace": {
      const parentNode = path.getParentNode();
      const index = parentNode.children.indexOf(node);
      const nextNode = parentNode.children[index + 1];

      // special prefix that may cause different meaning
      if (nextNode && nextNode.value.match(/^(#{1,6}|>+)|^(-|\+|\*)$/)) {
        return node.value === "" ? "" : " ";
      }

      return printLine(path, node.value === "" ? softline : line);
    }
    case "emphasis": {
      const parentNode = path.getParentNode();
      const index = parentNode.children.indexOf(node);
      const prevNode = parentNode.children[index - 1];
      const nextNode = parentNode.children[index + 1];
      const hasPrevOrNextWord = // `1*2*3` is considered emphais but `1_2_3` is not
        (prevNode &&
          prevNode.type === "sentence" &&
          prevNode.children.length > 0 &&
          prevNode.children[prevNode.children.length - 1].type === "word" &&
          prevNode.children[prevNode.children.length - 1].value.match(
            new RegExp(`[^${asciiPunctuationPattern}]$`)
          )) ||
        (nextNode &&
          nextNode.type === "sentence" &&
          nextNode.children.length > 0 &&
          nextNode.children[0].type === "word" &&
          nextNode.children[0].value.match(
            new RegExp(`^[^${asciiPunctuationPattern}]`)
          ));
      const style =
        hasPrevOrNextWord || getAncestorNode(path, "emphasis") ? "*" : "_";
      return concat([style, printChildren(path, options, print), style]);
    }
    case "strong":
      return concat(["**", printChildren(path, options, print), "**"]);
    case "delete":
      return concat(["~~", printChildren(path, options, print), "~~"]);
    case "inlineCode": {
      const backtickCount = util.getMaxContinuousCount(node.value, "`");
      const style = backtickCount === 1 ? "``" : "`";
      const gap = backtickCount ? printLine(path, line) : "";
      return concat([
        style,
        gap,
        printChildren(path, options, print),
        gap,
        style
      ]);
    }
    case "link":
      switch (options.originalText[node.position.start.offset]) {
        case "<":
          return concat(["<", node.url, ">"]);
        case "[":
          return concat([
            "[",
            printChildren(path, options, print),
            "](",
            printUrl(node.url, ")"),
            node.title ? ` ${printTitle(node.title)}` : "",
            ")"
          ]);
        default:
          return options.originalText.slice(
            node.position.start.offset,
            node.position.end.offset
          );
      }
    case "image":
      return concat([
        "![",
        node.alt || "",
        "](",
        printUrl(node.url, ")"),
        node.title ? ` ${printTitle(node.title)}` : "",
        ")"
      ]);
    case "blockquote":
      return concat(["> ", align("> ", printChildren(path, options, print))]);
    case "heading":
      return concat([
        "#".repeat(node.depth) + " ",
        printChildren(path, options, print)
      ]);
    case "code": {
      if (
        // the first char may point to `\n`, e.g. `\n\t\tbar`, just ignore it
        /^\n?( {4,}|\t)/.test(
          options.originalText.slice(
            node.position.start.offset,
            node.position.end.offset
          )
        )
      ) {
        // indented code block
        return align(
          4,
          concat([" ".repeat(4), join(hardline, node.value.split("\n"))])
        );
      }

      // fenced code block
      const styleUnit = options.__inJsTemplate ? "~" : "`";
      const style = styleUnit.repeat(
        Math.max(3, util.getMaxContinuousCount(node.value, styleUnit) + 1)
      );
      return concat([
        style,
        node.lang || "",
        hardline,
        join(hardline, node.value.split("\n")),
        hardline,
        style
      ]);
    }
    case "yaml":
      return concat(["---", hardline, node.value, hardline, "---"]);
    case "html": {
      const parentNode = path.getParentNode();
      return parentNode.type === "root" &&
        parentNode.children[parentNode.children.length - 1] === node
        ? node.value.trimRight()
        : node.value;
    }
    case "list": {
      const nthSiblingIndex = getNthListSiblingIndex(
        node,
        path.getParentNode()
      );

      const isGitDiffFriendlyOrderedList =
        node.ordered &&
        node.children.length > 1 &&
        /^\s*1(\.|\))/.test(
          options.originalText.slice(
            node.children[1].position.start.offset,
            node.children[1].position.end.offset
          )
        );

      return printChildren(path, options, print, {
        processor: (childPath, index) => {
          const prefix = node.ordered
            ? (index === 0
                ? node.start
                : isGitDiffFriendlyOrderedList ? 1 : node.start + index) +
              (nthSiblingIndex % 2 === 0 ? ". " : ") ")
            : nthSiblingIndex % 2 === 0 ? "* " : "- ";
          return concat([prefix, align(prefix.length, childPath.call(print))]);
        }
      });
    }
    case "listItem": {
      const prefix =
        node.checked === null ? "" : node.checked ? "[x] " : "[ ] ";
      return concat([
        prefix,
        align(prefix.length, printChildren(path, options, print))
      ]);
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
      return nthSiblingIndex % 2 === 0 ? "---" : "***";
    }
    case "linkReference":
      return concat([
        "[",
        printChildren(path, options, print),
        "]",
        node.referenceType === "full"
          ? concat(["[", node.identifier, "]"])
          : node.referenceType === "collapsed" ? "[]" : ""
      ]);
    case "imageReference":
      switch (node.referenceType) {
        case "full":
          return concat(["![", node.alt, "][", node.identifier, "]"]);
        default:
          return concat([
            "![",
            node.alt,
            "]",
            node.referenceType === "collapsed" ? "[]" : ""
          ]);
      }
    case "definition":
      return concat([
        "[",
        node.identifier,
        "]: ",
        printUrl(node.url),
        node.title === null ? "" : ` ${printTitle(node.title)}`
      ]);
    case "footnote":
      return concat(["[^", printChildren(path, options, print), "]"]);
    case "footnoteReference":
      return concat(["[^", node.identifier, "]"]);
    case "footnoteDefinition":
      return concat([
        "[^",
        node.identifier,
        "]: ",
        printChildren(path, options, print)
      ]);
    case "table":
      return printTable(path, options, print);
    case "tableCell":
      return printChildren(path, options, print);
    case "break":
      return concat(["\\", hardline]);
    case "tableRow": // handled in "table"
    default:
      throw new Error(`Unknown markdown type ${JSON.stringify(node.type)}`);
  }
}

function getNthListSiblingIndex(node, parentNode) {
  return getNthSiblingIndex(
    node,
    parentNode,
    siblingNode => siblingNode.ordered === node.ordered
  );
}

function getNthSiblingIndex(node, parentNode, condition) {
  condition = condition || (() => true);

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
  const types = [].concat(typeOrTypes);

  let counter = -1;
  let ancestorNode;

  while ((ancestorNode = path.getParentNode(++counter))) {
    if (types.indexOf(ancestorNode.type) !== -1) {
      return counter;
    }
  }

  return -1;
}

function getAncestorNode(path, typeOrTypes) {
  const counter = getAncestorCounter(path, typeOrTypes);
  return counter === -1 ? null : path.getParentNode(counter);
}

function printLine(path, lineOrSoftline) {
  const isBreakable = !getAncestorNode(path, SINGLE_LINE_NODE_TYPES);
  return lineOrSoftline === line
    ? isBreakable ? line : " "
    : isBreakable ? softline : "";
}

function printTable(path, options, print) {
  const node = path.getValue();
  const contents = []; // { [rowIndex: number]: { [columnIndex: number]: string } }

  path.map(rowPath => {
    const rowContents = [];

    rowPath.map(cellPath => {
      rowContents.push(
        printDocToString(cellPath.call(print), options).formatted
      );
    }, "children");

    contents.push(rowContents);
  }, "children");

  const columnMaxWidths = contents.reduce(
    (currentWidths, rowContents) =>
      currentWidths.map((width, columnIndex) =>
        Math.max(width, util.getStringWidth(rowContents[columnIndex]))
      ),
    contents[0].map(() => 3) // minimum width = 3 (---, :--, :-:, --:)
  );

  return join(hardline, [
    printRow(contents[0]),
    printSeparator(),
    join(hardline, contents.slice(1).map(printRow))
  ]);

  function printSeparator() {
    return concat([
      "| ",
      join(
        " | ",
        columnMaxWidths.map((width, index) => {
          switch (node.align[index]) {
            case "left":
              return ":" + "-".repeat(width - 1);
            case "right":
              return "-".repeat(width - 1) + ":";
            case "center":
              return ":" + "-".repeat(width - 2) + ":";
            default:
              return "-".repeat(width);
          }
        })
      ),
      " |"
    ]);
  }

  function printRow(rowContents) {
    return concat([
      "| ",
      join(
        " | ",
        rowContents.map((rowContent, columnIndex) => {
          switch (node.align[columnIndex]) {
            case "right":
              return alignRight(rowContent, columnMaxWidths[columnIndex]);
            case "center":
              return alignCenter(rowContent, columnMaxWidths[columnIndex]);
            default:
              return alignLeft(rowContent, columnMaxWidths[columnIndex]);
          }
        })
      ),
      " |"
    ]);
  }

  function alignLeft(text, width) {
    return concat([text, " ".repeat(width - util.getStringWidth(text))]);
  }

  function alignRight(text, width) {
    return concat([" ".repeat(width - util.getStringWidth(text)), text]);
  }

  function alignCenter(text, width) {
    const spaces = width - util.getStringWidth(text);
    const left = Math.floor(spaces / 2);
    const right = spaces - left;
    return concat([" ".repeat(left), text, " ".repeat(right)]);
  }
}

function printChildren(path, options, print, events) {
  events = events || {};

  const postprocessor = events.postprocessor || concat;
  const processor = events.processor || (childPath => childPath.call(print));

  const node = path.getValue();
  const parts = [];

  let counter = 0;
  let lastChildNode;
  let prettierIgnore = false;

  path.map((childPath, index) => {
    const childNode = childPath.getValue();

    const result = prettierIgnore
      ? options.originalText.slice(
          childNode.position.start.offset,
          childNode.position.end.offset
        )
      : processor(childPath, index);

    prettierIgnore = false;

    if (result !== false) {
      prettierIgnore = isPrettierIgnore(childNode);

      const data = {
        parts,
        index: counter++,
        prevNode: lastChildNode,
        parentNode: node,
        options
      };

      if (!shouldNotPrePrintHardline(childNode, data)) {
        parts.push(hardline);

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

      parts.push(result);

      lastChildNode = childNode;
    }
  }, "children");

  return postprocessor(parts);
}

function isPrettierIgnore(node) {
  return (
    node.type === "html" && /^<!--\s*prettier-ignore\s*-->$/.test(node.value)
  );
}

function shouldNotPrePrintHardline(node, data) {
  const isFirstNode = data.parts.length === 0;
  const isInlineNode = INLINE_NODE_TYPES.indexOf(node.type) !== -1;

  const isInlineHTML =
    node.type === "html" &&
    INLINE_NODE_WRAPPER_TYPES.indexOf(data.parentNode.type) !== -1;

  return isFirstNode || isInlineNode || isInlineHTML;
}

function shouldPrePrintDoubleHardline(node, data) {
  const isSequence = (data.prevNode && data.prevNode.type) === node.type;
  const isSiblingNode =
    isSequence && SIBLING_NODE_TYPES.indexOf(node.type) !== -1;

  const isInTightListItem =
    data.parentNode.type === "listItem" && !data.parentNode.loose;

  const isPrevNodeLooseListItem =
    data.prevNode && data.prevNode.type === "listItem" && data.prevNode.loose;

  const isPrevNodePrettierIgnore = isPrettierIgnore(data.prevNode);

  return (
    isPrevNodeLooseListItem ||
    !(isSiblingNode || isInTightListItem || isPrevNodePrettierIgnore)
  );
}

function shouldPrePrintTripleHardline(node, data) {
  const isPrevNodeList = data.prevNode && data.prevNode.type === "list";
  const isIndentedCode =
    node.type === "code" &&
    /\s/.test(data.options.originalText[node.position.start.offset]);

  return isPrevNodeList && isIndentedCode;
}

function shouldRemainTheSameContent(path) {
  const ancestorNode = getAncestorNode(path, [
    "linkReference",
    "imageReference"
  ]);

  return (
    ancestorNode &&
    (ancestorNode.type !== "linkReference" ||
      ancestorNode.referenceType !== "full")
  );
}

function normalizeDoc(doc) {
  return util.mapDoc(doc, currentDoc => {
    if (!currentDoc.parts) {
      return currentDoc;
    }

    if (currentDoc.type === "concat" && currentDoc.parts.length === 1) {
      return currentDoc.parts[0];
    }

    const parts = [];

    currentDoc.parts.forEach(part => {
      if (part.type === "concat") {
        parts.push.apply(parts, part.parts);
      } else if (part !== "") {
        parts.push(part);
      }
    });

    return Object.assign({}, currentDoc, {
      parts: normalizeParts(parts)
    });
  });
}

function printUrl(url, dangerousCharOrChars) {
  const dangerousChars = [" "].concat(dangerousCharOrChars || []);
  return new RegExp(dangerousChars.map(x => `\\${x}`).join("|")).test(url)
    ? `<${url}>`
    : url;
}

function printTitle(title) {
  return title.includes('"') && !title.includes("'")
    ? `'${title}'`
    : `"${title.replace(/"/g, '\\"')}"`;
}

function normalizeParts(parts) {
  return parts.reduce((current, part) => {
    const lastPart = current[current.length - 1];

    if (typeof lastPart === "string" && typeof part === "string") {
      current.splice(-1, 1, lastPart + part);
    } else {
      current.push(part);
    }

    return current;
  }, []);
}

module.exports = genericPrint;
