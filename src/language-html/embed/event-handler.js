import htmlEventAttributesArray from "@prettier/html-event-attributes";
import { getUnescapedAttributeValue } from "../utils/index.js";
import { formatAttributeValue, shouldHugJsExpression } from "./utils.js";

const htmlEventAttributes = new Set(htmlEventAttributesArray);

function printEventHandler(path, options) {
  const { node } = path;

  if (
    options.parentParser ||
    !htmlEventAttributes.has(node.fullName) ||
    node.value.includes("{{")
  ) {
    return;
  }

  return (textToDoc) =>
    formatAttributeValue(
      getUnescapedAttributeValue(node),
      textToDoc,
      { parser: "babel", __isHtmlEventHandler: true },
      shouldHugJsExpression,
    );
}

export default printEventHandler;
