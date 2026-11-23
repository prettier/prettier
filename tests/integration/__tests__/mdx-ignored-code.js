import fs from "node:fs/promises";
import prettier from "../../config/prettier-entry.js";

const fixtures = [
  "basic.mdx",
  "containers.mdx",
  "fences.mdx",
  "whitespace.mdx",
  "unclosed.mdx",
];

function getCodeBlocks(node) {
  return node.type === "code"
    ? [{ value: node.value, lang: node.lang, meta: node.meta }]
    : (node.children ?? []).flatMap(getCodeBlocks);
}

describe.each([{}, { tabWidth: 4 }, { useTabs: true }, { endOfLine: "crlf" }])(
  "ignored code with %j",
  (formatOptions) => {
    test.each(fixtures)("preserves code contents in %s", async (filename) => {
      const input = await fs.readFile(
        new URL(`../../format/mdx/ignored-code/${filename}`, import.meta.url),
        "utf8",
      );
      const options = { parser: "mdx", ...formatOptions };
      const output = await prettier.format(input, options);
      const before = getCodeBlocks(
        (await prettier.__debug.parse(input, options)).ast,
      );
      const after = getCodeBlocks(
        (await prettier.__debug.parse(output, options)).ast,
      );

      expect(after).toStrictEqual(before);
      expect(await prettier.format(output, options)).toBe(output);
    });
  },
);
