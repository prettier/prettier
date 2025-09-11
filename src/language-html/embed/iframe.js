import { ifBreak, join, softline } from "../../document/builders.js";
import parseContentSecurityPolicy from "../utils/content-security-parser.js";
import { getUnescapedAttributeValue } from "../utils/index.js";
import { printExpand } from "./utils.js";

function printIframeAttribute(path, options) {
  const { node } = path;

  const text = getUnescapedAttributeValue(node).trim();
  if (
    node.fullName === "allow" &&
    !options.parentParser &&
    !text.includes("{{")
  ) {
    const permissions = parseContentSecurityPolicy(text);

    return () =>
      printExpand(
        join(
          softline,
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
