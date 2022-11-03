/* eslint-disable quotes -- `toMatchInlineSnapshot` uses template literal */
import url from "node:url";
import path from "node:path";
import transformCode from "../../scripts/build/transform/index.js";

const file = url.fileURLToPath(
  new URL("../../src/__dummy.js", import.meta.url)
);
const shimsDirectory = url.fileURLToPath(
  new URL("../../scripts/build/shims", import.meta.url)
);
const transform = (code) =>
  transformCode(code, file).replaceAll(
    JSON.stringify(shimsDirectory + path.sep).slice(1, -1),
    "<SHIMS>/"
  );

test("Object.hasOwn", () => {
  expect(transform("Object.hasOwn(foo, bar)")).toMatchInlineSnapshot(
    `"Object.prototype.hasOwnProperty.call(foo, bar);"`
  );
});

test(".at", () => {
  expect(transform("foo.at(-1)")).toMatchInlineSnapshot(`
    "import __at from "<SHIMS>/at.js";

    __at({
      object: foo,
      isOptionalObject: false,
      arguments: [-1]
    });"
  `);

  expect(transform("foo?.at(-1)")).toMatchInlineSnapshot(`
    "import __at from "<SHIMS>/at.js";

    __at({
      object: foo,
      isOptionalObject: true,
      arguments: [-1]
    });"
  `);

  expect(transform("foo?.bar.baz.at(-1)")).toMatchInlineSnapshot(`
    "import __at from "<SHIMS>/at.js";

    __at({
      object: foo?.bar.baz,
      isOptionalObject: true,
      arguments: [-1]
    });"
  `);

  expect(transform("foo.at(-1)?.bar")).toMatchInlineSnapshot(`
    "import __at from "<SHIMS>/at.js";

    __at({
      object: foo,
      isOptionalObject: false,
      arguments: [-1]
    })?.bar;"
  `);

  // Don't support optional call
  expect(transform("foo.at?.(-1)")).toMatchInlineSnapshot(`"foo.at?.(-1)"`);
});

test(".replaceAll", () => {
  expect(transform("foo.replaceAll('a', 'b')")).toMatchInlineSnapshot(`
    "import __stringReplaceAll from "<SHIMS>/string-replace-all.js";

    __stringReplaceAll({
      object: foo,
      isOptionalObject: false,
      arguments: ['a', 'b']
    });"
  `);
});
