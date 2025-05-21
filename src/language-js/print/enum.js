import { printDeclareToken } from "./misc.js";
import { printObject as printEnumMembers } from "./object.js";

/*
- `EnumBooleanBody`(flow)
- `EnumNumberBody`(flow)
- `EnumBigIntBody`(flow)
- `EnumStringBody`(flow)
- `EnumSymbolBody`(flow)
- `TSEnumBody`(TypeScript)
*/
function printEnumBody(path, options, print) {
  return printEnumMembers(path, options, print);
}

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
- `DeclareEnum`(flow)
- `EnumDeclaration`(flow)
- `TSEnumDeclaration`(TypeScript)
*/
function printEnumDeclaration(path, print) {
  const { node } = path;
  return [
    printDeclareToken(path),
    node.const ? "const " : "",
    "enum ",
    print("id"),
    " ",
    print("body"),
  ];
}

export { printEnumBody, printEnumDeclaration, printEnumMember };
