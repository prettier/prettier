import path from "node:path";
import url from "node:url";
import transformCode from "../../scripts/build/transform/index.js";

const file = url.fileURLToPath(
  new URL("../../src/__dummy.js", import.meta.url),
);
const shimsDirectory = url.fileURLToPath(
  new URL("../../scripts/build/shims", import.meta.url),
);
const transform = (code) =>
  transformCode(code, file).replaceAll(
    JSON.stringify(shimsDirectory + path.sep).slice(1, -1),
    "<SHIMS>/",
  );

test("Object.hasOwn", () => {
  expect(transform("Object.hasOwn(foo, bar)")).toMatchInlineSnapshot(
    `"Object.prototype.hasOwnProperty.call(foo,bar)"`,
  );
});

test(".at", () => {
  expect(transform("foo.at(-1)")).toMatchInlineSnapshot(`
"import __at from "<SHIMS>/method-at.js";

__at  (/* isOptionalObject */false,foo,-1)"
`);

  expect(transform("foo?.at(-1)")).toMatchInlineSnapshot(`
"import __at from "<SHIMS>/method-at.js";

__at   (/* isOptionalObject */true,foo,-1)"
`);

  expect(transform("foo?.bar.baz.at(-1)")).toMatchInlineSnapshot(`
"import __at from "<SHIMS>/method-at.js";

__at           (/* isOptionalObject */true,foo?.bar.baz,-1)"
`);

  expect(transform("foo.at(-1)?.bar")).toMatchInlineSnapshot(`
"import __at from "<SHIMS>/method-at.js";

__at  (/* isOptionalObject */false,foo,-1)?.bar"
`);

  // Optional call not supported
  expect(transform("foo.at?.(-1)")).toMatchInlineSnapshot(`"foo.at?.(-1)"`);
});

test("String#replaceAll", () => {
  expect(transform("foo.replaceAll('a', 'b')")).toMatchInlineSnapshot(`
"import __replaceAll from "<SHIMS>/method-replace-all.js";

__replaceAll  (/* isOptionalObject */false,foo,'a','b')"
`);
});

test("Array#findLast", () => {
  expect(transform("foo.findLast(callback)")).toMatchInlineSnapshot(`
"import __findLast from "<SHIMS>/method-find-last.js";

__findLast  (/* isOptionalObject */false,foo,callback)"
`);
  expect(transform("foo?.findLast(callback)")).toMatchInlineSnapshot(`
"import __findLast from "<SHIMS>/method-find-last.js";

__findLast   (/* isOptionalObject */true,foo,callback)"
`);

  // Not supported
  expect(
    transform("foo.findLast(callback, thisArgument)"),
  ).toMatchInlineSnapshot(`"foo.findLast(callback, thisArgument)"`);
});

test("Array#findLastIndex", () => {
  expect(transform("foo.findLastIndex(callback)")).toMatchInlineSnapshot(`
"import __findLastIndex from "<SHIMS>/method-find-last-index.js";

__findLastIndex  (/* isOptionalObject */false,foo,callback)"
`);
  expect(transform("foo?.findLastIndex(callback)")).toMatchInlineSnapshot(`
"import __findLastIndex from "<SHIMS>/method-find-last-index.js";

__findLastIndex   (/* isOptionalObject */true,foo,callback)"
`);

  // Not supported
  expect(
    transform("foo.findLastIndex(callback, thisArgument)"),
  ).toMatchInlineSnapshot(`"foo.findLastIndex(callback, thisArgument)"`);
});

test("Array#toReversed", () => {
  expect(transform("foo.toReversed()")).toMatchInlineSnapshot(`
"import __toReversed from "<SHIMS>/method-to-reversed.js";

__toReversed  (/* isOptionalObject */false,foo)"
`);
  expect(transform("foo?.toReversed()")).toMatchInlineSnapshot(`
"import __toReversed from "<SHIMS>/method-to-reversed.js";

__toReversed   (/* isOptionalObject */true,foo)"
`);

  expect(transform("foo.toReversed(extraArgument)")).toMatchInlineSnapshot(
    `"foo.toReversed(extraArgument)"`,
  );
});

test("String.raw", () => {
  expect(transform("String.raw`\\\\\\uINVALID`")).toMatchInlineSnapshot(
    String.raw`""\\\\\\uINVALID""`,
  );
  expect(transform("String.raw`\\uINVALID${'world'}`")).toMatchInlineSnapshot(
    `"          \`\\\\uINVALID\${'world'}\`"`,
  );
});
