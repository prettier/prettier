import { ifBreak, line } from "../../document/builders.js";
import { getUnescapedAttributeValue } from "../utils/index.js";
import parsePermissionsPolicy from "./parse-permissions-policy.js";
import { printExpand } from "./utils.js";

/**
@import {AttributeValuePredicate, AttributeValuePrint} from "./attribute.js"
*/

/** @type {AttributeValuePredicate} */
const isPermissionsPolicy = ({ node }, options) =>
  node.parent.name === "iframe" &&
  node.fullName === "allow" &&
  !options.parentParser &&
  !node.value.includes("{{");

/** @type {AttributeValuePrint} */
function printPermissionsPolicy(textToDoc, print, path /* , options*/) {
  const { node } = path;
  const directives = parsePermissionsPolicy(getUnescapedAttributeValue(node));

  if (directives.length === 0) {
    // Return a truthy value to bypass the check in `printAttributeWithValuePrinter`
    return [""];
  }

  return printExpand(
    directives.map(({ name, value }, index) => [
      [name, ...value].join(" "),
      index === directives.length - 1 ? ifBreak(";") : [";", line],
    ]),
  );
}

export { isPermissionsPolicy, printPermissionsPolicy };
