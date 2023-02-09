import { locStart, locEnd } from "../loc.js";

/**
 * @param {"parseAction" | "parseBinding" | "parseInterpolationExpression" | "parseTemplateBindings"} parseMethod
 */
function createParser(parseMethod) {
  const parse = async (text) => {
    const { [parseMethod]: parse } = await import("angular-estree-parser");
    const node = parse(text);

    return {
      type: "NGRoot",
      node:
        parseMethod === "parseAction" && node.type !== "NGChainedExpression"
          ? { ...node, type: "NGChainedExpression", expressions: [node] }
          : node,
    };
  };

  return { astFormat: "estree", parse, locStart, locEnd };
}

const parser = {
  parsers: {
    __ng_action: createParser("parseAction"),
    __ng_binding: createParser("parseBinding"),
    __ng_interpolation: createParser("parseInterpolationExpression"),
    __ng_directive: createParser("parseTemplateBindings"),
  },
};

export default parser;
