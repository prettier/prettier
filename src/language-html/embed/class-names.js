import { getUnescapedAttributeValue } from "../utils/index.js";
import { printAttributeDoc } from "./utils.js";

function printClassNames(textToDoc, print, path /*, options*/) {
  const value = getUnescapedAttributeValue(path.node);
  return printAttributeDoc(path, value.trim().split(/\s+/).join(" "));
}

export default printClassNames;
