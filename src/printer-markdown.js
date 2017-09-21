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

function genericPrint(path, options, print) {
  const node = path.getValue();

  switch (node.type) {
    case "root":
      return concat([printChildren(path, options, print), hardline]);
    case "paragraph":
      return concat([printChildren(path, options, print)]);
    case "sentence":
      return printChildren(
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
      );
    case "word":
      return node.value;
    case "whitespace":
      return line;
    case "emphasis":
      return concat(["*", printChildren(path, options, print), "*"]);
    case "strong":
      return concat(["**", printChildren(path, options, print), "**"]);
    default:
      throw new Error(`Unknown markdown type ${JSON.stringify(node.type)}`);
  }
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
