/** @typedef {import("../../document/builders.js").Doc} Doc */

import assert from "node:assert";
import printString from "../../utils/print-string.js";
import printNumber from "../../utils/print-number.js";
import { replaceTextEndOfLine } from "../../document/utils.js";
import {
  isFunctionNotation,
  isGetterOrSetter,
  rawText,
} from "../utils/index.js";
import isFlowKeywordType from "../utils/is-flow-keyword-type.js";
import { printBinaryCastExpression } from "./cast-expression.js";
import { printClass } from "./class.js";
import {
  printOpaqueType,
  printTypeAlias,
  printIntersectionType,
  printInferType,
  printUnionType,
  printFunctionType,
  printIndexedAccessType,
  printRestType,
  printNamedTupleMember,
  printTypeAnnotation,
  printTypeAnnotationProperty,
  printArrayType,
  printTypeQuery,
  printTypePredicate,
} from "./type-annotation.js";
import { printInterface } from "./interface.js";
import { printTypeParameter, printTypeParameters } from "./type-parameters.js";
import { printExportDeclaration } from "./module.js";
import { printArray } from "./array.js";
import { printObject } from "./object.js";
import { printPropertyKey } from "./property.js";
import {
  printEnumDeclaration,
  printEnumBody,
  printEnumMember,
} from "./enum.js";
import { printBigInt } from "./literal.js";
import {
  printOptionalToken,
  printRestSpread,
  printDeclareToken,
} from "./misc.js";
import { printTernary } from "./ternary.js";
import { printFlowMappedTypeProperty } from "./mapped-type.js";

