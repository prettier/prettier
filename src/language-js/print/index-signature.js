import {
  group,
  ifBreak,
  indent,
  join,
  softline,
} from "../../document/index.js";
import { shouldPrintComma } from "../utilities/index.js";
import { printClassMemberSemicolon } from "./class.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

function printIndexSignature(path, options, print) {
  const { node } = path;
  // The typescript parser accepts multiple parameters here. If you're
  // using them, it makes sense to have a trailing comma. But if you
  // aren't, this is more like a computed property name than an array.
  // So we leave off the trailing comma when there's just one parameter.
  const trailingComma =
    node.parameters.length > 1
      ? ifBreak(shouldPrintComma(options) ? "," : "")
      : "";

  const parametersGroup = group([
    indent([softline, join([", ", softline], path.map(print, "parameters"))]),
    trailingComma,
    softline,
  ]);

  const isClassMember = path.key === "body" && path.parent.type === "ClassBody";

  return [
    // `static` only allowed in class member
    isClassMember && node.static ? "static " : "",
    node.readonly ? "readonly " : "",
    "[",
    node.parameters ? parametersGroup : "",
    "]",
    printTypeAnnotationProperty(path, print),
    printClassMemberSemicolon(path, options),
  ];
}

export { printIndexSignature };
