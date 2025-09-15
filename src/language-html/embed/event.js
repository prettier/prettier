import { htmlEventAttributes } from "html-event-attributes";
import { getUnescapedAttributeValue } from "../utils/index.js";
import { formatAttributeValue } from "./utils.js";

function printEventAttribute(path, options) {
  const { node } = path;

  if (!htmlEventAttributes.includes(node.fullName) || options.parentParser) {
    return;
  }

  const text = getUnescapedAttributeValue(path.node).trim();

  if (!text.includes("{{")) {
    return (textToDoc) =>
      formatAttributeValue(text, textToDoc, { parser: "__js_expression" });
  }
}

export { printEventAttribute };
