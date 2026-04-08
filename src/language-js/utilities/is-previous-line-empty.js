import isPreviousLineEmptyBeforeIndex from "../../utilities/is-previous-line-empty.js";
import { locStart } from "../location/index.js";

/**
@import {
  Node,
  Comment,
} from "../types/estree.js";
*/

/**
 * @param {Node | Comment} node
 * @returns {boolean}
 */
const isPreviousLineEmpty = (node, { originalText }) =>
  isPreviousLineEmptyBeforeIndex(originalText, locStart(node));

export { isPreviousLineEmpty };
