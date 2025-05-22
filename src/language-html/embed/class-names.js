import { getUnescapedAttributeValue } from "../utils/index.js";

function printClassNames(path, options) {
  const { node } = path;
  const value = getUnescapedAttributeValue(node);
  if (
    node.fullName === "class" &&
    !options.parentParser &&
    !value.includes("{{")
  ) {
    return () => value.trim().split(/\s+/u).join(" ");
  }
}

export default printClassNames;
