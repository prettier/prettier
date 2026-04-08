import { hasJsxIgnoreComment } from "./has-jsx-ignore-comment.js";
import { hasNodeIgnoreComment } from "./has-node-ignore-comment.js";

function isIgnored(path) {
  return hasNodeIgnoreComment(path.node) || hasJsxIgnoreComment(path);
}

export default isIgnored;
