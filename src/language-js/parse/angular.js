import {
  parseAction,
  parseBinding,
  parseInterpolationExpression,
  parseTemplateBindings,
} from "angular-estree-parser";
import createError from "../../common/parser-create-error.js";
import { locEnd, locStart } from "../loc.js";
import wrapExpression from "./utilities/wrap-expression.js";

/**
@import {TupleTypeAnnotation} from "@babel/types"
*/

function createParseError(error) {
  /* c8 ignore next 3 */
  if (!error?.location) {
    return error;
  }

  const {
    message,
    location: { line, col: column },
  } = error;

  return createError(message, {
    loc: {
      start: { line: line + 1, column },
    },
    cause: error,
  });
}

/**
@typedef {
  | parseAction
  | parseBinding
  | parseInterpolationExpression
  | parseTemplateBindings
} Parsers
*/

/**
@template {Parsers} ParseMethod
@param {ParseMethod} parseMethod
*/
function createParser(parseMethod) {
  return {
    astFormat: "estree",
    parse(text) {
      /** @type {Exclude<ReturnType<ParseMethod>, TupleTypeAnnotation>} */
      let node;

      try {
        // @ts-expect-error -- safe
        node = parseMethod(text);
      } catch (error) {
        throw createParseError(error);
      }

      // @ts-expect-error -- safe
      const { comments } = node;
      // @ts-expect-error -- safe
      delete node.comments;

      if (parseMethod === parseAction && node.type !== "NGChainedExpression") {
        node = { ...node, type: "NGChainedExpression", expressions: [node] };
      }

      return wrapExpression({
        type: "NGRoot",
        expression: node,
        comments,
        text,
      });
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
