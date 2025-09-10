import { join, softline } from "../../document/builders.js";
import { getUnescapedAttributeValue } from "../utils/index.js";
import { printExpand } from "./utils.js";

function printIframeAttribute(path, options) {
  const { node } = path;

  const text = getUnescapedAttributeValue(node).trim();
  if (node.fullName === "allow" && !options.parentParser) {
    const directives = text
      .split(";")
      .map((directive) => directive.trim())
      .filter((directive) => directive.length > 0);

    if (directives.length <= 1) {
      return null;
    }

    const formattedDirectives = directives.map((directive) => directive + ";");

    return () => printExpand(join([softline], formattedDirectives));
  }
}

export { printIframeAttribute };
