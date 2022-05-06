import { hasPragma } from "../../pragma.js";
import { locStart, locEnd } from "../../loc.js";

function createParser(options) {
  options = typeof options === "function" ? { parse: options } : options;

  return {
    astFormat: "estree",
    hasPragma,
    locStart,
    locEnd,
    ...options,
  };
}

export default createParser;
