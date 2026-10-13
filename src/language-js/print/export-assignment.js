function printExportAssignment(path, options, print) {
  return [
    "export = ",
    print("expression"),
    path.node.expression.type === "DeclareFunction"
      ? ""
      : printSemicolon(options),
  ];
}

import { printSemicolon } from "./miscellaneous.js";
export { printExportAssignment };
