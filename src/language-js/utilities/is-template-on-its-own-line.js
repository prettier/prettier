import hasNewline from "../../utilities/has-newline.js";
import { locStart } from "../location/index.js";
import { templateLiteralHasNewLines } from "./template-literal-has-new-lines.js";

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
 * @param {NodeMap["TemplateLiteral"] | NodeMap["TaggedTemplateExpression"]} node
 * @param {string} text
 * @returns {boolean}
 */
function isTemplateOnItsOwnLine(node, text) {
  return (
    ((node.type === "TemplateLiteral" && templateLiteralHasNewLines(node)) ||
      (node.type === "TaggedTemplateExpression" &&
        templateLiteralHasNewLines(node.quasi))) &&
    !hasNewline(text, locStart(node), { backwards: true })
  );
}

export { isTemplateOnItsOwnLine };
