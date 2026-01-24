import { printAssignment } from "./assignment.js";
import { printDeclareToken } from "./miscellaneous.js";

/*
- `DeclareTypeAlias`(flow)
- `TypeAlias`(flow)
- `TSTypeAliasDeclaration`(TypeScript)
*/
function printTypeAlias(path, options, print) {
  const { node } = path;
  const parts = [
    printDeclareToken(path),
    "type ",
    print("id"),
    print("typeParameters"),
  ];

  const rightPropertyName =
    node.type === "TSTypeAliasDeclaration" ? "typeAnnotation" : "right";
  return [
    printAssignment(path, options, print, parts, " =", rightPropertyName),
    options.semi ? ";" : "",
  ];
}

export { printTypeAlias };
