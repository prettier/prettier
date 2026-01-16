import { hasJsxIgnoreComment } from "../print/jsx.js";
import { hasNodeIgnoreComment } from "./index.js";

function isIgnored(path) {
  return hasNodeIgnoreComment(path.node) || hasJsxIgnoreComment(path);
}

export default isIgnored;
