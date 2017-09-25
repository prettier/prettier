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

const SINGLE_LINE_NODE_TYPES = ["heading", "tableCell", "footnoteDefinition"];

function genericPrint(path, options, print) {
  const node = path.getValue();

  switch (node.type) {
    case "root":
      return concat([printChildren(path, options, print), hardline]);
    case "paragraph":
      return concat([printChildren(path, options, print)]);
    case "sentence":
      return concat([
        printBlockquotePrefix(path),
        printChildren(
          path,
          options,
          print,
          (parts, childPath, index) => {
            const childNode = childPath.getValue();
            if (
              !(
                childNode.type === "whitespace" &&
                index === node.children.length - 1
              )
            ) {
              parts.push(childPath.call(print));
            }
          },
          fill
        )
      ]);
    case "word":
      return node.value;
    case "whitespace":
      return concat([
        hasParentType(path, SINGLE_LINE_NODE_TYPES) ? " " : line,
        ifBreak(printBlockquotePrefix(path))
      ]);
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
      return printChildren(path, options, print);
    case "heading":
      return concat([
        "#".repeat(node.depth) + " ",
        printChildren(path, options, print),
        hardline,
        hardline
      ]);
    case "code":
      return concat([
        "```",
        node.lang || "",
        hardline,
        node.value,
        hardline,
        "```",
        hardline
      ]);
    case "yaml":
      return concat(["---", hardline, node.value, hardline, "---", hardline]);
    case "html":
      return node.value;
    case "list":
      return concat([
        printChildren(path, options, print, (parts, childPath, index) => {
          const prefix = node.ordered ? `${node.start + index}. ` : "- ";
          parts.push(
            prefix,
            align(prefix.length, childPath.call(print)),
            hardline
          );
        }),
        hardline
      ]);
    case "listItem": {
      const prefix =
        node.checked === null ? "" : node.checked ? "[x] " : "[ ] ";
      return concat([
        prefix,
        align(
          prefix.length,
          printChildren(path, options, print, (parts, childPath, index) => {
            const childNode = childPath.getValue();
            parts.push(childPath.call(print));
            if (
              index !== node.children.length - 1 &&
              childNode.type === "paragraph"
            ) {
              parts.push(hardline);
            }
          })
        )
      ]);
    }
    case "thematicBreak":
      return concat(["---", hardline]);
    case "linkReference":
      switch (node.referenceType) {
        case "full":
          return concat([
            "[",
            printChildren(path, options, print),
            "][",
            node.identifier,
            "]",
            hardline
          ]);
        default:
          return concat([
            "[",
            node.identifier,
            "]",
            node.referenceType === "collapsed" ? "[]" : "",
            hardline
          ]);
      }
    case "imageReference":
      switch (node.referenceType) {
        case "full":
          return concat(["![", node.alt, "][", node.identifier, "]", hardline]);
        default:
          return concat([
            "![",
            node.identifier,
            "]",
            node.referenceType === "collapsed" ? "[]" : "",
            hardline
          ]);
      }
    case "definition":
      return concat([
        "[",
        node.identifier,
        "]: ",
        node.url,
        node.title === null ? "" : ` "${node.title}"`,
        hardline
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
        printChildren(path, options, print),
        hardline
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
        printDocToString(cellPath.call(print), options).formatted
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

  return concat([
    concat(contents.slice(0, 1).map(printRow)),
    printSeparator(),
    concat(contents.slice(1).map(printRow))
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
      " |",
      hardline
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
      " |",
      hardline
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

function printBlockquotePrefix(path) {
  let blockquoteLevel = 0;
  let counter = 0;
  let parentNode;

  while ((parentNode = path.getParentNode(counter++))) {
    if (parentNode.type === "blockquote") {
      blockquoteLevel++;
    }
  }

  return blockquoteLevel ? ">".repeat(blockquoteLevel) + " " : "";
}

function printChildren(path, options, print, iterator, command) {
  command = command || concat;

  const node = path.getValue();

  const callback =
    typeof iterator === "function"
      ? iterator
      : (parts, childPath, index) => {
          parts.push(childPath.call(print));
          if (index !== node.children.length - 1) {
            parts.push(iterator || "");
          }
        };

  const parts = [];

  path.map((childPath, index) => {
    // TODO: prettier-ignore
    callback(parts, childPath, index);
  }, "children");

  return command(parts);
}

module.exports = genericPrint;
