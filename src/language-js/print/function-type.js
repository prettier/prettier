import { group } from "../../document/index.js";
import { hasSameLocStart } from "../loc.js";
import { isFlowObjectTypePropertyAFunction } from "../utilities/index.js";
import { printClassMemberSemicolon } from "./class.js";
import {
  printFunctionParameters,
  shouldGroupFunctionParameters,
} from "./function-parameters.js";
import { printAbstractToken } from "./miscellaneous.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

/**
 * @import {Doc} from "../../document/index.js"
 */

/*
- `TSFunctionType` (TypeScript)
- `TSCallSignatureDeclaration` (TypeScript)
- `TSConstructorType` (TypeScript)
- `TSConstructSignatureDeclaration` (TypeScript)
- `FunctionTypeAnnotation` (Flow)
*/
function printFunctionType(path, options, print) {
  const { node } = path;
  /** @type {Doc[]} */
  const parts = [
    // `TSConstructorType` only
    printAbstractToken(path),
  ];

  if (
    node.type === "TSConstructorType" ||
    node.type === "TSConstructSignatureDeclaration"
  ) {
    parts.push("new ");
  }

  let parametersDoc = printFunctionParameters(
    path,
    options,
    print,
    /* shouldExpandArgument */ false,
    /* shouldPrintTypeParameters */ true,
  );

  const returnTypeDoc = [];
  // `flow` doesn't wrap the `returnType` with `TypeAnnotation`, so the colon
  // needs to be added separately.
  if (node.type === "FunctionTypeAnnotation") {
    returnTypeDoc.push(
      isFlowArrowFunctionTypeAnnotation(path) ? " => " : ": ",
      print("returnType"),
    );
  } else {
    returnTypeDoc.push(printTypeAnnotationProperty(path, print, "returnType"));
  }

  if (shouldGroupFunctionParameters(node, returnTypeDoc)) {
    parametersDoc = group(parametersDoc);
  }

  parts.push(parametersDoc, returnTypeDoc);

  return [
    group(parts),
    node.type === "TSConstructSignatureDeclaration" ||
    node.type === "TSCallSignatureDeclaration"
      ? printClassMemberSemicolon(path, options)
      : "",
  ];
}

/*
`FunctionTypeAnnotation` is ambiguous:
- `declare function foo(a: B): void;`
- `var A: (a: B) => void;`
*/
function isFlowArrowFunctionTypeAnnotation(path) {
  const { node, parent } = path;
  return (
    node.type === "FunctionTypeAnnotation" &&
    (isFlowObjectTypePropertyAFunction(parent) ||
      !(
        ((parent.type === "ObjectTypeProperty" ||
          parent.type === "ObjectTypeInternalSlot") &&
          !parent.variance &&
          !parent.optional &&
          hasSameLocStart(parent, node)) ||
        parent.type === "ObjectTypeCallProperty" ||
        path.getParentNode(2)?.type === "DeclareFunction"
      ))
  );
}

export { printFunctionType };
