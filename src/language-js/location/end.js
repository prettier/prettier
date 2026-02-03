import { locEndWithFullText } from "./end-with-full-text.js";
import { overrides } from "./overrides.js";

/**
@import {Node, Comment} from "../types/estree.js";
*/

/**
@param {Node | Comment} node
@return {number}
*/
function locEnd(node) {
  const { type } = node;

  // Effected by children
  // TODO[@fisker]: Add more types
  if (type === "IfStatement") {
    return locEnd(node.alternate ?? node.consequent);
  }

  return (
    overrides.get(type)?.(
      // @ts-expect-error -- Comment types
      node,
      locEnd,
    ) ?? locEndWithFullText(node)
  );
}

export { locEnd };
