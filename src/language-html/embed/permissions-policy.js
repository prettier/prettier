import { ifBreak, line } from "../../document/builders.js";
import { getUnescapedAttributeValue } from "../utils/index.js";
import parsePermissionsPolicy from "./parse-permissions-policy.js";
import { printExpand } from "./utils.js";

function printPermissionsPolicy(path, options) {
  const { node } = path;

  if (
    node.fullName !== "allow" ||
    options.parentParser ||
    node.value.includes("{{") ||
    path.parent.fullName !== "iframe"
  ) {
    return;
  }

  return () => {
    const policies = parsePermissionsPolicy(getUnescapedAttributeValue(node));

    if (policies.length === 0) {
      // Return a truthy value to bypass the check in `printAttributeWithValuePrinter`
      return [""];
    }

    return printExpand(
      policies.map((directive, index) => [
        [directive.name, ...directive.value].join(" "),
        index === policies.length - 1 ? ifBreak(";") : [";", line],
      ]),
    );
  };
}

export default printPermissionsPolicy;
