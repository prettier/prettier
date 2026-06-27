import { group } from "../../document/index.js";
import { printDeclareToken, printSemicolon } from "./miscellaneous.js";

/*
- `TSModuleDeclaration` (TypeScript)
*/
function printModuleDeclaration(path, options, print) {
  const { node } = path;

  return [
    printDeclareToken(path),
    node.kind === "global" ? "" : `${node.kind} `,
    print("id"),
    node.body ? [" ", group(print("body"))] : printSemicolon(options),
  ];
}

export { printModuleDeclaration };
