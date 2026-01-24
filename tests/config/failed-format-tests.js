import path from "node:path";
import createEsmUtils from "esm-utils";

const { __dirname } = createEsmUtils(import.meta);

// TODO: these test files need fix
const unstableTests = new Map(
  [
    ["js/identifier/parentheses/let.js", (options) => options.semi === false],
    "js/comments/return-statement.js",
    "js/comments/tagged-template-literal.js",
    "js/for/9812-unstable.js",
    [
      "js/multiparser-markdown/codeblock.js",
      (options) => options.proseWrap === "always",
    ],
    "flow/hook/declare-hook.js",
    "flow/hook/hook-type-annotation.js",
    "typescript/prettier-ignore/mapped-types.ts",
    "typescript/prettier-ignore/issue-14238.ts",
    "js/for/continue-and-break-comment-without-blocks.js",
    "js/sequence-expression/parenthesized.js",
    "typescript/satisfies-operators/comments-unstable.ts",
    "jsx/comments/in-attributes.js",
    "typescript/union/consistent-with-flow/single-type.ts",
    "js/if/non-block.js",
    "typescript/import-type/long-module-name/long-module-name4.ts",
    // Unstable due to lack of indent information
    "js/multiparser-comments/comment-inside.js",
    [
      "typescript/method-chain/object/issue-17239.ts",
      (options) => options.objectWrap !== "collapse",
    ],
    "typescript/call/callee-comments.ts",
    "js/arrows/arrow-chain-with-trailing-comments.js",
    "typescript/as/comments/18160.ts",
  ].map((fixture) => {
    const [file, isUnstable = () => true] = Array.isArray(fixture)
      ? fixture
      : [fixture];
    return [path.join(__dirname, "../format/", file), isUnstable];
  }),
);

const unstableAstTests = new Map();

// These tests works on `babel`, `acorn`, `espree`, `oxc`, and `meriyah`
const commentClosureTypecaseTests = new Set(
  ["comments-closure-typecast"].map((directory) =>
    path.join(__dirname, "../format/js", directory),
  ),
);

const disabledTests = new Map([
  [
    "espree",
    new Set([
      ...commentClosureTypecaseTests,
      ...[
        "explicit-resource-management/valid-await-using-asi-assignment.js",
      ].map((file) => path.join(__dirname, "../format/js", file)),
    ]),
  ],
  [
    "acorn",
    new Set(
      ["explicit-resource-management/valid-await-using-asi-assignment.js"].map(
        (file) => path.join(__dirname, "../format/js", file),
      ),
    ),
  ],
  [
    "meriyah",
    new Set(
      [
        // Parsing to different ASTs
        "js/decorators/member-expression.js",
      ].map((file) => path.join(__dirname, "../format", file)),
    ),
  ],
  [
    "babel-ts",
    new Set(
      [
        "conformance/types/moduleDeclaration/kind-detection.ts",
        // https://github.com/babel/babel/pull/17659
        "conformance/internalModules/importDeclarations/circularImportAlias.ts",
        "conformance/internalModules/importDeclarations/exportImportAlias.ts",
        "conformance/internalModules/importDeclarations/importAliasIdentifiers.ts",
        "conformance/internalModules/importDeclarations/shadowedInternalModule.ts",
        "conformance/types/moduleDeclaration/moduleDeclaration.ts",
        "conformance/types/ambient/ambientDeclarations.ts",
        "compiler/declareDottedModuleName.ts",
        "compiler/privacyGloImport.ts",
        "declare/declare_module.ts",
        "const/initializer-ambient-context.ts",
        "keywords/keywords.ts",
        "keywords/module.ts",
        "module/global.ts",
        "module/keyword.ts",
        "module/module_nested.ts",
        "custom/stability/moduleBlock.ts",
        "interface2/module.ts",
      ].map((file) => path.join(__dirname, "../format/typescript", file)),
    ),
  ],
  ["oxc", new Set()],
  ["oxc-ts", new Set()],
  [
    "hermes",
    new Set([
      ...commentClosureTypecaseTests,
      ...[
        // Not supported
        "flow/comments",
        "flow-repo/union_new",

        // Different result
        "flow/hook/comments-before-arrow.js",
      ].map((file) => path.join(__dirname, "../format", file)),
    ]),
  ],
  [
    "flow",
    new Set(
      [
        // Parsing to different ASTs
        "js/decorators/member-expression.js",
      ].map((file) => path.join(__dirname, "../format", file)),
    ),
  ],
  [
    "typescript",
    new Set(
      [
        // https://github.com/typescript-eslint/typescript-eslint/issues/11389
        "js/import/long-module-name/import-defer.js",
        "js/import/long-module-name/import-source.js",
      ].map((file) => path.join(__dirname, "../format", file)),
    ),
  ],
]);

const isUnstable = (filename, options) =>
  unstableTests.get(filename)?.(options);

const isAstUnstable = (filename, options) =>
  unstableAstTests.get(filename)(options);

const shouldDisable = (dirnameOrFilename, parser) =>
  disabledTests.get(parser)?.has(dirnameOrFilename);

export { isAstUnstable, isUnstable, shouldDisable };
