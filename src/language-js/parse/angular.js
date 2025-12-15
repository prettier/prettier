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
      let node = parseMethod(text);
      // @ts-expect-error -- safe
      const { comments } = node;
      // @ts-expect-error -- safe
      delete node.comments;

      if (parseMethod === parseAction && node.type !== "NGChainedExpression") {
        // @ts-expect-error -- expected
        node = { ...node, type: "NGChainedExpression", expressions: [node] };
      }

      return {
        type: "NGRoot",
        node,
        comments,
      };
    },
    locStart,
    locEnd,
  };
}

export const __ng_action = /* @__PURE__ */ createParser(parseAction);
export const __ng_binding = /* @__PURE__ */ createParser(parseBinding);
export const __ng_interpolation = /* @__PURE__ */ createParser(
  parseInterpolationExpression,
);
export const __ng_directive = /* @__PURE__ */ createParser(
  parseTemplateBindings,
);
