import getVisitorKeys from "./get-visitor-keys.js";
import { printJson } from "./print/index.js";
import { clean as massageAstNode } from "./print/json.js";

const estreeJsonPrinter = {
  massageAstNode,
  print: printJson,
  getVisitorKeys,
};

export { estreeJsonPrinter as "estree-json" };
export { estree } from "../language-js/printers.js";
