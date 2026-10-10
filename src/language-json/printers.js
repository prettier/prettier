import { getRangeNodes } from "./get-range-nodes.js";
import getVisitorKeys from "./get-visitor-keys.js";
import { massageAstNode } from "./massage-ast/index.js";
import { printJson } from "./print/index.js";

const estreeJsonPrinter = {
  massageAstNode,
  print: printJson,
  getVisitorKeys,
  getRangeNodes,
};

export { estreeJsonPrinter as "estree-json" };
export { estree } from "../language-js/printers.js";
