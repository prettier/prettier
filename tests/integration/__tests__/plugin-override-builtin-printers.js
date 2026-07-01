import prettier from "../../config/prettier-entry.js";
import { estree } from "../../../src/language-js/printers.js";

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

  test("keeps comment placement available for plugin printers", async () => {
    const collectComments = (node, seen = new Set()) => {
      if (!node || typeof node !== "object" || seen.has(node)) {
        return [];
      }

      seen.add(node);

      const comments = Array.isArray(node.comments) ? node.comments : [];
      for (const comment of comments) {
        comment.printed = true;
      }
      return [
        ...comments.map(
          (comment) => `${comment.value.trim()}:${comment.placement}`,
        ),
        ...Object.entries(node).flatMap(([key, value]) =>
          key === "comments" || key === "tokens"
            ? []
            : Array.isArray(value)
              ? value.flatMap((child) => collectComments(child, seen))
              : collectComments(value, seen),
        ),
      ];
    };

    const output = await prettier.format("// own\nfoo();\nfoo(); // end", {
      plugins: [
        {
          printers: {
            estree: {
              ...estree,
              print(path) {
                return collectComments(path.node).sort().join("\n");
              },
            },
          },
        },
      ],
      parser: "babel",
    });

    expect(output).toMatchInlineSnapshot(`
      "end:remaining
      own:endOfLine"
    `);
    expect(output).not.toContain("undefined");
  });
});
