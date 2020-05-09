"use strict";

const locFns = require("./loc");
let angularEstreeParserFixed = false;

function createParser(_parse) {
  const parse = (text, parsers, options) => {
    if (!angularEstreeParserFixed) {
      const transformModule = require("angular-estree-parser/lib/transform");
      const utils = require("angular-estree-parser/lib/utils");
      const originalTransform = transformModule.transform;
      transformModule.transform = (node, context, isInParentParens) => {
        const type = utils.getNgType(node);
        if (type === "MethodCall" && node.args && node.args.length === 1) {
          const [firstArgument] = node.args;
          node.args = [];
          const result = originalTransform(node, context, isInParentParens);
          result.arguments = [
            originalTransform(firstArgument, context, isInParentParens),
          ];
          return result;
        }
        return originalTransform(node, context, isInParentParens);
      };
      angularEstreeParserFixed = true;
    }

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
  return { astFormat: "estree", parse, ...locFns };
}

module.exports = {
  parsers: {
    __ng_action: createParser((text, ng) => ng.parseAction(text)),
    __ng_binding: createParser((text, ng) => ng.parseBinding(text)),
    __ng_interpolation: createParser((text, ng) => ng.parseInterpolation(text)),
    __ng_directive: createParser((text, ng) => ng.parseTemplateBindings(text)),
  },
};
