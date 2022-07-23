/** @typedef {import("../../document/builders.js").Doc} Doc */

import assert from "node:assert";
import { printDanglingComments } from "../../main/comments.js";
import { printString, printNumber } from "../../common/util.js";
import { hardline, softline, group, indent } from "../../document/builders.js";
import {
  getParentExportDeclaration,
  isFunctionNotation,
  isGetterOrSetter,
  rawText,
  shouldPrintComma,
} from "../utils/index.js";
import { locStart, locEnd } from "../loc.js";
import { printClass } from "./class.js";
import {
  printOpaqueType,
  printTypeAlias,
  printIntersectionType,
  printUnionType,
  printFunctionType,
  printTupleType,
  printIndexedAccessType,
} from "./type-annotation.js";
import { printInterface } from "./interface.js";
import { printTypeParameter, printTypeParameters } from "./type-parameters.js";
import { printExportDeclaration, printExportAllDeclaration } from "./module.js";
import { printArrayItems } from "./array.js";
import { printObject } from "./object.js";
import { printPropertyKey } from "./property.js";
import {
  printOptionalToken,
  printTypeAnnotation,
  printRestSpread,
} from "./misc.js";

async function printFlow(path, options, print) {
  const node = path.getValue();
  const semi = options.semi ? ";" : "";
  /** @type{Doc[]} */
  const parts = [];
  switch (node.type) {
    case "DeclareClass":
      return printFlowDeclaration(path, await printClass(path, options, print));
    case "DeclareFunction":
      return printFlowDeclaration(path, [
        "function ",
        await print("id"),
        node.predicate ? " " : "",
        await print("predicate"),
        semi,
      ]);
    case "DeclareModule":
      return printFlowDeclaration(path, [
        "module ",
        await print("id"),
        " ",
        await print("body"),
      ]);
    case "DeclareModuleExports":
      return printFlowDeclaration(path, [
        "module.exports",
        ": ",
        await print("typeAnnotation"),
        semi,
      ]);
    case "DeclareVariable":
      return printFlowDeclaration(path, ["var ", await print("id"), semi]);
    case "DeclareOpaqueType":
      return printFlowDeclaration(
        path,
        await printOpaqueType(path, options, print)
      );
    case "DeclareInterface":
      return printFlowDeclaration(
        path,
        await printInterface(path, options, print)
      );
    case "DeclareTypeAlias":
      return printFlowDeclaration(
        path,
        await printTypeAlias(path, options, print)
      );
    case "DeclareExportDeclaration":
      return printFlowDeclaration(
        path,
        await printExportDeclaration(path, options, print)
      );
    case "DeclareExportAllDeclaration":
      return printFlowDeclaration(
        path,
        await printExportAllDeclaration(path, options, print)
      );
    case "OpaqueType":
      return printOpaqueType(path, options, print);
    case "TypeAlias":
      return printTypeAlias(path, options, print);
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
        await print("id"),
        await printTypeParameters(path, options, print, "typeParameters"),
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
      return ["typeof ", await print("argument")];
    case "ExistsTypeAnnotation":
      return "*";
    case "EmptyTypeAnnotation":
      return "empty";
    case "MixedTypeAnnotation":
      return "mixed";
    case "ArrayTypeAnnotation":
      return [await print("elementType"), "[]"];
    case "BooleanLiteralTypeAnnotation":
      return String(node.value);
    case "EnumDeclaration":
      return ["enum ", await print("id"), " ", await print("body")];
    case "EnumBooleanBody":
    case "EnumNumberBody":
    case "EnumStringBody":
    case "EnumSymbolBody": {
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
      if (node.members.length === 0 && !node.hasUnknownMembers) {
        parts.push(
          group(["{", printDanglingComments(path, options), softline, "}"])
        );
      } else {
        const members =
          node.members.length > 0
            ? [
                hardline,
                await printArrayItems(path, options, "members", print),
                node.hasUnknownMembers || shouldPrintComma(options) ? "," : "",
              ]
            : [];

        parts.push(
          group([
            "{",
            indent([
              ...members,
              ...(node.hasUnknownMembers ? [hardline, "..."] : []),
            ]),
            printDanglingComments(path, options, /* sameIndent */ true),
            hardline,
            "}",
          ])
        );
      }
      return parts;
    }
    case "EnumBooleanMember":
    case "EnumNumberMember":
    case "EnumStringMember":
      return [
        await print("id"),
        " = ",
        typeof node.init === "object" ? await print("init") : String(node.init),
      ];
    case "EnumDefaultedMember":
      return print("id");
    case "FunctionTypeParam": {
      const name = node.name
        ? await print("name")
        : path.getParentNode().this === node
        ? "this"
        : "";
      return [
        name,
        await printOptionalToken(path),
        name ? ": " : "",
        await print("typeAnnotation"),
      ];
    }

    case "InterfaceDeclaration":
    case "InterfaceTypeAnnotation":
      return printInterface(path, options, print);
    case "ClassImplements":
    case "InterfaceExtends":
      return [await print("id"), await print("typeParameters")];
    case "NullableTypeAnnotation":
      return ["?", await print("typeAnnotation")];
    case "Variance": {
      const { kind } = node;
      assert.ok(kind === "plus" || kind === "minus");
      return kind === "plus" ? "+" : "-";
    }
    case "ObjectTypeCallProperty":
      if (node.static) {
        parts.push("static ");
      }

      parts.push(await print("value"));

      return parts;
    case "ObjectTypeIndexer": {
      return [
        node.static ? "static " : "",
        node.variance ? await print("variance") : "",
        "[",
        await print("id"),
        node.id ? ": " : "",
        await print("key"),
        "]: ",
        await print("value"),
      ];
    }
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
        node.variance ? await print("variance") : "",
        await printPropertyKey(path, options, print),
        printOptionalToken(path),
        isFunctionNotation(node) ? "" : ": ",
        await print("value"),
      ];
    }
    case "ObjectTypeAnnotation":
      return printObject(path, options, print);
    case "ObjectTypeInternalSlot":
      return [
        node.static ? "static " : "",
        "[[",
        await print("id"),
        "]]",
        printOptionalToken(path),
        node.method ? "" : ": ",
        await print("value"),
      ];
    // Same as `RestElement`
    case "ObjectTypeSpreadProperty":
      return printRestSpread(path, options, print);
    case "QualifiedTypeofIdentifier":
    case "QualifiedTypeIdentifier":
      return [await print("qualification"), ".", await print("id")];
    case "StringLiteralTypeAnnotation":
      return printString(rawText(node), options);
    case "NumberLiteralTypeAnnotation":
      assert.strictEqual(typeof node.value, "number");
    // fall through
    case "BigIntLiteralTypeAnnotation":
      if (node.extra) {
        return printNumber(node.extra.raw);
      }
      return printNumber(node.raw);
    case "TypeCastExpression": {
      return [
        "(",
        await print("expression"),
        await printTypeAnnotation(path, options, print),
        ")",
      ];
    }

    case "TypeParameterDeclaration":
    case "TypeParameterInstantiation": {
      const printed = await printTypeParameters(path, options, print, "params");

      if (options.parser === "flow") {
        const start = locStart(node);
        const end = locEnd(node);
        const commentStartIndex = options.originalText.lastIndexOf("/*", start);
        const commentEndIndex = options.originalText.indexOf("*/", end);
        if (commentStartIndex !== -1 && commentEndIndex !== -1) {
          const comment = options.originalText
            .slice(commentStartIndex + 2, commentEndIndex)
            .trim();
          if (
            comment.startsWith("::") &&
            !comment.includes("/*") &&
            !comment.includes("*/")
          ) {
            return ["/*:: ", printed, " */"];
          }
        }
      }

      return printed;
    }

    case "InferredPredicate":
      return "%checks";
    // Unhandled types below. If encountered, nodes of these types should
    // be either left alone or desugared into AST types that are fully
    // supported by the pretty-printer.
    case "DeclaredPredicate":
      return ["%checks(", await print("value"), ")"];
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
      /* istanbul ignore next */
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
