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
  // Respect `embeddedLanguageFormatting: "off"`, which opts out of formatting
  // quoted embedded code (including inline event handlers).
  options.embeddedLanguageFormatting === "auto" &&
  // `{{` is the Vue/Angular interpolation marker and `{!` is the Salesforce
  // Aura expression-binding marker (e.g. `onclick="{!c.submit}"`). Feeding
  // either to the Babel parser destroys the binding, so leave them untouched.
  !node.value.includes("{{") &&
  !node.value.includes("{!");

/** @type {AttributeValuePrint} */
const printEventHandler = (textToDoc, print, path /* , options*/) =>
  formatAttributeValue(
    getUnescapedAttributeValue(path.node),
    textToDoc,
    { parser: "babel", __isHtmlInlineEventHandler: true },
    () => false,
  );

export { isEventHandler, printEventHandler };
