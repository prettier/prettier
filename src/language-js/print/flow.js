/** @import {Doc} from "../../document/index.js" */

import * as assert from "#universal/assert";
import { replaceEndOfLine } from "../../document/index.js";
import printNumber from "../../utilities/print-number.js";
import printString from "../../utilities/print-string.js";
import getRaw from "../utilities/get-raw.js";
import { isMethod } from "../utilities/index.js";
import isFlowKeywordType from "../utilities/is-flow-keyword-type.js";
import { printArray } from "./array.js";
import { printArrayType } from "./array-type.js";
import { printBinaryCastExpression } from "./cast-expression.js";
import {
  printClass,
  printClassBody,
  printClassMemberSemicolon,
} from "./class.js";
import {
  printComponent,
  printComponentParameter,
  printComponentTypeParameter,
} from "./component.js";
import {
  printEnumDeclaration,
  printEnumMember,
  printFlowEnumBody,
} from "./enum.js";
import { printFunctionType } from "./function-type.js";
import {
  printDeclareHook,
  printHook,
  printHookTypeAnnotation,
} from "./hook.js";
import { printIndexedAccessType } from "./indexed-access-type.js";
import { printInferType } from "./infer-type.js";
import { printIntersectionType } from "./intersection-type.js";
import { printBigInt } from "./literal.js";
import { printFlowMappedTypeProperty } from "./mapped-type.js";
import { printMatch, printMatchCase, printMatchPattern } from "./match.js";
import { printDeclareToken, printOptionalToken } from "./miscellaneous.js";
import { printExportDeclaration } from "./module.js";
import { printObject } from "./object.js";
import { printOpaqueType } from "./opaque-type.js";
import { printPropertyKey } from "./property.js";
import { printSpreadElement } from "./rest-element.js";
import { printRestType } from "./rest-type.js";
import { printTernary } from "./ternary.js";
import { printNamedTupleMember } from "./tuple.js";
import { printTypeAlias } from "./type-alias.js";
import {
  printTypeAnnotation,
  printTypeAnnotationProperty,
} from "./type-annotation.js";
import { printTypeParameter, printTypeParameters } from "./type-parameters.js";
import { printTypePredicate } from "./type-predicate.js";
import { printTypeQuery } from "./type-query.js";
import { printUnionType } from "./union-type.js";

