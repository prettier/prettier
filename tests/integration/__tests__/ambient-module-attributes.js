import prettier from "../../config/prettier-entry.js";
import { parsers } from "../../../src/plugins/typescript.js";

// Exercise the ESTree printer while bundled parsers lack ambient attributes.
const plugin = {
  parsers: {
    ambient: {
      ...parsers.typescript,
      parse(text, options) {
        const start = text.indexOf("with");
        const end = text.indexOf("}", start) + 1;
        const ast = parsers.typescript.parse(
          text.slice(0, start) + " ".repeat(end - start) + text.slice(end),
          options,
        );
        const importAst = parsers.typescript.parse(
          "import x from  " + text.slice(15, end) + ";",
          options,
        );
        ast.body[0].attributes = importAst.body[0].attributes;
        return ast;
      },
    },
  },
};

test("preserves ambient module import attributes", async () => {
  const output = await prettier.format(
    'declare module "*" with { type: "text" } {}',
    { parser: "ambient", plugins: [plugin] },
  );
  expect(output).toBe('declare module "*" with { type: "text" } {}\n');
});
