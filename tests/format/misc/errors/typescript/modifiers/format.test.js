import { outdent } from "outdent";

// `isModifierKind` in `typescript`
const POSSIBLE_MODIFIERS = [
  "abstract",
  "accessor",
  "async",
  "const",
  "declare",
  "default",
  "export",
  "in",
  "out",
  "override",
  "private",
  "protected",
  "public",
  "readonly",
  "static",
];

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // Only `readonly` allowed in some places
      ...POSSIBLE_MODIFIERS.filter(
        (modifier) => modifier !== "readonly",
      ).flatMap((modifier) => [
        outdent`
          interface Foo {
            ${modifier} method();
          }
        `,
        outdent`
          interface Foo {
            ${modifier} property;
          }
        `,
        // index signature
        outdent`
          interface Foo {
            ${modifier} [index: string]: number
          }
        `,
        outdent`
          const foo: {
            ${modifier} [index: string] : string
          } = {};
        `,
      ]),
      outdent`
        interface Foo {
          readonly method();
        }
      `,

      // `TSInterfaceDeclaration`, only `declare` and `export` allowed
      ...POSSIBLE_MODIFIERS.filter(
        (modifier) => modifier !== "declare" && modifier !== "export",
      ).map(
        (modifier) =>
          outdent`
            ${modifier} interface Foo {}
          `,
      ),

      // `TSTypeParameter`, only `in`, `out`, and `const` allowed in type parameter
      ...POSSIBLE_MODIFIERS.filter(
        (modifier) =>
          modifier !== "in" && modifier !== "out" && modifier !== "const",
      ).map((modifier) => `interface Foo<${modifier} T> {}`),

      ...["declare", "readonly"].map(
        (modifier) =>
          outdent`
            class Foo {
              ${modifier} method() {}
            }
          `,
      ),
      outdent`
        class Foo {
          declare get getter() {}
        }
      `,
      outdent`
        class Foo {
          declare set setter(v) {}
        }
      `,

      // `TSModuleDeclaration`
      ...POSSIBLE_MODIFIERS.filter(
        (modifier) => modifier !== "declare" && modifier !== "export",
      ).flatMap((modifier) => [
        `${modifier} module Foo {}`,
        `${modifier} namespace Foo {}`,
      ]),

      // `TSEnumDeclaration`
      ...POSSIBLE_MODIFIERS.filter(
        (modifier) =>
          modifier !== "declare" &&
          modifier !== "const" &&
          modifier !== "export",
      ).map((modifier) => `${modifier} enum Foo {}`),

      // `TSParameterProperty`
      ...POSSIBLE_MODIFIERS.flatMap((modifier) => [
        `function foo(${modifier} parameter) {}`,
        `class Foo { method(${modifier} parameter) {} }`,
      ]),
      ...POSSIBLE_MODIFIERS.filter(
        (modifier) =>
          modifier !== "override" &&
          modifier !== "private" &&
          modifier !== "protected" &&
          modifier !== "public" &&
          modifier !== "readonly",
      ).map(
        (modifier) => `class Foo { constructor(${modifier} parameter) {} }`,
      ),
      'class Foo {["constructor"](private parameter) {}}',
      "class Foo {['constructor'](private parameter) {}}",
      "class Foo {[`constructor`](private parameter) {}}",
      // cspell:disable-next-line
      "class Foo {['const' + 'ructor'](private parameter) {}}",

      // `TSPropertySignature`
      ...POSSIBLE_MODIFIERS.filter((modifier) => modifier !== "readonly").map(
        (modifier) => `type Foo = {${modifier} bar};`,
      ),

      // `TSIndexSignature`
      outdent`
        class Foo {
          declare [index: string]: number
        }
      `,
    ],
  },
  ["babel-ts", "typescript"],
);
