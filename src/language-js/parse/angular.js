import createParser from "./utils/create-parser.js";

const createAngularParser = (options) => createParser(createParse(options));

/**
 * @param {"parseAction" | "parseBinding" | "parseInterpolation" | "parseTemplateBindings"} parseMethod
 */
function createParse(parseMethod) {
  return async (text) => {
    const { [parseMethod]: parse } = await import("angular-estree-parser");
    let node = parse(text);

    if (parseMethod === "parseAction" && node.type !== "NGChainedExpression") {
      node = {
        type: "NGChainedExpression",
        expressions: [node],
        start: node.start,
        end: node.start,
        loc: node.loc,
      };
    }

    return { type: "NGRoot", node };
  };
}

const parser = {
  parsers: {
    __ng_action: createAngularParser("parseAction"),
    __ng_binding: createAngularParser("parseBinding"),
    __ng_interpolation: createAngularParser("parseInterpolation"),
    __ng_directive: createAngularParser("parseTemplateBindings"),
  },
};

export default parser;
