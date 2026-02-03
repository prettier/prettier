import { isIndex } from "./is-index.js";

/**
@import {Node, Comment} from "../types/estree.js";
*/

/**
@param {Node | Comment} node
@return {number}
*/
function locEndWithFullText(node) {
  const end = node.range?.[1] ?? node.end;

  /* c8 ignore next 3 */
  if (process.env.NODE_ENV !== "production" && !isIndex(end)) {
    throw new TypeError("Can't not locate node.");
  }

  return end;
}

export { locEndWithFullText };
