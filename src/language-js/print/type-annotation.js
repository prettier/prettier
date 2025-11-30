import { group, indent, line } from "../../document/index.js";
import { hasSameLocStart } from "../loc.js";
import {
  CommentCheckFlags,
  hasComment,
  isFlowObjectTypePropertyAFunction,
  isObjectType,
  isSimpleType,
  isUnionType,
} from "../utils/index.js";
import { printClassMemberSemicolon } from "./class.js";
import {
  printFunctionParameters,
  shouldGroupFunctionParameters,
} from "./function-parameters.js";
import {
  printAbstractToken,
  printDeclareToken,
  printOptionalToken,
} from "./misc.js";
import { shouldHugUnionType } from "./union-type.js";

/**
 * @import {Doc} from "../../document/index.js"
 */

function shouldHugType(node) {
  if (isSimpleType(node) || isObjectType(node)) {
    return true;
  }

  if (isUnionType(node)) {
    return shouldHugUnionType(node);
  }

  return false;
}

/*
- `DeclareOpaqueType`(flow)
- `OpaqueType`(flow)
*/
function printOpaqueType(path, options, print) {
  const { node } = path;
  const parts = [
    printDeclareToken(path),
    "opaque type ",
    print("id"),
    print("typeParameters"),
  ];

  if (node.supertype) {
    parts.push(": ", print("supertype"));
  }

  if (node.lowerBound || node.upperBound) {
    const lowerAndUpperBoundParts = [];
    if (node.lowerBound) {
      lowerAndUpperBoundParts.push(
        indent([line, "super ", print("lowerBound")]),
      );
    }
    if (node.upperBound) {
      lowerAndUpperBoundParts.push(
        indent([line, "extends ", print("upperBound")]),
      );
    }
    parts.push(group(lowerAndUpperBoundParts));
  }

  if (node.impltype) {
    parts.push(" = ", print("impltype"));
  }

  parts.push(options.semi ? ";" : "");

  return parts;
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
- `TSInferType`(TypeScript)
- `InferTypeAnnotation`(flow)
*/
function printInferType(path, options, print) {
  return ["infer ", print("typeParameter")];
}

// `TSJSDocNullableType`, `TSJSDocNonNullableType`
function printJSDocType(path, print, token) {
  const { node } = path;
  return [
    node.postfix ? "" : token,
    printTypeAnnotationProperty(path, print),
    node.postfix ? token : "",
  ];
}

/*
- `TSRestType`(TypeScript)
- `TupleTypeSpreadElement`(flow)
*/
function printRestType(path, options, print) {
  const { node } = path;

  return [
    "...",
    ...(node.type === "TupleTypeSpreadElement" && node.label
      ? [print("label"), ": "]
      : []),
    print("typeAnnotation"),
  ];
}

/*
Normally the `(TS)TypeAnnotation` node starts with `:` token.
If we print `:` in parent node, `cursorNodeDiff` in `/src/main/core.js` will consider `:` is removed, cause cursor moves, see #12491.
Token *before* `(TS)TypeAnnotation.typeAnnotation` should be printed in `getTypeAnnotationFirstToken` function.
*/
const typeAnnotationNodesCheckedLeadingComments = new WeakSet();
function printTypeAnnotationProperty(
  path,
  print,
  propertyName = "typeAnnotation",
) {
  const {
    node: { [propertyName]: typeAnnotation },
  } = path;

  if (!typeAnnotation) {
    return "";
  }

  let shouldPrintLeadingSpace = false;

  if (
    typeAnnotation.type === "TSTypeAnnotation" ||
    typeAnnotation.type === "TypeAnnotation"
  ) {
    const firstToken = path.call(getTypeAnnotationFirstToken, propertyName);

    if (
      firstToken === "=>" ||
      (firstToken === ":" &&
        hasComment(typeAnnotation, CommentCheckFlags.Leading))
    ) {
      shouldPrintLeadingSpace = true;
    }

    typeAnnotationNodesCheckedLeadingComments.add(typeAnnotation);
  }

  return shouldPrintLeadingSpace
    ? [" ", print(propertyName)]
    : print(propertyName);
}

const getTypeAnnotationFirstToken = (path) => {
  if (
    // TypeScript
    path.match(
      (node) => node.type === "TSTypeAnnotation",
      (node, key) =>
        (key === "returnType" || key === "typeAnnotation") &&
        (node.type === "TSFunctionType" || node.type === "TSConstructorType"),
    )
  ) {
    return "=>";
  }

  if (
    // TypeScript
    path.match(
      (node) => node.type === "TSTypeAnnotation",
      (node, key) =>
        key === "typeAnnotation" &&
        (node.type === "TSJSDocNullableType" ||
          node.type === "TSJSDocNonNullableType" ||
          node.type === "TSTypePredicate"),
    ) ||
    /*
    Flow

    ```js
    declare function foo(): void;
                        ^^^^^^^^ `TypeAnnotation`
    ```
    */
    path.match(
      (node) => node.type === "TypeAnnotation",
      (node, key) => key === "typeAnnotation" && node.type === "Identifier",
      (node, key) => key === "id" && node.type === "DeclareFunction",
    ) ||
    /*
    Flow
    ```js
    declare hook foo(): void;
                    ^^^^^^^^ `TypeAnnotation`
    ```
    */
    path.match(
      (node) => node.type === "TypeAnnotation",
      (node, key) => key === "typeAnnotation" && node.type === "Identifier",
      (node, key) => key === "id" && node.type === "DeclareHook",
    ) ||
    /*
    Flow

    ```js
    type A = () => infer R extends string;
                                   ^^^^^^ `TypeAnnotation`
    ```
    */
    path.match(
      (node) => node.type === "TypeAnnotation",
      (node, key) =>
        key === "bound" &&
        node.type === "TypeParameter" &&
        node.usesExtendsBound,
    )
  ) {
    return "";
  }

  return ":";
};

/*
- `TSTypeAnnotation` (TypeScript)
- `TypeAnnotation` (Flow)
*/
function printTypeAnnotation(path, options, print) {
  // We need print space before leading comments,
  // `printTypeAnnotationProperty` is responsible for it.
  /* c8 ignore start */
  if (process.env.NODE_ENV !== "production") {
    const { node } = path;

    if (!typeAnnotationNodesCheckedLeadingComments.has(node)) {
      throw Object.assign(
        new Error(
          `'${node.type}' should be printed by '${printTypeAnnotationProperty.name}' function.`,
        ),
        { parentNode: path.parent, propertyName: path.key },
      );
    }
  }
  /* c8 ignore stop */

  const token = getTypeAnnotationFirstToken(path);
  return token
    ? [token, " ", print("typeAnnotation")]
    : print("typeAnnotation");
}

/*
- `TSArrayType`
- `ArrayTypeAnnotation`
*/
function printArrayType(print) {
  return [print("elementType"), "[]"];
}

/*
- `TSTypeQuery` (TypeScript)
- `TypeofTypeAnnotation` (flow)
*/
function printTypeQuery({ node }, print) {
  const argumentPropertyName =
    node.type === "TSTypeQuery" ? "exprName" : "argument";
  return ["typeof ", print(argumentPropertyName), print("typeArguments")];
}

export {
  printArrayType,
  printFunctionType,
  printInferType,
  printJSDocType,
  printOpaqueType,
  printRestType,
  printTypeAnnotation,
  printTypeAnnotationProperty,
  printTypeQuery,
  shouldHugType,
};
