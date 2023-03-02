import {
  parseAction,
  parseBinding,
  parseInterpolationExpression,
  parseTemplateBindings,
} from "angular-estree-parser";
import { locStart, locEnd } from "../loc.js";

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

const parser = {
  parsers: {
    __ng_action: createParser(parseAction),
    __ng_binding: createParser(parseBinding),
    __ng_interpolation: createParser(parseInterpolationExpression),
    __ng_directive: createParser(parseTemplateBindings),
  },
};

export default parser;
