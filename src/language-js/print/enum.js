import { printDeclareToken } from "./misc.js";
import { printObject as printEnumMembers } from "./object.js";

/*
- `EnumBooleanMember`(flow)
- `EnumNumberMember`(flow)
- `EnumBigIntMember`(flow)
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
- `EnumBigIntBody`(flow)
- `EnumStringBody`(flow)
- `EnumSymbolBody`(flow)
*/
function printEnumBody(path, options, print) {
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
      case "EnumBigIntBody":
        type = "bigint";
        break;
      case "EnumStringBody":
        type = "string";
        break;
      case "EnumSymbolBody":
        type = "symbol";
        break;
    }
  }

  return [type ? `of ${type} ` : "", printEnumMembers(path, options, print)];
}

/*
- `DeclareEnum`(flow)
- `EnumDeclaration`(flow)
- `TSEnumDeclaration`(TypeScript)
*/
function printEnumDeclaration(path, options, print) {
  const { node } = path;
  return [
    printDeclareToken(path),
    node.const ? "const " : "",
    "enum ",
    print("id"),
    " ",
    node.type === "TSEnumDeclaration"
      ? printEnumMembers(path, options, print)
      : print("body"),
  ];
}

export { printEnumBody, printEnumDeclaration, printEnumMember };
