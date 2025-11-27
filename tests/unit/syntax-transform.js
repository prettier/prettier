import path from "node:path";
import url from "node:url";
import { outdent } from "outdent";
import transformCode from "../../scripts/build/transform/index.js";

const file = url.fileURLToPath(
  new URL("../../src/__dummy.js", import.meta.url),
);
const shimsDirectory = url.fileURLToPath(
  new URL("../../scripts/build/shims", import.meta.url),
);
const publicDocPath = url.fileURLToPath(
  new URL("../../src/document/public.js", import.meta.url),
);
const transform = (code) =>
  "\n" +
  transformCode(code, file, {
    __isSyntaxTransformUnitTest: true,
    reuseDocModule: true,
  })
    .replaceAll(
      JSON.stringify(shimsDirectory + path.sep).slice(1, -1),
      "<SHIMS>/",
    )
    .replaceAll(
      JSON.stringify(publicDocPath).slice(1, -1),
      "<PUBLIC_DOC_PATH>",
    ) +
  "\n";

test("Object.hasOwn", () => {
  expect(transform("Object.hasOwn(foo, bar)")).toMatchInlineSnapshot(`
    "
    Object.prototype.hasOwnProperty.call(foo, bar);
    "
  `);
});

test(".at", () => {
  expect(transform("foo.at(-1)")).toMatchInlineSnapshot(`
    "
    import __at from "<SHIMS>/method-at.js";

    __at(/* OPTIONAL_OBJECT: false */0, foo, -1);
    "
  `);

  expect(transform("foo?.at(-1)")).toMatchInlineSnapshot(`
    "
    import __at from "<SHIMS>/method-at.js";

    __at(/* OPTIONAL_OBJECT: true */1, foo, -1);
    "
  `);

  expect(transform("foo?.bar.baz.at(-1)")).toMatchInlineSnapshot(`
    "
    import __at from "<SHIMS>/method-at.js";

    __at(/* OPTIONAL_OBJECT: true */1, foo?.bar.baz, -1);
    "
  `);

  expect(transform("foo.at(-1)?.bar")).toMatchInlineSnapshot(`
    "
    import __at from "<SHIMS>/method-at.js";

    __at(/* OPTIONAL_OBJECT: false */0, foo, -1)?.bar;
    "
  `);

  // Optional call not supported
  expect(transform("foo.at?.(-1)")).toMatchInlineSnapshot(`
    "
    foo.at?.(-1)
    "
  `);
});

test("String#replaceAll", () => {
  expect(transform("foo.replaceAll('a', 'b')")).toMatchInlineSnapshot(`
    "
    import __replaceAll from "<SHIMS>/method-replace-all.js";

    __replaceAll(/* OPTIONAL_OBJECT: false */0, foo, 'a', 'b');
    "
  `);
});

test("Array#findLast", () => {
  expect(transform("foo.findLast(callback)")).toMatchInlineSnapshot(`
    "
    import __findLast from "<SHIMS>/method-find-last.js";

    __findLast(/* OPTIONAL_OBJECT: false */0, foo, callback);
    "
  `);
  expect(transform("foo?.findLast(callback)")).toMatchInlineSnapshot(`
    "
    import __findLast from "<SHIMS>/method-find-last.js";

    __findLast(/* OPTIONAL_OBJECT: true */1, foo, callback);
    "
  `);

  // Not supported
  expect(transform("foo.findLast(callback, thisArgument)"))
    .toMatchInlineSnapshot(`
      "
      foo.findLast(callback, thisArgument)
      "
    `);
});

test("Array#findLastIndex", () => {
  expect(transform("foo.findLastIndex(callback)")).toMatchInlineSnapshot(`
    "
    import __findLastIndex from "<SHIMS>/method-find-last-index.js";

    __findLastIndex(/* OPTIONAL_OBJECT: false */0, foo, callback);
    "
  `);
  expect(transform("foo?.findLastIndex(callback)")).toMatchInlineSnapshot(`
    "
    import __findLastIndex from "<SHIMS>/method-find-last-index.js";

    __findLastIndex(/* OPTIONAL_OBJECT: true */1, foo, callback);
    "
  `);

  // Not supported
  expect(transform("foo.findLastIndex(callback, thisArgument)"))
    .toMatchInlineSnapshot(`
      "
      foo.findLastIndex(callback, thisArgument)
      "
    `);
});

