import { outdent } from "outdent";

const makeSnippet = (count, properties) => ({
  name: `${count} binary operators`,
  code: `const value = ${"a + ".repeat(count)}a;\n`,
  output:
    outdent`
      const value =${"\n  a +".repeat(count)}
        a;
    ` + "\n",
  ...properties,
});

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [makeSnippet(2000, { filename: "2000.js" })],
  },
  ["babel", "flow", "typescript"],
);
