import { locEnd, locStart } from "../../location/index.js";
import { hasIgnorePragma, hasPragma } from "../../pragma.js";

function createParser(options) {
  options = typeof options === "function" ? { parse: options } : options;

  return {
    astFormat: "estree",
    hasPragma,
    hasIgnorePragma,
    locStart,
    locEnd,
    ...options,
  };
}

export default createParser;
