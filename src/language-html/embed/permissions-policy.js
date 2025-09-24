import { ifBreak, join, softline } from "../../document/builders.js";
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

  const policies = parsePermissionsPolicy(getUnescapedAttributeValue(node));

  return () =>
    policies.length === 0
      ? [""]
      : printExpand(
          join(
            ifBreak(softline, "; "),
            policies.map((directive) => [
              directive.name,
              ...(directive.value.length > 0
                ? [" ", directive.value.join(" ")]
                : []),
              ifBreak(";"),
            ]),
          ),
        );
}

export default printPermissionsPolicy;
