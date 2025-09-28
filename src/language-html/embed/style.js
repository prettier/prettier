import { getUnescapedAttributeValue } from "../utils/index.js";
import { printExpand } from "./utils.js";

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
