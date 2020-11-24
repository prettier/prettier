"use strict";

const assert = require("assert");
const {
  builders: { concat },
} = require("../../document");
const { getParentExportDeclaration } = require("../utils");
const { printClass } = require("./class");
const {
  printOpaqueType,
  printTypeAlias,
  printIntersectionType,
  printUnionType,
  FunctionTypeAnnotation,
  printFunctionType,
} = require("./type-annotation");
const { printInterface } = require("./interface");
const {
  printExportDeclaration,
  printExportAllDeclaration,
} = require("./module");

function printFlow(path, options, print) {
  const n = path.getValue();
  const semi = options.semi ? ";" : "";
  switch (n.type) {
    case "DeclareClass":
      return printFlowDeclaration(path, printClass(path, options, print));
    case "DeclareFunction":
      return printFlowDeclaration(
        path,
        concat([
          "function ",
          path.call(print, "id"),
          n.predicate ? " " : "",
          path.call(print, "predicate"),
          semi,
        ])
      );
    case "DeclareModule":
      return printFlowDeclaration(
        path,
        concat([
          "module ",
          path.call(print, "id"),
          " ",
          path.call(print, "body"),
        ])
      );
    case "DeclareModuleExports":
      return printFlowDeclaration(
        path,
        concat([
          "module.exports",
          ": ",
          path.call(print, "typeAnnotation"),
          semi,
        ])
      );
    case "DeclareVariable":
      return printFlowDeclaration(
        path,
        concat(["var ", path.call(print, "id"), semi])
      );
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
        printExportAllDeclaration(
          path,
          {
            ...options,
            // TODO[@fisker]: confirm `semi` can be added
            semi: false,
          },
          print
        )
      );
    case "IntersectionTypeAnnotation":
      return printIntersectionType(path, options, print);
    case "UnionTypeAnnotation":
      return printUnionType(path, options, print);
    case "FunctionTypeAnnotation":
      return printFunctionType(path, options, print);
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
  return concat(["declare ", printed]);
}

module.exports = { printFlow };
