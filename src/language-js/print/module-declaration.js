import { group } from "../../document/index.js";
import { printDeclareToken, printSemicolon } from "./miscellaneous.js";

/*
- `TSModuleDeclaration` (TypeScript)
- `DeclareModule` (Flow)
- `DeclareNamespace` (Flow)
*/
function printModuleDeclaration(path, options, print) {
  const { node } = path;
  let kind;
  switch (node.type) {
    case "DeclareModule":
      kind = "module ";
      break;
    case "DeclareNamespace":
      kind = node.global ? "" : `${node.keyword ?? "namespace"} `;
      break;
    case "TSModuleDeclaration":
      kind = node.kind === "global" ? "" : `${node.kind} `;
  }

  return [
    printDeclareToken(path),
    kind,
    print("id"),
    node.body ? [" ", group(print("body"))] : printSemicolon(options),
  ];
}

export { printModuleDeclaration };
