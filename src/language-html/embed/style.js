import { getUnescapedAttributeValue } from "../utilities/index.js";
import { printExpand } from "./utilities.js";

/**
@import {AttributeValuePredicate, AttributeValuePrint} from "./attribute.js"
*/

/** @type {AttributeValuePredicate} */
const isStyle = ({ node }, options) =>
  node.fullName === "style" &&
  !options.parentParser &&
  !node.value.includes("{{");

/** @type {AttributeValuePrint} */
const printStyle = async (textToDoc, print, path /* , options*/) =>
  printExpand(
    await textToDoc(getUnescapedAttributeValue(path.node), {
      parser: "css",
      __isHTMLStyleAttribute: true,
    }),
  );

export { isStyle, printStyle };
