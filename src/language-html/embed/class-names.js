import { getUnescapedAttributeValue } from "../utils/index.js";

function printClassNames(path, options) {
  const { node } = path;

  if (
    options.parentParser ||
    node.fullName !== "class" ||
    node.value.includes("{{")
  ) {
    return;
  }

  return () => getUnescapedAttributeValue(node).trim().split(/\s+/u).join(" ");
}

export default printClassNames;
