import getVisitorKeys from "./get-visitor-keys.js";
import { massageAstNode } from "./massage-ast/index.js";
import { printJson } from "./print/index.js";

const estreeJsonPrinter = {
  massageAstNode,
  print: printJson,
  getVisitorKeys,
};

export { estreeJsonPrinter as "estree-json" };
export { estree } from "../language-js/printers.js";
