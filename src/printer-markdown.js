"use strict";

const util = require("./util");
const docBuilders = require("./doc-builders");
const concat = docBuilders.concat;
const join = docBuilders.join;
const line = docBuilders.line;
const hardline = docBuilders.hardline;
const softline = docBuilders.softline;
const group = docBuilders.group;
const fill = docBuilders.fill;
const indent = docBuilders.indent;
const ifBreak = docBuilders.ifBreak;
const align = docBuilders.align;
const docPrinter = require("./doc-printer");
const printDocToString = docPrinter.printDocToString;
const escapeStringRegexp = require("escape-string-regexp");

const SINGLE_LINE_NODE_TYPES = ["heading", "tableCell", "footnoteDefinition"];

const SIBLING_NODE_TYPES = [
  "listItem",
  "html",
  "definition",
  "footnoteDefinition"
];

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
  "word"
];

function genericPrint(path, options, print) {
  const node = path.getValue();

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
      return node.value;
    case "whitespace": {
      return hasParentType(path, SINGLE_LINE_NODE_TYPES) ? " " : line;
    }
    case "emphasis":
      return concat(["*", printChildren(path, options, print), "*"]);
    case "strong":
      return concat(["**", printChildren(path, options, print), "**"]);
    case "delete":
      return concat(["~~", printChildren(path, options, print), "~~"]);
    case "inlineCode":
      return concat(["`", node.value, "`"]);
    case "link":
      return concat([
        "[",
        printChildren(path, options, print),
        "](",
        node.url,
        node.title ? ` "${node.title}"` : "",
        ")"
      ]);
    case "image":
      return concat([
        "![",
        node.alt || "",
        "](",
        node.url,
        node.title ? ` "${node.title}"` : "",
        ")"
      ]);
    case "blockquote":
      return concat(["> ", align("> ", printChildren(path, options, print))]);
    case "heading":
      return concat([
        "#".repeat(node.depth) + " ",
        printChildren(path, options, print)
      ]);
    case "code":
      return concat([
        "```",
        node.lang || "",
        hardline,
        node.value,
        hardline,
        "```"
      ]);
    case "yaml":
      return concat(["---", hardline, node.value, hardline, "---"]);
    case "html":
      return node.value;
    case "list":
      return printChildren(path, options, print, {
        processor: (childPath, index) => {
          const prefix = node.ordered ? `${node.start + index}. ` : "- ";
          return concat([prefix, align(prefix.length, childPath.call(print))]);
        }
      });
    case "listItem": {
      const prefix =
        node.checked === null ? "" : node.checked ? "[x] " : "[ ] ";
      return concat([
        prefix,
        align(prefix.length, printChildren(path, options, print))
      ]);
    }
    case "thematicBreak":
      return concat(["---"]);
    case "linkReference":
      switch (node.referenceType) {
        case "full":
          return concat([
            "[",
            printChildren(path, options, print),
            "][",
            node.identifier,
            "]"
          ]);
        default:
          return concat([
            "[",
            node.identifier,
            "]",
            node.referenceType === "collapsed" ? "[]" : ""
          ]);
      }
    case "imageReference":
      switch (node.referenceType) {
        case "full":
          return concat(["![", node.alt, "][", node.identifier, "]"]);
        default:
          return concat([
            "![",
            node.identifier,
            "]",
            node.referenceType === "collapsed" ? "[]" : ""
          ]);
      }
    case "definition":
      return concat([
        "[",
        node.identifier,
        "]: ",
        node.url,
        node.title === null ? "" : ` "${node.title}"`
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
    case "tableRow": // handled in "table"
    default:
      throw new Error(`Unknown markdown type ${JSON.stringify(node.type)}`);
  }
}

function hasParentType(path, typeOrTypes) {
  const types = [].concat(typeOrTypes);

  let counter = 0;
  let parentNode;

  while ((parentNode = path.getParentNode(counter++))) {
    if (types.indexOf(parentNode.type) !== -1) {
      return true;
    }
  }

  return false;
}

function printTable(path, options, print) {
  const node = path.getValue();
  const contents = []; // { [rowIndex: number]: { [columnIndex: number]: string } }

  path.map(rowPath => {
    const rowContents = [];

    rowPath.map(cellPath => {
      rowContents.push(
        escapeString(
          printDocToString(cellPath.call(print), options).formatted,
          ["|"]
        )
      );
    }, "children");

    contents.push(rowContents);
  }, "children");

  const columnMaxWidths = contents.reduce(
    (currentWidths, rowContents) =>
      currentWidths.map((width, columnIndex) =>
        Math.max(width, rowContents[columnIndex].length)
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
    return concat([text, " ".repeat(width - text.length)]);
  }

  function alignRight(text, width) {
    return concat([" ".repeat(width - text.length), text]);
  }

  function alignCenter(text, width) {
    const spaces = width - text.length;
    const left = Math.floor(spaces / 2);
    const right = spaces - left;
    return concat([" ".repeat(left), text, " ".repeat(right)]);
  }
}

function printChildren(path, options, print, events) {
  events = events || {};

  const postprocessor = events.postprocessor || concat;
  const processor = events.processor || (childPath => childPath.call(print));

  const parts = [];

  let counter = 0;
  let lastChildPath;

  path.map((childPath, index) => {
    const result = processor(childPath, index);

    if (result !== false) {
      const data = {
        parts,
        index: counter++,
        prevPath: lastChildPath,
        parentPath: path
      };

      if (!shouldNotPrintHardline(childPath, data)) {
        parts.push(hardline);

        if (shouldPrintDoubleHardline(childPath, data)) {
          parts.push(hardline);
        }
      }

      parts.push(result);
      lastChildPath = childPath;
    }
  }, "children");

  return postprocessor(parts);
}

function shouldNotPrintHardline(path, data) {
  const node = path.getValue();
  const prevNode = data.prevPath && data.prevPath.getValue();

  const isFirstNode = data.parts.length === 0;
  const isInlineNode = INLINE_NODE_TYPES.indexOf(node.type) !== -1;

  const isSequence = (prevNode && prevNode.type) === node.type;
  const isIsolatedHTML = node.type === "html" && !isSequence;

  return isFirstNode || isInlineNode || isIsolatedHTML;
}

function shouldPrintDoubleHardline(path, data) {
  const node = path.getValue();
  const prevNode = data.prevPath && data.prevPath.getValue();
  const parentNode = data.parentPath && data.parentPath.getValue();

  const isSequence = (prevNode && prevNode.type) === node.type;
  const isSiblingNode =
    isSequence && SIBLING_NODE_TYPES.indexOf(node.type) !== -1;

  const isList = node.type === "list";
  const hasListParent = parentNode && parentNode.type === "list";
  const isSimpleNestedList = isList && hasListParent && data.index < 2;

  return !(isSiblingNode || isSimpleNestedList);
}

function normalizeDoc(doc) {
  return mapDoc(doc, currentDoc => {
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

function escapeString(str, chars) {
  let escaped = str;

  chars.forEach(char => {
    escaped = str.replace(
      new RegExp(escapeStringRegexp(char), "g"),
      `\\${char}`
    );
  });

  return escaped;
}

function mapDoc(doc, callback) {
  if (doc.parts) {
    const parts = doc.parts.map(part => mapDoc(part, callback));
    return callback(Object.assign({}, doc, { parts }));
  }

  if (doc.contents) {
    const contents = mapDoc(doc.contents, callback);
    return callback(Object.assign({}, doc, { contents }));
  }

  return callback(doc);
}

module.exports = genericPrint;
