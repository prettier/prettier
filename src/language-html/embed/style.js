import { getUnescapedAttributeValue } from "../utils/index.js";
import { printExpand } from "./utils.js";

function printStyleAttribute(path, options) {
  const { node } = path;
  const text = getUnescapedAttributeValue(path.node).trim();
  if (
    node.fullName === "style" &&
    !options.parentParser &&
    !text.includes("{{")
  ) {
    return async (textToDoc) =>
      printExpand(
        await textToDoc(text, { parser: "css", __isHTMLStyleAttribute: true }),
      );
  }
}

export { printStyleAttribute };
