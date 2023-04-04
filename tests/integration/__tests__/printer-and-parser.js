import prettier from "../../config/prettier-entry.js";

test("Should use printer and parser from the same plugin", async () => {
  const createPlugin = (name) => ({
    name,
    parsers: {
      foo: {
        parse: () => ({ parsedBy: name }),
        astFormat: "foo",
      },
    },
    printers: {
      foo: {
        print: ({ node }) =>
          JSON.stringify({ parsedBy: node.parsedBy, printedBy: name }),
      },
    },
  });

  const pluginA = createPlugin("plugin A");
  const pluginB = createPlugin("plugin B");

  const result = JSON.parse(
    await prettier.format("_", { plugins: [pluginA, pluginB], parser: "foo" })
  );
  expect(result).toEqual({ parsedBy: "plugin B", printedBy: "plugin B" });
});
