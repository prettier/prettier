"use strict";

const {
  builders: { concat, join, line, group },
} = require("../../document");
const { hasNode, hasComments } = require("../utils");
const { printBinaryishExpression } = require("./binaryish");

/** @typedef {import("../../common/fast-path")} FastPath */

function printAngular(path, options, print) {
  const n = path.getValue();
  switch (n.type) {
    case "NGRoot":
      return concat(
        [].concat(
          path.call(print, "node"),
          !hasComments(n.node)
            ? []
            : concat([" //", n.node.comments[0].value.trimEnd()])
        )
      );
    case "NGPipeExpression":
      return printBinaryishExpression(path, options, print);
    case "NGChainedExpression":
      return group(
        join(
          concat([";", line]),
          path.map(
            (childPath) =>
              hasNgSideEffect(childPath)
                ? print(childPath)
                : concat(["(", print(childPath), ")"]),
            "expressions"
          )
        )
      );
    case "NGEmptyExpression":
      return "";
    case "NGQuotedExpression":
      return concat([n.prefix, ": ", n.value.trim()]);
    case "NGMicrosyntax":
      return concat(
        path.map(
          (childPath, index) =>
            concat([
              index === 0
                ? ""
                : isNgForOf(childPath.getValue(), index, n)
                ? " "
                : concat([";", line]),
              print(childPath),
            ]),
          "body"
        )
      );
    case "NGMicrosyntaxKey":
      return /^[$_a-z][\w$]*(-[$_a-z][\w$])*$/i.test(n.name)
        ? n.name
        : JSON.stringify(n.name);
    case "NGMicrosyntaxExpression":
      return concat([
        path.call(print, "expression"),
        n.alias === null ? "" : concat([" as ", path.call(print, "alias")]),
      ]);
    case "NGMicrosyntaxKeyedExpression": {
      const index = path.getName();
      const parentNode = path.getParentNode();
      const shouldNotPrintColon =
        isNgForOf(n, index, parentNode) ||
        (((index === 1 && (n.key.name === "then" || n.key.name === "else")) ||
          (index === 2 &&
            n.key.name === "else" &&
            parentNode.body[index - 1].type ===
              "NGMicrosyntaxKeyedExpression" &&
            parentNode.body[index - 1].key.name === "then")) &&
          parentNode.body[0].type === "NGMicrosyntaxExpression");
      return concat([
        path.call(print, "key"),
        shouldNotPrintColon ? " " : ": ",
        path.call(print, "expression"),
      ]);
    }
    case "NGMicrosyntaxLet":
      return concat([
        "let ",
        path.call(print, "key"),
        n.value === null ? "" : concat([" = ", path.call(print, "value")]),
      ]);
    case "NGMicrosyntaxAs":
      return concat([
        path.call(print, "key"),
        " as ",
        path.call(print, "alias"),
      ]);
  }
}

function isNgForOf(node, index, parentNode) {
  return (
    node.type === "NGMicrosyntaxKeyedExpression" &&
    node.key.name === "of" &&
    index === 1 &&
    parentNode.body[0].type === "NGMicrosyntaxLet" &&
    parentNode.body[0].value === null
  );
}

/** identify if an angular expression seems to have side effects */
/**
 * @param {FastPath} path
 * @returns {boolean}
 */
function hasNgSideEffect(path) {
  return hasNode(path.getValue(), (node) => {
    switch (node.type) {
      case undefined:
        return false;
      case "CallExpression":
      case "OptionalCallExpression":
      case "AssignmentExpression":
        return true;
    }
  });
}

module.exports = { printAngular };
