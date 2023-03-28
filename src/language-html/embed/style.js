import { getUnescapedAttributeValue } from "../utils/index.js";

function printStyleAttribute(path, options) {
  const { node } = path;
  const text = getUnescapedAttributeValue(path.node);
  if (
    node.fullName === "style" &&
    !options.parentParser &&
    !text.includes("{{")
  ) {
    return (textToDoc) =>
      textToDoc(text, { parser: "css", __isHTMLStyleAttribute: true });
  }
}

export { printStyleAttribute };
