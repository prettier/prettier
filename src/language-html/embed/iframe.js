import parseContentSecurityPolicy from "content-security-policy-parser";
import { ifBreak, join, softline } from "../../document/builders.js";
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
    const permissions = Array.from(
      parseContentSecurityPolicy(text).entries(),
      ([name, value]) => ({ name, value }),
    );

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
