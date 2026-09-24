import { group } from "../../document/index.js";
import { printDeclareToken, printSemicolon } from "./miscellaneous.js";

/*
- `TSModuleDeclaration` (TypeScript)
- `DeclareNamespace` (Flow)
*/
function printModuleDeclaration(path, options, print) {
  const { node } = path;
  const kind =
    node.type === "DeclareNamespace"
      ? node.global
        ? ""
        : `${node.keyword ?? "namespace"} `
      : node.kind === "global"
        ? ""
        : `${node.kind} `;

  return [
    printDeclareToken(path),
    kind,
    print("id"),
    node.body ? [" ", group(print("body"))] : printSemicolon(options),
  ];
}

export { printModuleDeclaration };
