import { isBlockComment } from "./comment-types.js";

function getIndentableLinesInternal(comment) {
  /*
  In postprocess.js
  this only called when two comments are next to each other,
  it's not possible for line comments.

  In printComment
  The line comments are checked first, it can't be a line comment either.
  */
  /* c8 ignore next 3 */
  if (!isBlockComment(comment)) {
    return [];
  }

  // If the comment has multiple lines and every line starts with a star
  // we can fix the indentation of each line. The stars in the `/*` and
  // `*/` delimiters are not included in the comment value, so add them
  // back first.
  if (!comment.value.includes("\n")) {
    return [];
  }

  const trimmedLines = [];

  for (let line of `*${comment.value}*`.split("\n")) {
    line = line.trimStart();
    if (!line.startsWith("*")) {
      return [];
    }
    trimmedLines.push(line);
  }

  return trimmedLines;
}

const cache = new WeakMap();

export function getIndentableLines(comment) {
  if (!cache.has(comment)) {
    cache.set(comment, getIndentableLinesInternal(comment));
  }

  return cache.get(comment);
}

export function deleteIndentableLines(comment) {
  cache.delete(comment);
}

function isIndentableBlockComment(comment) {
  return getIndentableLines(comment).length > 0;
}

export default isIndentableBlockComment;
