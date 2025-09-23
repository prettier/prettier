import htmlEventAttributesArray from "@prettier/html-event-attributes";
import { getUnescapedAttributeValue } from "../utils/index.js";
import { formatAttributeValue } from "./utils.js";

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
      { parser: "babel", __isHtmlInlineEventHandler: true },
      () => false,
    );
}

export default printEventHandler;
