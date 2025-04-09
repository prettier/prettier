import prettier from "../../config/prettier-entry.js";

// #13235
test("Plugin instance should not cached", async () => {
  expect([
    await prettier.format(".", {
      plugins: [
        { parsers: { baz: { parse: () => ({}), astFormat: "baz-ast" } } },
        { printers: { "baz-ast": { print: () => "1" } } },
      ],
      parser: "baz",
    }),
    await prettier.format(".", {
      plugins: [
        { parsers: { baz: { parse: () => ({}), astFormat: "baz-ast" } } },
        { printers: { "baz-ast": { print: () => "2" } } },
      ],
      parser: "baz",
    }),
  ]).toEqual(["1", "2"]);
});
