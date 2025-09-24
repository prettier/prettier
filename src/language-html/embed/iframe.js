import { ifBreak, join, softline } from "../../document/builders.js";
import parseContentSecurityPolicy from "../utils/content-security-policy-parser.js";
import { getUnescapedAttributeValue } from "../utils/index.js";
import { printExpand } from "./utils.js";

function printIframeAttribute(path, options) {
  const { node } = path;

  if (
    node.fullName !== "allow" ||
    options.parentParser ||
    node.value.includes("{{")
  ) {
    return;
  }

  const permissions = parseContentSecurityPolicy(
    getUnescapedAttributeValue(node),
  );

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

export { printIframeAttribute };
