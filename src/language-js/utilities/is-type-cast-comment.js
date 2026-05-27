import { getOrInsertComputed } from "../../utilities/get-or-insert.js";
import { isBlockComment } from "./comment-types.js";

/**
@import {Comment} from "../types/estree.js"
*/

const cache = new WeakMap();

/**
 * @param {Comment} comment
 * @returns {boolean}
 */
function isTypeCastComment(comment) {
  return getOrInsertComputed(
    cache,
    comment,
    (comment) =>
      isBlockComment(comment) &&
      comment.value[0] === "*" &&
      // TypeScript expects the type to be enclosed in curly brackets, however
      // Closure Compiler accepts types in parens and even without any delimiters at all.
      // That's why we just search for "@type" and "@satisfies".
      /@(?:type|satisfies)\b/.test(comment.value),
  );
}

export { isTypeCastComment };
