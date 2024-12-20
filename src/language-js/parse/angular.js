import {
  parseAction,
  parseBinding,
  parseInterpolationExpression,
  parseTemplateBindings,
} from "angular-estree-parser";
import { locEnd, locStart } from "../loc.js";

/**
 * @param {parseAction | parseBinding | parseInterpolationExpression | parseTemplateBindings} parseMethod
 */
function createParser(parseMethod) {
  return {
    astFormat: "estree",
    parse(text) {
      const node = parseMethod(text);

      return {
        type: "NGRoot",
        node:
          parseMethod === parseAction && node.type !== "NGChainedExpression"
            ? { ...node, type: "NGChainedExpression", expressions: [node] }
            : node,
      };
    },
    locStart,
    locEnd,
  };
}

export const __ng_action = createParser(parseAction);
export const __ng_binding = createParser(parseBinding);
export const __ng_interpolation = createParser(parseInterpolationExpression);
export const __ng_directive = createParser(parseTemplateBindings);
