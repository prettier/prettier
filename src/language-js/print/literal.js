"use strict";
const { printString, printNumber } = require("../../common/util");

function printLiteral(path, options /*, print*/) {
  const node = path.getNode();

  switch (node.type) {
    case "NullLiteral": // Babel 6 Literal split
      return "null";
    case "RegExpLiteral": // Babel 6 Literal split
      return printRegex(node);
    case "NumericLiteral": // Babel 6 Literal split
      return printNumber(node.extra.raw);
    case "DecimalLiteral":
      return printNumber(node.value) + "m";
    case "BigIntLiteral":
      // babel: node.extra.raw, flow: node.bigint
      return (node.bigint || node.extra.raw).toLowerCase();
    case "BooleanLiteral": // Babel 6 Literal split
      return String(node.value);
    case "StringLiteral": // Babel 6 Literal split
      return printString(node.extra.raw, options);
    case "Literal": {
      if (node.regex) {
        return printRegex(node.regex);
      }

      if (node.bigint) {
        return node.raw.toLowerCase();
      }

      const { value } = node;

      if (typeof value === "number") {
        return printNumber(node.raw);
      }

      if (typeof value === "string") {
        return printString(node.raw, options);
      }

      return String(value);
    }
  }
}

function printRegex({ pattern, flags }) {
  flags = flags.split("").sort().join("");
  return `/${pattern}/${flags}`;
}

module.exports = {
  printLiteral,
};
