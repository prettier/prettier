import { printSemicolon } from "./miscellaneous.js";
import { printImportKind } from "./module.js";

function printImportEqualsDeclaration(path, options, print) {
  const { node } = path;

  return [
    node.type === "ImportEqualsDeclaration" && node.isExport ? "export " : "",
    "import ",
    printImportKind(node, /* spaceBeforeKind */ false),
    print("id"),
    " = ",
    print("moduleReference"),
    printSemicolon(options),
  ];
}

export { printImportEqualsDeclaration };
