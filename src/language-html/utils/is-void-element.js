import { voidMap } from "@glimmer/syntax/dist/commonjs/es2017/lib/generation/printer.js";

const voidTags = new Set(Object.keys(voidMap));
function isHtmlVoidElement(node, options) {
  return options.parser === "html" &&
         options.stripVoidTagSelfClose &&
         voidTags.has(node.fullName.toLowerCase());
}

export default isHtmlVoidElement;
