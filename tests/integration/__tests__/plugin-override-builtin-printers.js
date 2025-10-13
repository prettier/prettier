import prettier from "../../config/prettier-entry.js";

/**
If plugin matched by parser:
- Have a matched printer by `astFormat`, use it directly
- Otherwise, use `astFormat` to find another plugin that provides a matched printer

For the real world case, since we don't ship `estree` printer with the JS parsers,
We should allow user provide an `estree` printer
*/
describe("Allow plugin to override printer if the plugin does not provide one", () => {
  test("API", async () => {
    const parsers = { foo: { parse: () => ({}), astFormat: "foo-ast" } };
    const createPrinters = (output) => ({ "foo-ast": { print: () => output } });

    expect(
      await prettier.format(".", {
        plugins: [
          { parsers },
          { printers: createPrinters("1") },
          { printers: createPrinters("2") },
        ],
        parser: "foo",
      }),
    ).toBe("2");

    expect(
      await prettier.format(".", {
        plugins: [
          { parsers, printers: createPrinters("1") },
          { printers: createPrinters("2") },
        ],
        parser: "foo",
      }),
    ).toBe("1");
  });

  test("ESTree", async () => {
    const expectedOutput = "printed by the fake estree printer";
    expect(
      await prettier.format("foo", {
        plugins: [{ printers: { estree: { print: () => expectedOutput } } }],
        parser: "babel",
      }),
    ).toBe(expectedOutput);
  });
});
