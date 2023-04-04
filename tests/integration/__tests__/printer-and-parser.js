import prettier from "../../config/prettier-entry.js";

test("Should use printer and parser from the same plugin", async() => {
  const createPlugin = (mark) => ({
    parsers: {
      foo: {
        parse: () => ({ parsedBy: mark}),
        astFormat: "foo",
      },
    },
    printers: {
      foo: {
        print: ({node}) => JSON.stringify({parsedBy: node.parsedBy, printedBy: mark})
      }
    },
  })

  const pluginA = createPlugin("plugin A");
  const pluginB = createPlugin("plugin B");;

  const result = JSON.parse(await prettier.format("_", {plugins: [pluginA, pluginB], parser: "foo"}))
  expect(result).toEqual({parsedBy: "plugin A", printedBy: "pluginB"})
});
