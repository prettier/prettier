import { getUnescapedAttributeValue } from "../utilities/index.js";

/**
@import {AttributeValuePredicate, AttributeValuePrint} from "./attribute.js"
*/

/** @type {AttributeValuePredicate} */
const isClassNames = ({ node }, options) =>
  !options.parentParser &&
  node.fullName === "class" &&
  !node.value.includes("{{");

/** @type {AttributeValuePrint} */
const printClassNames = (textToDoc, print, path /* , options*/) =>
  getUnescapedAttributeValue(path.node).trim().split(/\s+/u).join(" ");

export { isClassNames, printClassNames };
