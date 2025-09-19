import htmlEventAttributes from "@prettier/html-event-attributes";
import { getUnescapedAttributeValue } from "../utils/index.js";
import { formatAttributeValue, shouldHugJsExpression } from "./utils.js";

const eventAttributes = new Set(htmlEventAttributes);

export default function printEventAttribute(path, options) {
  const { node } = path;

  if (!eventAttributes.has(node.fullName) || options.parentParser) {
    return;
  }

  const text = getUnescapedAttributeValue(path.node).trim();

  if (!text.includes("{{")) {
    return (textToDoc) => formatAttributeValue(
        text,
        textToDoc,
        { parser: "__html_event_handler" },
        shouldHugJsExpression,
      );
  };
}
