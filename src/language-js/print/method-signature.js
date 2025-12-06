import { group } from "../../document/index.js";
import { printClassMemberSemicolon } from "./class.js";
import {
  printFunctionParameters,
  shouldGroupFunctionParameters,
} from "./function-parameters.js";
import {
  printOptionalToken,
  printTypeScriptAccessibilityToken,
} from "./miscellaneous.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

function printMethodSignature(path, options, print) {
  const { node } = path;
  const parts = [];
  const kind = node.kind && node.kind !== "method" ? `${node.kind} ` : "";
  parts.push(
    printTypeScriptAccessibilityToken(node),
    kind,
    node.computed ? "[" : "",
    print("key"),
    node.computed ? "]" : "",
    printOptionalToken(path),
  );

  const parametersDoc = printFunctionParameters(
    path,
    options,
    print,
    /* shouldExpandArgument */ false,
    /* shouldPrintTypeParameters */ true,
  );

  const returnTypeDoc = printTypeAnnotationProperty(path, print, "returnType");
  const shouldGroupParameters = shouldGroupFunctionParameters(
    node,
    returnTypeDoc,
  );

  parts.push(shouldGroupParameters ? group(parametersDoc) : parametersDoc);

  if (node.returnType) {
    parts.push(group(returnTypeDoc));
  }

  return [group(parts), printClassMemberSemicolon(path, options)];
}

export { printMethodSignature };
