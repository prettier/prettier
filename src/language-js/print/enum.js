import { printDeclareToken } from "./miscellaneous.js";
import { printObject } from "./object.js";

function printFlowEnumBody(path, options, print) {
  const { node } = path;
  return [
    node.type === "EnumSymbolBody" || node.explicitType
      ? `of ${node.type
          .slice(
            // `Enum`
            4,
            // `Body`
            -4,
          )
          .toLowerCase()} `
      : "",
    printObject(path, options, print),
  ];
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
  const isTsEnumMember = node.type === "TSEnumMember";

  const idDoc = print("id");
  const initializerProperty = isTsEnumMember ? "initializer" : "init";
  if (!node[initializerProperty]) {
    return idDoc;
  }

  return [idDoc, " = ", print(initializerProperty)];
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

export { printEnumDeclaration, printEnumMember, printFlowEnumBody };
