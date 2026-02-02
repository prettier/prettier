import isNextLineEmptyAfterIndex from "../../utilities/is-next-line-empty.js";
import { locEnd, locEndWithFullText } from "../loc.js";

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
const isNextLineEmpty = (node, { originalText }) => {
  const end = locEnd(node);

  if (isNextLineEmptyAfterIndex(originalText, end)) {
    return true;
  }

  const endWithSemicolon = locEndWithFullText(node);
  if (endWithSemicolon === end) {
    return false;
  }

  return isNextLineEmptyAfterIndex(originalText, endWithSemicolon);
};

export { isNextLineEmpty };
