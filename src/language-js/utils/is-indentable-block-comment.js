import isBlockComment from "./is-block-comment.js";

function isIndentableBlockCommentInternal(comment) {
  if (!isBlockComment(comment)) {
    return;
  }

  // If the comment has multiple lines and every line starts with a star
  // we can fix the indentation of each line. The stars in the `/*` and
  // `*/` delimiters are not included in the comment value, so add them
  // back first.
  const lines = `*${comment.value}*`.split("\n");
  return lines.length > 1 && lines.every((line) => line.trimStart()[0] === "*");
}

const cache = new WeakMap();

function isIndentableBlockComment(comment) {
  if (!cache.has(comment)) {
    cache.set(comment, isIndentableBlockCommentInternal(comment));
  }

  return cache.get(comment);
}

export default isIndentableBlockComment;
