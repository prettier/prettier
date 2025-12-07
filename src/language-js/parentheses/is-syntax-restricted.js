import { createTypeCheckFunction } from "../utilities/index.js";

const isStatement = createTypeCheckFunction([
  "BlockStatement",
  "BreakStatement",
  "ClassBody",
  "ClassDeclaration",
  "ClassMethod",
  "ClassPrivateProperty",
  "ClassProperty",
  "ComponentDeclaration",
  "ContinueStatement",
  "DebuggerStatement",
  "DeclareClass",
  "DeclareComponent",
  "DeclareEnum",
  "DeclareExportAllDeclaration",
  "DeclareExportDeclaration",
  "DeclareFunction",
  "DeclareHook",
  "DeclareInterface",
  "DeclareModule",
  "DeclareModuleExports",
  "DeclareNamespace",
  "DeclareVariable",
  "DoWhileStatement",
  "EnumDeclaration",
  "ExportAllDeclaration",
  "ExportDefaultDeclaration",
  "ExportNamedDeclaration",
  "ExpressionStatement",
  "ForInStatement",
  "ForOfStatement",
  "ForStatement",
  "FunctionDeclaration",
  "HookDeclaration",
  "IfStatement",
  "ImportDeclaration",
  "InterfaceDeclaration",
  "LabeledStatement",
  "MethodDefinition",
  "PropertyDefinition",
  "ReturnStatement",
  "SwitchStatement",
  "TSDeclareFunction",
  "TSEnumDeclaration",
  "TSImportEqualsDeclaration",
  "TSInterfaceDeclaration",
  "TSModuleDeclaration",
  "TSNamespaceExportDeclaration",
  "ThrowStatement",
  "TryStatement",
  "TypeAlias",
  "VariableDeclaration",
  "WhileStatement",
  "WithStatement",
]);

function isSyntaxRestricted(path) {
  if (isStatement(path.node)) {
    return true;
  }

  return false;
}

export { isSyntaxRestricted };
