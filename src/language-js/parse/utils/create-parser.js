import { locEnd,locStart } from "../../loc.js";
import { hasPragma } from "../../pragma.js";

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
