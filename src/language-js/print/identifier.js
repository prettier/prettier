import { printDefiniteToken, printOptionalToken } from "./miscellaneous.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

function printIdentifier(path, options, print) {
  return [
    path.node.name,
    printOptionalToken(path),
    printDefiniteToken(path),
    printTypeAnnotationProperty(path, print),
  ];
}

export { printIdentifier };
