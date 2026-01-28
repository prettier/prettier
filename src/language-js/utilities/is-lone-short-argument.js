import printString from "../../utilities/print-string.js";
import { hasComment } from "./comments.js";
import { getRaw } from "./get-raw.js";
import { isSignedNumericLiteral } from "./is-signed-numeric-literal.js";
import { isLiteral, isStringLiteral } from "./node-types.js";

/**
@import {
  Node,
} from "../types/estree.js";
*/

const LONE_SHORT_ARGUMENT_THRESHOLD_RATE = 0.25;

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isLoneShortArgument(node, options) {
  const { printWidth } = options;

  if (hasComment(node)) {
    return false;
  }

  const threshold = printWidth * LONE_SHORT_ARGUMENT_THRESHOLD_RATE;

  if (
    node.type === "ThisExpression" ||
    (node.type === "Identifier" && node.name.length <= threshold) ||
    (isSignedNumericLiteral(node) && !hasComment(node.argument))
  ) {
    return true;
  }

  const regexpPattern =
    (node.type === "Literal" && "regex" in node && node.regex.pattern) ||
    (node.type === "RegExpLiteral" && node.pattern);

  if (regexpPattern) {
    return regexpPattern.length <= threshold;
  }

  if (isStringLiteral(node)) {
    return printString(getRaw(node), options).length <= threshold;
  }

  if (node.type === "TemplateLiteral") {
    return (
      node.expressions.length === 0 &&
      node.quasis[0].value.raw.length <= threshold &&
      !node.quasis[0].value.raw.includes("\n")
    );
  }

  if (node.type === "UnaryExpression") {
    return isLoneShortArgument(node.argument, { printWidth });
  }

  if (
    node.type === "CallExpression" &&
    node.arguments.length === 0 &&
    node.callee.type === "Identifier"
  ) {
    return node.callee.name.length <= threshold - 2;
  }

  return isLiteral(node);
}

export { isLoneShortArgument };
