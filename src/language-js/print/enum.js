import { hardline, softline, group, indent } from "../../document/builders.js";
import { printDanglingComments } from "../../main/comments.js";
import { shouldPrintComma } from "../utils/index.js";
import { printArrayItems } from "./array.js";
import { printTypeScriptModifiers, printDeclareToken } from "./misc.js";

function printEnumMemberList(path, print, options) {
  const {
    node: { members, hasUnknownMembers },
  } = path;

  if (members.length === 0 && !hasUnknownMembers) {
    return [printDanglingComments(path, options), softline];
  }

  return [
    indent([
      ...(members.length > 0
        ? [
            hardline,
            printArrayItems(path, options, "members", print),
            hasUnknownMembers || shouldPrintComma(options) ? "," : "",
          ]
        : []),
      ...(hasUnknownMembers ? [hardline, "..."] : []),
    ]),
    printDanglingComments(path, options, /* sameIndent */ true),
    hardline,
  ];
}

function printEnumMembers(path, print, options) {
  return group(["{", printEnumMemberList(path, print, options), "}"]);
}

/*
- `EnumBooleanMember`(flow)
- `EnumNumberMember`(flow)
- `EnumStringMember`(flow)
- `EnumDefaultedMember`(flow)
- `TSEnumMember`(TypeScript)
*/
function printEnumMember(path, print) {
  const { node } = path;

  let idDoc = print("id");

  if (node.computed) {
    idDoc = ["[", idDoc, "]"];
  }

  let initializerDoc = "";

  // `TSEnumMember`
  if (node.initializer) {
    initializerDoc = print("initializer");
  }

  // Flow
  if (node.init) {
    initializerDoc = print("init");
  }

  if (!initializerDoc) {
    return idDoc;
  }

  return [idDoc, " = ", initializerDoc];
}

/*
- `EnumBooleanBody`(flow)
- `EnumNumberBody`(flow)
- `EnumStringBody`(flow)
- `EnumSymbolBody`(flow)
*/
function printEnumBody(path, print, options) {
  const { node } = path;
  let type;

  if (node.type === "EnumSymbolBody" || node.explicitType) {
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
  }

  return [type ? `of ${type} ` : "", printEnumMembers(path, print, options)];
}

/*
- `DeclareEnum`(flow)
- `EnumDeclaration`(flow)
- `TSEnumDeclaration`(TypeScript)
*/
function printEnumDeclaration(path, print, options) {
  const { node } = path;
  return [
    printDeclareToken(path),
    printTypeScriptModifiers(path, options, print),
    node.const ? "const " : "",
    "enum ",
    print("id"),
    " ",
    node.type === "TSEnumDeclaration"
      ? printEnumMembers(path, print, options)
      : print("body"),
  ];
}

export { printEnumDeclaration, printEnumMember, printEnumBody };