function printFlow(path, options, print) {
  const { node } = path;

  if (isFlowKeywordType(node)) {
    // Flow keyword types ends with `TypeAnnotation`
    return node.type.slice(0, -14).toLowerCase();
  }

  switch (node.type) {
    case "ComponentDeclaration":
    case "DeclareComponent":
    case "ComponentTypeAnnotation":
      return printComponent(path, options, print);
    case "ComponentParameter":
      return printComponentParameter(path, options, print);
    case "ComponentTypeParameter":
      return printComponentTypeParameter(path, options, print);
    case "HookDeclaration":
      return printHook(path, options, print);
    case "DeclareHook":
      return printDeclareHook(path, options, print);
    case "HookTypeAnnotation":
      return printHookTypeAnnotation(path, options, print);
    case "DeclareFunction":
      return [
        printDeclareToken(path),
        "function ",
        print("id"),
        print("predicate"),
        options.semi ? ";" : "",
      ];
    case "DeclareModule":
      return ["declare module ", print("id"), " ", print("body")];
    case "DeclareModuleExports":
      return [
        "declare module.exports",
        printTypeAnnotationProperty(path, print),
        options.semi ? ";" : "",
      ];
    case "DeclareNamespace":
      return ["declare namespace ", print("id"), " ", print("body")];
    case "DeclareVariable":
      return [
        printDeclareToken(path),
        // TODO: Only use `node.kind` when babel update AST
        node.kind ?? "var",
        " ",
        print("id"),
        options.semi ? ";" : "",
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
      return printEnumDeclaration(path, print);

    case "EnumBooleanBody":
    case "EnumNumberBody":
    case "EnumBigIntBody":
    case "EnumStringBody":
    case "EnumSymbolBody":
      return printFlowEnumBody(path, options, print);

    case "EnumBooleanMember":
    case "EnumNumberMember":
    case "EnumBigIntMember":
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

    case "DeclareClass":
    case "DeclareInterface":
    case "InterfaceDeclaration":
    case "InterfaceTypeAnnotation":
      return printClass(path, options, print);
    case "ObjectTypeAnnotation":
      return printClassBody(path, options, print);
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
      return [
        node.static ? "static " : "",
        print("value"),
        printClassMemberSemicolon(path, options),
      ];
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
        printClassMemberSemicolon(path, options),
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
        node.kind !== "init" ? node.kind + " " : "",
        node.variance ? print("variance") : "",
        printPropertyKey(path, options, print),
        printOptionalToken(path),
        isMethod(node) ? "" : ": ",
        print("value"),
        printClassMemberSemicolon(path, options),
      ];
    }
    case "ObjectTypeInternalSlot":
      return [
        node.static ? "static " : "",
        "[[",
        print("id"),
        "]]",
        printOptionalToken(path),
        node.method ? "" : ": ",
        print("value"),
        printClassMemberSemicolon(path, options),
      ];
    // Same as `RestElement`
    case "ObjectTypeSpreadProperty":
      return printSpreadElement(path, print);
    case "QualifiedTypeofIdentifier":
    case "QualifiedTypeIdentifier":
      return [print("qualification"), ".", print("id")];

    case "NullLiteralTypeAnnotation":
      return "null";
    case "BooleanLiteralTypeAnnotation":
      return String(node.value);
    case "StringLiteralTypeAnnotation":
      return replaceEndOfLine(printString(getRaw(node), options));
    case "NumberLiteralTypeAnnotation":
      return printNumber(getRaw(node));
    case "BigIntLiteralTypeAnnotation":
      return printBigInt(getRaw(node));
    case "TypeCastExpression":
      return [
        "(",
        print("expression"),
        printTypeAnnotationProperty(path, print),
        ")",
      ];

    case "TypePredicate":
      return printTypePredicate(path, print);

    case "TypeOperator":
      return [node.operator, " ", print("typeAnnotation")];

    case "TypeParameterDeclaration":
    case "TypeParameterInstantiation":
      return printTypeParameters(path, options, print, "params");

    // Deprecated https://github.com/facebook/flow/commit/b98ae5528d9a073ddc62fc8ce418bbb1f2f80a82
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

    case "MatchExpression":
    case "MatchStatement":
      return printMatch(path, options, print);
    case "MatchExpressionCase":
    case "MatchStatementCase":
      return printMatchCase(path, options, print);
    case "MatchOrPattern":
    case "MatchAsPattern":
    case "MatchWildcardPattern":
    case "MatchLiteralPattern":
    case "MatchUnaryPattern":
    case "MatchIdentifierPattern":
    case "MatchInstancePattern":
    case "MatchInstanceObjectPattern":
    case "MatchMemberPattern":
    case "MatchBindingPattern":
    case "MatchObjectPattern":
    case "MatchObjectPatternProperty":
    case "MatchRestPattern":
    case "MatchArrayPattern":
      return printMatchPattern(path, options, print);

    case "RecordExpression":
      return [
        print("recordConstructor"),
        print("typeArguments"),
        " ",
        print("properties"),
      ];
    case "RecordExpressionProperties":
      return printObject(path, options, print);

    case "RecordDeclaration":
      return printClass(path, options, print);
    case "RecordDeclarationImplements":
      return [print("id"), print("typeArguments")];
    case "RecordDeclarationBody":
      return printClassBody(path, options, print);
    case "RecordDeclarationProperty":
    case "RecordDeclarationStaticProperty": {
      const isStatic = node.type === "RecordDeclarationStaticProperty";
      const parts = isStatic ? ["static "] : [];
      parts.push(
        printPropertyKey(path, options, print),
        printTypeAnnotationProperty(path, print),
      );
      const exprKey = isStatic ? "value" : "defaultValue";
      if (node[exprKey]) {
        parts.push(" = ", print(exprKey));
      }
      return parts;
    }
  }
}

export { printFlow };
