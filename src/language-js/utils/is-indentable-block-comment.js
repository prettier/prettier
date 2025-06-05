import isBlockComment from "./is-block-comment.js";

function isIndentableBlockCommentInternal(comment) {
  /*
  In postprocess.js
  this only called when two comments are next to each other,
  it's not possible for line comments.

  In printComment
  The line comments are checked first, it can't be a line comment either.
  */
  /* c8 ignore next 3 */
  if (!isBlockComment(comment)) {
    return false;
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
