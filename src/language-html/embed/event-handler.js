import htmlEventAttributesArray from "@prettier/html-event-attributes";
import { getUnescapedAttributeValue } from "../utilities/index.js";
import { formatAttributeValue } from "./utilities.js";

/**
@import {AttributeValuePredicate, AttributeValuePrint} from "./attribute.js"
*/

const htmlEventAttributes = new Set(htmlEventAttributesArray);

/** @type {AttributeValuePredicate} */
const isEventHandler = ({ node }, options) =>
  htmlEventAttributes.has(node.fullName) &&
  !options.parentParser &&
  !node.value.includes("{{");

/** @type {AttributeValuePrint} */
const printEventHandler = (textToDoc, print, path /* , options*/) =>
  formatAttributeValue(
    getUnescapedAttributeValue(path.node),
    textToDoc,
    { parser: "babel", __isHtmlInlineEventHandler: true },
    () => false,
  );

export { isEventHandler, printEventHandler };
