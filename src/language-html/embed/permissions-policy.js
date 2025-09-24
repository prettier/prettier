import { ifBreak, join, softline } from "../../document/builders.js";
import { getUnescapedAttributeValue } from "../utils/index.js";
import parsePermissionsPolicy from "./parse-permissions-policy.js";
import { printExpand } from "./utils.js";

function printPermissionsPolicy(path, options) {
  const { node } = path;

  if (
    node.fullName !== "allow" ||
    options.parentParser ||
    node.value.includes("{{")
  ) {
    return;
  }

  const permissions = parsePermissionsPolicy(getUnescapedAttributeValue(node));

  return () =>
    printExpand(
      join(
        ifBreak(softline, "; "),
        permissions.map((permission) => [
          permission.directive,
          ...(permission.allowlist.length > 0
            ? [" ", permission.allowlist.join(" ")]
            : []),
          ifBreak(";"),
        ]),
      ),
    );
}

export default printPermissionsPolicy;
