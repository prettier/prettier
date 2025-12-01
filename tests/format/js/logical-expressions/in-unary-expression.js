

// https://github.com/estree/estree/blob/96fee942ecc2b3b9d3c34163ec142b75daf4cca1/es5.md#unaryoperator
[
!(
  //
  octahedralAnteaterGenerator ||
  //
  stellatedFossilProcessor
),
-(
  //
  octahedralAnteaterGenerator ||
  //
  stellatedFossilProcessor
),
+(
  //
  octahedralAnteaterGenerator ||
  //
  stellatedFossilProcessor
),
typeof (
  //
  octahedralAnteaterGenerator ||
  //
  stellatedFossilProcessor
),
void (
  //
  octahedralAnteaterGenerator ||
  //
  stellatedFossilProcessor
),
];

  if (
    !(
      // `import("foo")`
      (
        node.type === "ImportExpression" ||
        // `type foo = import("foo")`
        node.type === "TSImportType" ||
        // `import type A = require("foo")`
        node.type === "TSExternalModuleReference" ||
        // `require("foo")`
        // `require.resolve("foo")`
        // `require.resolve.paths("foo")`
        // `import.meta.resolve("foo")`
        (node.type === "CallExpression" &&
          !node.optional &&
          isNodeMatches(node.callee, moduleImportCallees))
      )
    )
  ) {
    doSomething()
  }
