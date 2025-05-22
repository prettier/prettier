import { hasJsxIgnoreComment } from "../print/jsx.js";
import { hasNodeIgnoreComment } from "../utils/index.js";

function isIgnored(path) {
  return hasNodeIgnoreComment(path.node) || hasJsxIgnoreComment(path);
}

export default isIgnored;
