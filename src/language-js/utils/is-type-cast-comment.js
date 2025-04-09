import isBlockComment from "./is-block-comment.js";

/**
 * @import {Comment} from "../types/estree.js"
 */

/**
 * @param {Comment} comment
 * @returns {boolean}
 */
function isTypeCastComment(comment) {
  return (
    isBlockComment(comment) &&
    comment.value[0] === "*" &&
    // TypeScript expects the type to be enclosed in curly brackets, however
    // Closure Compiler accepts types in parens and even without any delimiters at all.
    // That's why we just search for "@type" and "@satisfies".
    /@(?:type|satisfies)\b/u.test(comment.value)
  );
}

export default isTypeCastComment;
