/**
@import {
  Node,
  NodeMap,
  Comment,
  NumericLiteral,
  StringLiteral,
  RegExpLiteral,
  BigIntLiteral,
} from "../types/estree.js";
@import AstPath from "../../common/ast-path.js";
*/

/**
 * @param {NodeMap["TemplateLiteral"]} template
 * @returns {boolean}
 */
function templateLiteralHasNewLines(template) {
  return template.quasis.some((quasi) => quasi.value.raw.includes("\n"));
}

export { templateLiteralHasNewLines };
