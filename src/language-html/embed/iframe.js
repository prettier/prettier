import { ifBreak, join, softline } from "../../document/builders.js";
import parseContentSecurityPolicy from "../utils/content-security-policy-parser.js";
import { getUnescapedAttributeValue } from "../utils/index.js";
import { printExpand } from "./utils.js";

function printIframeAttribute(path, options) {
  const { node } = path;

  if (node.fullName !== "allow" || options.parentParser) {
    return;
  }

  const text = getUnescapedAttributeValue(node).trim();
  if (!text.includes("{{")) {
    const permissions = parseContentSecurityPolicy(text);

    return () =>
      printExpand(
        join(
          ifBreak(softline, "; "),
          permissions.map((permission) => [
            permission.name,
            ...(permission.value.length > 0
              ? [" ", permission.value.join(" ")]
              : []),
            ifBreak(";"),
          ]),
        ),
      );
  }
}

export { printIframeAttribute };
