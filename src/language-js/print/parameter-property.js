import { printAssignment } from "./assignment.js";
import {
  printDeclareToken,
  printOptionalToken,
  printTypeScriptAccessibilityToken,
} from "./miscellaneous.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

/*
- `TSParameterProperty` (TypeScript)
- `ParameterProperty` (Flow)
*/
function printParameterProperty(path, options, print) {
  const { node } = path;
  const parts = [
    printDeclareToken(path),
    printTypeScriptAccessibilityToken(node),
    node.static ? "static " : "",
    node.override ? "override " : "",
    node.readonly ? "readonly " : "",
    node.variance ? print("variance") : "",
  ];

  if (node.type === "TSParameterProperty") {
    return [...parts, print("parameter")];
  }

  parts.push(
    print("key"),
    printOptionalToken(path),
    printTypeAnnotationProperty(path, print),
  );

  return printAssignment(path, options, print, parts, " =", "value");
}

export { printParameterProperty };
