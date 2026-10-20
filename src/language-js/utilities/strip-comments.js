import { commentsPropertyInOptions } from "../../constants.js";
import { getOrInsertComputed } from "../../utilities/get-or-insert.js";
import replaceNonLineBreaksWithSpace from "../../utilities/replace-non-line-breaks-with-space.js";
import { locEnd, locStart } from "../location/index.js";

/**
@import {Node, Comment} from "../types/estree.js"
@typedef {Comment[]} Comments
@typedef {{
  originalText: string,
  [commentsPropertyInOptions]: Comments
}} Options
*/

/**
@param {string} text
@param {Comments} comments
@returns {string}
*/
function stripCommentsFromText(text, comments) {
  if (comments.length === 0) {
    return text;
  }

  let result = "";
  let previousEnd = 0;

  for (const comment of comments) {
    const start = locStart(comment);
    const end = locEnd(comment);
    result +=
      text.slice(previousEnd, start) +
      replaceNonLineBreaksWithSpace(text.slice(start, end));
    previousEnd = end;
  }

  return result + text.slice(previousEnd);
}

/** @type {WeakMap<Comment[], string>} */
const cache = new WeakMap();

/**
@param {Options} options
@returns {string}
*/
function stripComments(options) {
  const comments = options[commentsPropertyInOptions];
  return getOrInsertComputed(cache, comments, (comments) =>
    stripCommentsFromText(options.originalText, comments),
  );
}

export { stripComments };
