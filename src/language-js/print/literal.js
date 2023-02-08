import { printString, printNumber } from "../../common/util.js";
import { replaceEndOfLine } from "../../document/utils.js";
import { createTypeCheckFunction } from "../utils/index.js";
import { printDirective } from "./misc.js";

/**
 * @typedef {import("../types/estree.js").Node} Node
 */

function printLiteral(path, options /*, print*/) {
  const { node } = path;

  switch (node.type) {
    case "RegExpLiteral": // Babel 6 Literal split
      return printRegex(node);
    case "BigIntLiteral":
      return printBigInt(node.extra.raw);
    case "NumericLiteral": // Babel 6 Literal split
      return printNumber(node.extra.raw);
    case "StringLiteral": // Babel 6 Literal split
      return replaceEndOfLine(printString(node.extra.raw, options));
    case "NullLiteral": // Babel 6 Literal split
      return "null";
    case "BooleanLiteral": // Babel 6 Literal split
      return String(node.value);
    case "DecimalLiteral":
      return printNumber(node.value) + "m";
    case "Literal": {
      if (node.regex) {
        return printRegex(node.regex);
      }

      if (node.bigint) {
        return printBigInt(node.raw);
      }

      if (node.decimal) {
        return printNumber(node.decimal) + "m";
      }

      const { value } = node;

      if (typeof value === "number") {
        return printNumber(node.raw);
      }

      if (typeof value === "string") {
        return isDirective(path)
          ? printDirective(node.raw, options)
          : replaceEndOfLine(printString(node.raw, options));
      }
      return String(value);
    }
  }
}

function isDirective(path) {
  if (path.key !== "expression") {
    return;
  }

  const { parent } = path;
  return parent.type === "ExpressionStatement" && parent.directive;
}

function printBigInt(raw) {
  return raw.toLowerCase();
}

function printRegex({ pattern, flags }) {
  flags = [...flags].sort().join("");
  return `/${pattern}/${flags}`;
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
const isLiteral = createTypeCheckFunction([
  "Literal",
  "BooleanLiteral",
  "BigIntLiteral",
  "NullLiteral",
  "NumericLiteral",
  "DecimalLiteral",
  "RegExpLiteral",
  "StringLiteral",
]);

export { printLiteral, printBigInt, isLiteral };
