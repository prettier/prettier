/**
@import {Node} from "../types/estree.js"
*/

/**
@param {Node} original
@param {any} cloned
*/
function cleanRegExpLiteral(original, cloned) {
  if (original.type === "RegExpLiteral") {
    cloned.flags = [...original.flags].sort().join("");
  }

  if (original.type === "Literal" && "regex" in original) {
    cloned.regex.flags = [...original.regex.flags].sort().join("");
  }
}

export { cleanRegExpLiteral };
