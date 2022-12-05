/** @typedef {import("../../document/builders.js").Doc} Doc */

import assert from "node:assert";
import { printString, printNumber } from "../../common/util.js";
import { replaceEndOfLine } from "../../document/utils.js";
import {
  getParentExportDeclaration,
  isFunctionNotation,
  isGetterOrSetter,
  rawText,
} from "../utils/index.js";
import { printClass } from "./class.js";
import {
  printOpaqueType,
  printTypeAlias,
  printIntersectionType,
  printUnionType,
  printFunctionType,
  printIndexedAccessType,
} from "./type-annotation.js";
import { printInterface } from "./interface.js";
import { printTypeParameter, printTypeParameters } from "./type-parameters.js";
import { printExportDeclaration, printExportAllDeclaration } from "./module.js";
import { printTupleType } from "./array.js";
import { printObject } from "./object.js";
import { printPropertyKey } from "./property.js";
import printEnumMembers from "./enum-members.js";
import { printBigInt } from "./literal.js";
import {
  printOptionalToken,
  printTypeAnnotation,
  printRestSpread,
} from "./misc.js";

function printFlow(path, options, print) {
  const { node } = path;
  const semi = options.semi ? ";" : "";
  /** @type{Doc[]} */
  const parts = [];
  switch (node.type) {
    case "DeclareClass":
      return printFlowDeclaration(path, printClass(path, options, print));
    case "DeclareFunction":
      return printFlowDeclaration(path, [
        "function ",
        print("id"),
        node.predicate ? " " : "",
        print("predicate"),
        semi,
      ]);
    case "DeclareModule":
      return printFlowDeclaration(path, [
        "module ",
        print("id"),
        " ",
        print("body"),
      ]);
    case "DeclareModuleExports":
      return printFlowDeclaration(path, [
        "module.exports",
        ": ",
        print("typeAnnotation"),
        semi,
      ]);
    case "DeclareVariable":
      return printFlowDeclaration(path, ["var ", print("id"), semi]);
    case "DeclareInterface":
      return printFlowDeclaration(path, printInterface(path, options, print));
    case "DeclareExportDeclaration":
      return printFlowDeclaration(
        path,
        printExportDeclaration(path, options, print)
      );
    case "DeclareExportAllDeclaration":
      return printFlowDeclaration(
        path,
        printExportAllDeclaration(path, options, print)
      );
    case "DeclareOpaqueType":
    case "OpaqueType": {
      const doc = printOpaqueType(path, options, print);
      return node.type === "DeclareOpaqueType"
        ? printFlowDeclaration(path, doc)
        : doc;
    }
    case "DeclareTypeAlias":
    case "TypeAlias": {
      const doc = printTypeAlias(path, options, print);
      return node.type === "DeclareTypeAlias"
        ? printFlowDeclaration(path, doc)
        : doc;
    }
    case "IntersectionTypeAnnotation":
      return printIntersectionType(path, options, print);
    case "UnionTypeAnnotation":
      return printUnionType(path, options, print);
    case "FunctionTypeAnnotation":
      return printFunctionType(path, options, print);
    case "TupleTypeAnnotation":
      return printTupleType(path, options, print);
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
      return print("typeAnnotation");
    case "TypeParameter":
      return printTypeParameter(path, options, print);
    case "TypeofTypeAnnotation":
      return ["typeof ", print("argument")];
    case "ExistsTypeAnnotation":
      return "*";
    case "EmptyTypeAnnotation":
      return "empty";
    case "MixedTypeAnnotation":
      return "mixed";
    case "ArrayTypeAnnotation":
      return [print("elementType"), "[]"];
    case "BooleanLiteralTypeAnnotation":
      return String(node.value);
    case "DeclareEnum":
    case "EnumDeclaration": {
      const doc = ["enum ", print("id"), " ", print("body")];
      return node.type === "DeclareEnum"
        ? printFlowDeclaration(path, doc)
        : doc;
    }
    case "EnumBooleanBody":
    case "EnumNumberBody":
    case "EnumStringBody":
    case "EnumSymbolBody":
      if (node.type === "EnumSymbolBody" || node.explicitType) {
        let type = null;
        switch (node.type) {
          case "EnumBooleanBody":
            type = "boolean";
            break;
          case "EnumNumberBody":
            type = "number";
            break;
          case "EnumStringBody":
            type = "string";
            break;
          case "EnumSymbolBody":
            type = "symbol";
            break;
        }
        parts.push("of ", type, " ");
      }
      parts.push(printEnumMembers(path, print, options));
      return parts;

    case "EnumBooleanMember":
    case "EnumNumberMember":
    case "EnumStringMember":
      return [
        print("id"),
        " = ",
        typeof node.init === "object" ? print("init") : String(node.init),
      ];
    case "EnumDefaultedMember":
      return print("id");
    case "FunctionTypeParam": {
      const name = node.name
        ? print("name")
        : path.parent.this === node
        ? "this"
        : "";
      return [
        name,
        printOptionalToken(path),
        name ? ": " : "",
        print("typeAnnotation"),
      ];
    }

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
    case "ObjectTypeCallProperty":
      if (node.static) {
        parts.push("static ");
      }

      parts.push(print("value"));

      return parts;
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
      return printRestSpread(path, options, print);
    case "QualifiedTypeofIdentifier":
    case "QualifiedTypeIdentifier":
      return [print("qualification"), ".", print("id")];
    case "StringLiteralTypeAnnotation":
      return replaceEndOfLine(printString(rawText(node), options));
    case "NumberLiteralTypeAnnotation":
      return printNumber(node.raw ?? node.extra.raw);
    case "BigIntLiteralTypeAnnotation":
      return printBigInt(node.raw ?? node.extra.raw);
    case "TypeCastExpression":
      return [
        "(",
        print("expression"),
        printTypeAnnotation(path, options, print),
        ")",
      ];

    case "TypeParameterDeclaration":
    case "TypeParameterInstantiation":
      return printTypeParameters(path, options, print, "params");

    case "InferredPredicate":
      return "%checks";
    case "DeclaredPredicate":
      return ["%checks(", print("value"), ")"];
    case "AnyTypeAnnotation":
      return "any";
    case "BooleanTypeAnnotation":
      return "boolean";
    case "BigIntTypeAnnotation":
      return "bigint";
    case "NullLiteralTypeAnnotation":
      return "null";
    case "NumberTypeAnnotation":
      return "number";
    case "SymbolTypeAnnotation":
      return "symbol";
    case "StringTypeAnnotation":
      return "string";
    case "VoidTypeAnnotation":
      return "void";
    case "ThisTypeAnnotation":
      return "this";
    // These types are unprintable because they serve as abstract
    // supertypes for other (printable) types.
    case "Node":
    case "Printable":
    case "SourceLocation":
    case "Position":
    case "Statement":
    case "Function":
    case "Pattern":
    case "Expression":
    case "Declaration":
    case "Specifier":
    case "NamedSpecifier":
    case "Comment":
    case "MemberTypeAnnotation": // Flow
    case "Type":
      /* c8 ignore next */
      throw new Error("unprintable type: " + JSON.stringify(node.type));
  }
}

function printFlowDeclaration(path, printed) {
  const parentExportDecl = getParentExportDeclaration(path);

  if (parentExportDecl) {
    assert.strictEqual(parentExportDecl.type, "DeclareExportDeclaration");
    return printed;
  }

  // If the parent node has type DeclareExportDeclaration, then it
  // will be responsible for printing the "declare" token. Otherwise
  // it needs to be printed with this non-exported declaration node.
  return ["declare ", printed];
}

export { printFlow };
