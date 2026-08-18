import path from "node:path";
import { FORMAT_TEST_DIRECTORY } from "./constants.js";

// TODO: these test files need fix
const unstableTests = new Map(
  [
    [
      "js/ignore/semi/class-expression-decorator.js",
      (options) => options.semi === false,
    ],
    ["js/ignore/semi/head-ignored.js", (options) => options.semi === false],
    "js/comments/return-statement.js",
    [
      "js/multiparser-markdown/codeblock.js",
      (options) => options.proseWrap === "always",
    ],
    "flow/hook/declare-hook.js",
    "flow/hook/hook-type-annotation.js",
    "flow/comments/type_annotations.js",
    "typescript/prettier-ignore/mapped-types.ts",
    "js/for-of/comments.js",
    "js/sequence-expression/parenthesized.js",
    "typescript/satisfies-operators/comments-unstable.ts",
    "jsx/comments/in-attributes.js",
    "typescript/import-type/long-module-name/long-module-name4.ts",
    [
      "typescript/method-chain/object/issue-17239.ts",
      (options) => options.objectWrap !== "collapse",
    ],
    "typescript/call/callee-comments.ts",
    "js/arrows/arrow-chain-with-trailing-comments.js",
    "typescript/as/comments/18160.ts",
    "js/sequence-expression/parenthesized-trailing-comment-unstable.js",
    "typescript/union/consistent-with-flow/single-type.ts",
  ].map((fixture) => {
    const [file, isUnstable = () => true] = Array.isArray(fixture)
      ? fixture
      : [fixture];
    return [path.join(FORMAT_TEST_DIRECTORY, file), isUnstable];
  }),
);

const unstableAstTests = new Map();

// These tests works on `babel`, `acorn`, `espree`, `oxc`, and `meriyah`
const commentClosureTypecaseTests = [
  "js/comments-closure-typecast/",
  "js/comments-closure-typecast/no-semi/",
];

const disabledTests = new Map(
  Object.entries({
    espree: commentClosureTypecaseTests,
    acorn: [],
    meriyah: [],
    "babel-ts": [],
    oxc: [],
    "oxc-ts": [],
    yuku: ["js/await/await-with-parens.js"],
    "yuku-ts": ["js/await/await-with-parens.js"],
    hermes: [
      "js/await/like-call.js", // Different result
      "jsx/top-level-await/test.jsx",
    ],
    flow: [
      "js/decorators/member-expression.js", // Parsing to different ASTs
      "js/await/await-with-parens.js",
      "js/await/like-call.js",
      "jsx/top-level-await/test.jsx",
    ],
    typescript: [],
    yaml: [
      // Bug: https://github.com/eemeli/yaml/issues/646
      "yaml/spec/spec-example-2-11-mapping-between-sequences.yml",
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
