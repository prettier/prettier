import { replaceEndOfLine } from "../../document/utils.js";
import printNumber from "../../utils/print-number.js";
import printString from "../../utils/print-string.js";

/**
 * @import {Node} from "../types/estree.js"
 */

function printLiteral(path, options /* , print*/) {
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
    case "DirectiveLiteral":
      return printDirective(node.extra.raw, options);
    case "Literal": {
      if (node.regex) {
        return printRegex(node.regex);
      }

      if (node.bigint) {
        return printBigInt(node.raw);
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
  return (
    parent.type === "ExpressionStatement" &&
    typeof parent.directive === "string"
  );
}

function printBigInt(raw) {
  return raw.toLowerCase();
}

function printRegex({ pattern, flags }) {
  flags = [...flags].sort().join("");
  return `/${pattern}/${flags}`;
}

function printDirective(rawText, options) {
  const rawContent = rawText.slice(1, -1);

  // Check for the alternate quote, to determine if we're allowed to swap
  // the quotes on a DirectiveLiteral.
  if (rawContent.includes('"') || rawContent.includes("'")) {
    return rawText;
  }

  const enclosingQuote = options.singleQuote ? "'" : '"';

  // Directives are exact code unit sequences, which means that you can't
  // change the escape sequences they use.
  // See https://github.com/prettier/prettier/issues/1555
  // and https://tc39.github.io/ecma262/#directive-prologue
  return enclosingQuote + rawContent + enclosingQuote;
}

export { printBigInt, printLiteral };
