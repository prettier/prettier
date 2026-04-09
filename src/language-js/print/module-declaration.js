import { group } from "../../document/index.js";
import { printDeclareToken } from "./miscellaneous.js";

/*
- `TSModuleDeclaration` (TypeScript)
*/
function printModuleDeclaration(path, options, print) {
  const { node } = path;

  return [
    printDeclareToken(path),
    node.kind === "global" ? "" : `${node.kind} `,
    print("id"),
    node.body
      ? [" ", group(print("body"))]
      : // The semicolon not always needed,
        // but prevent block statement after been parsed as body
        ";",
  ];
}

export { printModuleDeclaration };
