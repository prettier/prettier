import htmlEventAttributes from "@prettier/html-event-attributes";
import { getUnescapedAttributeValue } from "../utils/index.js";
import { formatAttributeValue, shouldHugJsExpression } from "./utils.js";

const eventAttributes = new Set(htmlEventAttributes);

function printEventAttribute(path, options) {
  const { node } = path;

  if (
    options.parentParser ||
    !eventAttributes.has(node.fullName) ||
    node.value.includes("{{")
  ) {
    return;
  }

  return (textToDoc) =>
    formatAttributeValue(
      getUnescapedAttributeValue(node).trim(),
      textToDoc,
      { parser: "babel", __isHtmlEventHandler: true },
      shouldHugJsExpression,
    );
}

export default printEventAttribute;
