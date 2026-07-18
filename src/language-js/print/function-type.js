import { group, hardline } from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import { hasSameLocStart } from "../location/index.js";
import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import { isFlowObjectTypePropertyAFunction } from "../utilities/is-flow-object-type-property-a-function.js";
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

  const beforeParametersDoc = printMarkedDanglingComments(
    path,
    options,
    "commentBeforeParameters",
  );
  if (beforeParametersDoc) {
    parts.push(
      beforeParametersDoc,
      hasMarkedLineComment(path.node, "commentBeforeParameters")
        ? hardline
        : " ",
    );
  }

  let parametersDoc = printFunctionParameters(
    path,
    options,
    print,
    /* shouldExpandParameters */ false,
    /* shouldPrintTypeParameters */ true,
  );

  const hasLineCommentAfterParameters = hasMarkedLineComment(
    path.node,
    "commentAfterParameters",
  );
  const returnTypeDoc = [];
  // `flow` doesn't wrap the `returnType` with `TypeAnnotation`, so the colon
  // needs to be added separately.
  if (node.type === "FunctionTypeAnnotation") {
    returnTypeDoc.push(
      isFlowArrowFunctionTypeAnnotation(path) ? " => " : ": ",
      print("returnType"),
    );
  } else if (hasLineCommentAfterParameters) {
    // Mark the type annotation as checked without putting its leading space at
    // the beginning of the line following a line comment.
    printTypeAnnotationProperty(path, print, "returnType");
    returnTypeDoc.push(print("returnType"));
  } else {
    returnTypeDoc.push(printTypeAnnotationProperty(path, print, "returnType"));
  }

  if (shouldGroupFunctionParameters(node, returnTypeDoc)) {
    parametersDoc = group(parametersDoc);
  }

  parts.push(parametersDoc);

  const afterParametersDoc = printMarkedDanglingComments(
    path,
    options,
    "commentAfterParameters",
  );
  if (afterParametersDoc) {
    parts.push(
      " ",
      afterParametersDoc,
      hasLineCommentAfterParameters ? hardline : "",
    );
  }

  parts.push(returnTypeDoc);

  return [
    group(parts),
    node.type === "TSConstructSignatureDeclaration" ||
    node.type === "TSCallSignatureDeclaration"
      ? printClassMemberSemicolon(path, options)
      : "",
  ];
}

function printMarkedDanglingComments(path, options, marker) {
  return printDanglingComments(path, options, { marker });
}

function hasMarkedLineComment(node, marker) {
  return hasComment(
    node,
    CommentCheckFlags.Dangling | CommentCheckFlags.Line,
    (comment) => comment.marker === marker,
  );
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
