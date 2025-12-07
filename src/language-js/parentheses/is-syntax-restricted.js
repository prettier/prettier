import { createTypeCheckFunction } from "../utilities/index.js";

const isStatement = createTypeCheckFunction([
  "BlockStatement",
  "BreakStatement",
  "ComponentDeclaration",
  "ClassBody",
  "ClassDeclaration",
  "ClassMethod",
  "ClassProperty",
  "PropertyDefinition",
  "ClassPrivateProperty",
  "ContinueStatement",
  "DebuggerStatement",
  "DeclareComponent",
  "DeclareClass",
  "DeclareExportAllDeclaration",
  "DeclareExportDeclaration",
  "DeclareFunction",
  "DeclareHook",
  "DeclareInterface",
  "DeclareModule",
  "DeclareModuleExports",
  "DeclareNamespace",
  "DeclareVariable",
  "DeclareEnum",
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
  "ReturnStatement",
  "SwitchStatement",
  "ThrowStatement",
  "TryStatement",
  "TSDeclareFunction",
  "TSEnumDeclaration",
  "TSImportEqualsDeclaration",
  "TSInterfaceDeclaration",
  "TSModuleDeclaration",
  "TSNamespaceExportDeclaration",
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
