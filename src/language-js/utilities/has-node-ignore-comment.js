import { CommentCheckFlags, hasComment } from "./comments.js";

function hasNodeIgnoreComment(node) {
  return (
    node?.prettierIgnore || hasComment(node, CommentCheckFlags.PrettierIgnore)
  );
}

export { hasNodeIgnoreComment };