test("Array#toReversed", () => {
  expect(transform("foo.toReversed()")).toMatchInlineSnapshot(`
    "
    import __toReversed from "<SHIMS>/method-to-reversed.js";

    __toReversed(/* OPTIONAL_OBJECT: false */0, foo);
    "
  `);
  expect(transform("foo?.toReversed()")).toMatchInlineSnapshot(`
    "
    import __toReversed from "<SHIMS>/method-to-reversed.js";

    __toReversed(/* OPTIONAL_OBJECT: true */1, foo);
    "
  `);

  expect(transform("foo.toReversed(extraArgument)")).toMatchInlineSnapshot(`
    "
    foo.toReversed(extraArgument)
    "
  `);
});

test("String.raw", () => {
  expect(transform("String.raw`\\\\\\uINVALID`"))
    .toMatchInlineSnapshot(String.raw`
"
"\\\\\\uINVALID";
"
`);
  expect(transform("String.raw`\\uINVALID${'world'}`")).toMatchInlineSnapshot(`
    "
    \`\\\\uINVALID\${'world'}\`;
    "
  `);
});

test("String#isWellFormed", () => {
  expect(transform("foo.isWellFormed()")).toMatchInlineSnapshot(`
    "
    import __isWellFormed from "<SHIMS>/method-is-well-formed.js";

    __isWellFormed(/* OPTIONAL_OBJECT: false */0, foo);
    "
  `);
  expect(transform("foo?.isWellFormed()")).toMatchInlineSnapshot(`
    "
    import __isWellFormed from "<SHIMS>/method-is-well-formed.js";

    __isWellFormed(/* OPTIONAL_OBJECT: true */1, foo);
    "
  `);
  expect(transform("foo?.isWellFormed(extraArgument)")).toMatchInlineSnapshot(`
    "
    foo?.isWellFormed(extraArgument)
    "
  `);
});

test("public doc functionality", () => {
  expect(transform('import {align, line} from "./document/index.js"'))
    .toMatchInlineSnapshot(`
      "
      import { builders as __doc_builders } from "<PUBLIC_DOC_PATH>";
      const {
        align,
        line
      } = __doc_builders;
      "
    `);
  expect(
    transform(outdent`
      import {align as renamedAlign, line, notExists} from "./document/index.js"
      import {line as renamedLine,  notExists2} from "./document/index.js"
    `),
  ).toMatchInlineSnapshot(`
    "
    import { builders as __doc_builders } from "<PUBLIC_DOC_PATH>";
    const {
      align: renamedAlign,
      line,
      line: renamedLine
    } = __doc_builders;
    import { notExists } from "./document/index.js";
    import { notExists2 } from "./document/index.js";
    "
  `);
  expect(
    transform(
      'import {align as renamedAlign, line, printDocToString, findInDoc, canBreak} from "./document/index.js"',
    ),
  ).toMatchInlineSnapshot(`
    "
    import { builders as __doc_builders, printer as __doc_printer, utils as __doc_utils } from "<PUBLIC_DOC_PATH>";
    const {
        align: renamedAlign,
        line
      } = __doc_builders,
      {
        printDocToString
      } = __doc_printer,
      {
        findInDoc,
        canBreak
      } = __doc_utils;
    "
  `);
});

test("All", () => {
  expect(
    transform(outdent`
      import {align, line} from "./document/index.js"

      if (Object.hasOwn(foo, bar)) {
      const a =foo?.at(-1)?.replaceAll(/bar/, ""),
          b = bar?.findLast(() => true),
          c = foo.findLastIndex(callback)
      const d = [a, b, foo].toReversed().join(String.raw\`\${d}\`)
      const r = a.isWellFormed()
      }
    `),
  ).toMatchInlineSnapshot(`
    "
    import __replaceAll from "<SHIMS>/method-replace-all.js";
    import __at from "<SHIMS>/method-at.js";
    import __findLast from "<SHIMS>/method-find-last.js";
    import __findLastIndex from "<SHIMS>/method-find-last-index.js";
    import __toReversed from "<SHIMS>/method-to-reversed.js";
    import __isWellFormed from "<SHIMS>/method-is-well-formed.js";

    import { builders as __doc_builders } from "<PUBLIC_DOC_PATH>";
    const {
      align,
      line
    } = __doc_builders;
    if (Object.prototype.hasOwnProperty.call(foo, bar)) {
      const a = __replaceAll(/* OPTIONAL_OBJECT: true */1, __at(/* OPTIONAL_OBJECT: true */1, foo, -1), /bar/, ""),
        b = __findLast(/* OPTIONAL_OBJECT: true */1, bar, () => true),
        c = __findLastIndex(/* OPTIONAL_OBJECT: false */0, foo, callback);
      const d = __toReversed(/* OPTIONAL_OBJECT: false */0, [a, b, foo]).join(\`\${d}\`);
      const r = __isWellFormed(/* OPTIONAL_OBJECT: false */0, a);
    }
    "
  `);
});
