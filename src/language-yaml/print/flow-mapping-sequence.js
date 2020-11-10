"use strict";

const {
  builders: { concat, ifBreak, line, softline },
} = require("../../document");
const { isEmptyNode, getLast } = require("../utils");
const { printNextEmptyLine, alignWithSpaces } = require("./misc");

function printFlowMapping(path, print, options) {
  const node = path.getValue();
  const bracketSpacing =
    node.children.length !== 0 && options.bracketSpacing ? line : softline;
  const lastItem = getLast(node.children);
  const isLastItemEmptyMappingItem =
    lastItem && isEmptyNode(lastItem.key) && isEmptyNode(lastItem.value);
  return concat([
    "{",
    alignWithSpaces(
      options.tabWidth,
      concat([
        bracketSpacing,
        printChildren(path, print, options),
        ifBreak(",", ""),
      ])
    ),
    isLastItemEmptyMappingItem ? "" : bracketSpacing,
    "}",
  ]);
}

function printFlowSequence(path, print, options) {
  return concat([
    "[",
    alignWithSpaces(
      options.tabWidth,
      concat([softline, printChildren(path, print, options), ifBreak(",", "")])
    ),
    softline,
    "]",
  ]);
}

function printChildren(path, print, options) {
  const node = path.getValue();
  const parts = path.map(
    (childPath, index) =>
      concat([
        print(childPath),
        index === node.children.length - 1
          ? ""
          : concat([
              ",",
              line,
              node.children[index].position.start.line !==
              node.children[index + 1].position.start.line
                ? printNextEmptyLine(childPath, options.originalText)
                : "",
            ]),
      ]),
    "children"
  );
  return concat(parts);
}

module.exports = { printFlowMapping, printFlowSequence };
