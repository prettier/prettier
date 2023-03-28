import { getUnescapedAttributeValue } from "../utils/index.js";

function printStyleAttribute(path, options) {
  const { node } = path;
  const text = getUnescapedAttributeValue(path.node).trim();
  if (
    node.fullName === "style" &&
    !options.parentParser &&
    !text.includes("{{")
  ) {
    return (textToDoc) =>
      text
        ? textToDoc(text, { parser: "css", __isHTMLStyleAttribute: true })
        : // An empty doc to prevent fallback to normal print
          [];
  }
}

export { printStyleAttribute };
