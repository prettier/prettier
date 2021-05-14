"use strict";

const assert = require("assert");
const { getParentExportDeclaration } = require("../utils");
const { printClass } = require("./class");
const {
  printOpaqueType,
  printTypeAlias,
  printIntersectionType,
  printUnionType,
  printFunctionType,
  printTupleType,
  printIndexedAccessType,
} = require("./type-annotation");
const { printInterface } = require("./interface");
const {
  printTypeParameter,
  printTypeParameters,
} = require("./type-parameters");
const {
  printExportDeclaration,
  printExportAllDeclaration,
} = require("./module");

function printFlow(path, options, print) {
  const node = path.getValue();
  const semi = options.semi ? ";" : "";
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
    case "DeclareOpaqueType":
      return printFlowDeclaration(path, printOpaqueType(path, options, print));
    case "DeclareInterface":
      return printFlowDeclaration(path, printInterface(path, options, print));
    case "DeclareTypeAlias":
      return printFlowDeclaration(path, printTypeAlias(path, options, print));
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

module.exports = { printFlow };
