"use strict";

const { locStart, locEnd } = require("../loc.js");

/**
 * @param {{ (text: any, ng: any): any; (text: any, ng: any): any; (text: any, ng: any): any; (text: any, ng: any): any; (arg0: any, arg1: typeof import("angular-estree-parser")): any; }} _parse
 */
function createParser(_parse) {
  const parse = (
    /** @type {any} */ text,
    /** @type {any} */ parsers,
    /** @type {{ parser: string; }} */ options
  ) => {
    const ngEstreeParser = require("angular-estree-parser");
    const node = _parse(text, ngEstreeParser);
    return {
      type: "NGRoot",
      node:
        options.parser === "__ng_action" && node.type !== "NGChainedExpression"
          ? { ...node, type: "NGChainedExpression", expressions: [node] }
          : node,
    };
  };
  return { astFormat: "estree", parse, locStart, locEnd };
}

module.exports = {
  parsers: {
    __ng_action: createParser(
      (
        /** @type {any} */ text,
        /** @type {{ parseAction: (arg0: any) => any; }} */ ng
      ) => ng.parseAction(text)
    ),
    __ng_binding: createParser(
      (
        /** @type {any} */ text,
        /** @type {{ parseBinding: (arg0: any) => any; }} */ ng
      ) => ng.parseBinding(text)
    ),
    __ng_interpolation: createParser(
      (
        /** @type {any} */ text,
        /** @type {{ parseInterpolation: (arg0: any) => any; }} */ ng
      ) => ng.parseInterpolation(text)
    ),
    __ng_directive: createParser(
      (
        /** @type {any} */ text,
        /** @type {{ parseTemplateBindings: (arg0: any) => any; }} */ ng
      ) => ng.parseTemplateBindings(text)
    ),
  },
};
