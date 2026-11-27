import { printSemicolon } from "./miscellaneous.js";

/*
- `TSNamespaceExportDeclaration` (TypeScript)
- `NamespaceExportDeclaration` (Flow)
*/
function printNamespaceExportDeclaration(path, options, print) {
  return ["export as namespace ", print("id"), printSemicolon(options)];
}

export { printNamespaceExportDeclaration };
