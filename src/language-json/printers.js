import massageAstNode from "./clean.js";
import getVisitorKeys from "./get-visitor-keys.js";
import { printJson } from "./print/index.js";

const estreeJsonPrinter = {
  massageAstNode,
  print: printJson,
  getVisitorKeys,
};

export { estreeJsonPrinter as "estree-json" };
export { estree } from "../language-js/printers.js";
