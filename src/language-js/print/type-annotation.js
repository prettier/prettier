import {
  CommentCheckFlags,
  hasComment,
  isObjectType,
  isSimpleType,
  isUnionType,
} from "../utilities/index.js";
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

export { printTypeAnnotation, printTypeAnnotationProperty, shouldHugType };
