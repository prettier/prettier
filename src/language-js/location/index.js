import { locEnd } from "./end.js";
import { isIndex } from "./is-index.js";
import { locStart } from "./start.js";

/**
@import {Node, Comment} from "../types/estree.js";
*/

/**
 * @param {Node} nodeA
 * @param {Node} nodeB
 * @returns {boolean}
 */
function hasSameLocStart(nodeA, nodeB) {
  const nodeAStart = locStart(nodeA);
  return isIndex(nodeAStart) && nodeAStart === locStart(nodeB);
}

/**
 * @param {Node} nodeA
 * @param {Node} nodeB
 * @returns {boolean}
 */
function hasSameLocEnd(nodeA, nodeB) {
  const nodeAEnd = locEnd(nodeA);
  return isIndex(nodeAEnd) && nodeAEnd === locEnd(nodeB);
}

/**
 * @param {Node} nodeA
 * @param {Node} nodeB
 * @returns {boolean}
 */
function hasSameLoc(nodeA, nodeB) {
  return hasSameLocStart(nodeA, nodeB) && hasSameLocEnd(nodeA, nodeB);
}

export { hasSameLoc, hasSameLocStart };
export { locEnd } from "./end.js";
export { locEndWithFullText } from "./end-with-full-text.js";
export { locStart } from "./start.js";
