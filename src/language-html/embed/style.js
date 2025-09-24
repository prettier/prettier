import { getUnescapedAttributeValue } from "../utils/index.js";
import { printExpand } from "./utils.js";

function printStyleAttribute(path, options) {
  const { node } = path;
  if (
    node.fullName !== "style" ||
    options.parentParser ||
    node.value.includes("{{")
  ) {
    return;
  }

  return async (textToDoc) =>
    printExpand(
      await textToDoc(getUnescapedAttributeValue(node), {
        parser: "css",
        __isHTMLStyleAttribute: true,
      }),
    );
}

export { printStyleAttribute };
