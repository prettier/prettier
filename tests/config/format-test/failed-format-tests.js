import path from "node:path";
import { FORMAT_TEST_DIRECTORY } from "./constants.js";

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
    return [path.join(FORMAT_TEST_DIRECTORY, file), isUnstable];
  }),
);

const unstableAstTests = new Map();

// These tests works on `babel`, `acorn`, `espree`, `oxc`, and `meriyah`
const commentClosureTypecaseTests = ["js/comments-closure-typecast/"];

const disabledTests = new Map(
  Object.entries({
    espree: [
      ...commentClosureTypecaseTests,
      "js/explicit-resource-management/valid-await-using-asi-assignment.js",
    ],
    acorn: [
      "js/explicit-resource-management/valid-await-using-asi-assignment.js",
    ],
    meriyah: [
      // Parsing to different ASTs
      "js/decorators/member-expression.js",
    ],
    "babel-ts": [
      "typescript/conformance/types/moduleDeclaration/kind-detection.ts",
      // https://github.com/babel/babel/pull/17659
      "typescript/conformance/internalModules/importDeclarations/circularImportAlias.ts",
      "typescript/conformance/internalModules/importDeclarations/exportImportAlias.ts",
      "typescript/conformance/internalModules/importDeclarations/importAliasIdentifiers.ts",
      "typescript/conformance/internalModules/importDeclarations/shadowedInternalModule.ts",
      "typescript/conformance/types/moduleDeclaration/moduleDeclaration.ts",
      "typescript/conformance/types/ambient/ambientDeclarations.ts",
      "typescript/compiler/declareDottedModuleName.ts",
      "typescript/compiler/privacyGloImport.ts",
      "typescript/declare/declare_module.ts",
      "typescript/const/initializer-ambient-context.ts",
      "typescript/keywords/keywords.ts",
      "typescript/keywords/module.ts",
      "typescript/module/global.ts",
      "typescript/module/keyword.ts",
      "typescript/module/module_nested.ts",
      "typescript/custom/stability/moduleBlock.ts",
      "typescript/interface2/module.ts",
      "typescript/typescript-only/",
    ],
    oxc: [],
    "oxc-ts": ["typescript/typescript-only/"],
    hermes: [
      ...commentClosureTypecaseTests,

      // Not supported
      "flow/comments/",
      "flow/flow-repo/union_new/",

      // Different result
      "flow/hook/comments-before-arrow.js",
    ],
    flow: [
      // Parsing to different ASTs
      "js/decorators/member-expression.js",
    ],
    typescript: [
      // https://github.com/typescript-eslint/typescript-eslint/issues/11389
      "js/import/long-module-name/import-defer.js",
      "js/import/long-module-name/import-source.js",
    ],
  }).map(([parser, tests]) => [
    parser,
    new Set(tests.map((file) => path.join(FORMAT_TEST_DIRECTORY, file))),
  ]),
);

const isUnstable = (filepath, options) =>
  unstableTests.get(filepath)?.(options);

const isAstUnstable = (filepath, options) =>
  unstableAstTests.get(filepath)?.(options);

const shouldDisable = (directoryOrFile, parser) =>
  disabledTests.get(parser)?.has(directoryOrFile);

export { isAstUnstable, isUnstable, shouldDisable };