function printFlow(path, options, print) {
  const { node } = path;

  if (isFlowKeywordType(node)) {
    // Flow keyword types ends with `TypeAnnotation`
    return node.type.slice(0, -14).toLowerCase();
  }

  const semi = options.semi ? ";" : "";

  switch (node.type) {
    case "DeclareClass":
      return printClass(path, options, print);
    case "DeclareFunction":
      return [
        printDeclareToken(path),
        "function ",
        print("id"),
        print("predicate"),
        semi,
      ];
    case "DeclareModule":
      return ["declare module ", print("id"), " ", print("body")];
    case "DeclareModuleExports":
      return [
        "declare module.exports",
        printTypeAnnotationProperty(path, print),
        semi,
      ];
    case "DeclareVariable":
      return [
        printDeclareToken(path),
        // TODO: Only use `node.kind` when babel update AST
        node.kind ?? "var",
        " ",
        print("id"),
        semi,
      ];
    case "DeclareExportDeclaration":
    case "DeclareExportAllDeclaration":
      return printExportDeclaration(path, options, print);
    case "DeclareOpaqueType":
    case "OpaqueType":
      return printOpaqueType(path, options, print);

    case "DeclareTypeAlias":
    case "TypeAlias":
      return printTypeAlias(path, options, print);

    case "IntersectionTypeAnnotation":
      return printIntersectionType(path, options, print);
    case "UnionTypeAnnotation":
      return printUnionType(path, options, print);
    case "ConditionalTypeAnnotation":
      return printTernary(path, options, print);
    case "InferTypeAnnotation":
      return printInferType(path, options, print);
    case "FunctionTypeAnnotation":
      return printFunctionType(path, options, print);
    case "TupleTypeAnnotation":
      return printArray(path, options, print);
    case "TupleTypeLabeledElement":
      return printNamedTupleMember(path, options, print);
    case "TupleTypeSpreadElement":
      return printRestType(path, options, print);
    case "GenericTypeAnnotation":
      return [
        print("id"),
        printTypeParameters(path, options, print, "typeParameters"),
      ];
    case "IndexedAccessType":
    case "OptionalIndexedAccessType":
      return printIndexedAccessType(path, options, print);
    // Type Annotations for Facebook Flow, typically stripped out or
    // transformed away before printing.
    case "TypeAnnotation":
      return printTypeAnnotation(path, options, print);
    case "TypeParameter":
      return printTypeParameter(path, options, print);
    case "TypeofTypeAnnotation":
      return printTypeQuery(path, print);
    case "ExistsTypeAnnotation":
      return "*";
    case "ArrayTypeAnnotation":
      return printArrayType(print);

    case "DeclareEnum":
    case "EnumDeclaration":
      return printEnumDeclaration(path, print, options);

    case "EnumBooleanBody":
    case "EnumNumberBody":
    case "EnumStringBody":
    case "EnumSymbolBody":
      return printEnumBody(path, print, options);

    case "EnumBooleanMember":
    case "EnumNumberMember":
    case "EnumStringMember":
    case "EnumDefaultedMember":
      return printEnumMember(path, print);

    case "FunctionTypeParam": {
      const name = node.name
        ? print("name")
        : path.parent.this === node
        ? "this"
        : "";
      return [
        name,
        printOptionalToken(path),
        // `flow` doesn't wrap the `typeAnnotation` with `TypeAnnotation`, so the colon
        // needs to be added separately.
        name ? ": " : "",
        print("typeAnnotation"),
      ];
    }

    case "DeclareInterface":
    case "InterfaceDeclaration":
    case "InterfaceTypeAnnotation":
      return printInterface(path, options, print);
    case "ClassImplements":
    case "InterfaceExtends":
      return [print("id"), print("typeParameters")];
    case "NullableTypeAnnotation":
      return ["?", print("typeAnnotation")];
    case "Variance": {
      const { kind } = node;
      assert.ok(kind === "plus" || kind === "minus");
      return kind === "plus" ? "+" : "-";
    }
    case "KeyofTypeAnnotation":
      return ["keyof ", print("argument")];
    case "ObjectTypeCallProperty":
      return [node.static ? "static " : "", print("value")];
    case "ObjectTypeMappedTypeProperty":
      return printFlowMappedTypeProperty(path, options, print);
    case "ObjectTypeIndexer":
      return [
        node.static ? "static " : "",
        node.variance ? print("variance") : "",
        "[",
        print("id"),
        node.id ? ": " : "",
        print("key"),
        "]: ",
        print("value"),
      ];

    case "ObjectTypeProperty": {
      let modifier = "";

      if (node.proto) {
        modifier = "proto ";
      } else if (node.static) {
        modifier = "static ";
      }

      return [
        modifier,
        isGetterOrSetter(node) ? node.kind + " " : "",
        node.variance ? print("variance") : "",
        printPropertyKey(path, options, print),
        printOptionalToken(path),
        isFunctionNotation(node) ? "" : ": ",
        print("value"),
      ];
    }
    case "ObjectTypeAnnotation":
      return printObject(path, options, print);
    case "ObjectTypeInternalSlot":
      return [
        node.static ? "static " : "",
        "[[",
        print("id"),
        "]]",
        printOptionalToken(path),
        node.method ? "" : ": ",
        print("value"),
      ];
    // Same as `RestElement`
    case "ObjectTypeSpreadProperty":
      return printRestSpread(path, print);
    case "QualifiedTypeofIdentifier":
    case "QualifiedTypeIdentifier":
      return [print("qualification"), ".", print("id")];

    case "NullLiteralTypeAnnotation":
      return "null";
    case "BooleanLiteralTypeAnnotation":
      return String(node.value);
    case "StringLiteralTypeAnnotation":
      return replaceTextEndOfLine(printString(rawText(node), options));
    case "NumberLiteralTypeAnnotation":
      return printNumber(node.raw ?? node.extra.raw);
    case "BigIntLiteralTypeAnnotation":
      return printBigInt(node.raw ?? node.extra.raw);
    case "TypeCastExpression":
      return [
        "(",
        print("expression"),
        printTypeAnnotationProperty(path, print),
        ")",
      ];

    case "TypePredicate":
      return printTypePredicate(path, print);

    case "TypeParameterDeclaration":
    case "TypeParameterInstantiation":
      return printTypeParameters(path, options, print, "params");

    case "InferredPredicate":
    case "DeclaredPredicate":
      // Note: Leading comment print should be improved https://github.com/prettier/prettier/pull/14710#issuecomment-1512522282
      return [
        // The return type will already add the colon, but otherwise we
        // need to do it ourselves
        path.key === "predicate" &&
        path.parent.type !== "DeclareFunction" &&
        !path.parent.returnType
          ? ": "
          : " ",
        "%checks",
        ...(node.type === "DeclaredPredicate"
          ? ["(", print("value"), ")"]
          : []),
      ];

    case "AsExpression":
    case "AsConstExpression":
    case "SatisfiesExpression":
      return printBinaryCastExpression(path, options, print);
  }
}

export { printFlow };
