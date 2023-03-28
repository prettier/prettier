import { getUnescapedAttributeValue } from "../utils/index.js";
import { printAttribute } from "./utils.js";

function printClassNames(path, options) {
  const { node } = path;
  const value = getUnescapedAttributeValue(node);
  if (
    node.fullName === "class" &&
    !options.parentParser &&
    !value.includes("{{")
  ) {
    return () => printAttribute(path, value.trim().split(/\s+/).join(" "));
  }
}

export default printClassNames;
