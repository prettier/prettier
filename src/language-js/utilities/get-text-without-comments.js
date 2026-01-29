import { commentsPropertyInOptions } from "../../constants.js";
import replaceNonLineBreaksWithSpace from "../../utilities/replace-non-line-breaks-with-space.js";
import { locEnd, locStart } from "../loc.js";

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
function getTextWithoutCommentsInternal(text, comments) {
  for (const comment of comments) {
    const start = locStart(comment);
    const end = locEnd(comment);

    text =
      text.slice(0, start) +
      replaceNonLineBreaksWithSpace(text.slice(start, end)) +
      text.slice(end);
  }

  return text;
}

/** @type {WeakMap<Comment[], string>} */
const cache = new WeakMap();

/**
@param {Options} options
@returns {string}
*/
function getTextWithoutComments(options) {
  const comments = options[commentsPropertyInOptions];
  if (!cache.has(comments)) {
    cache.set(
      comments,
      getTextWithoutCommentsInternal(options.originalText, comments),
    );
  }
  return cache.get(comments);
}

export { getTextWithoutComments };
