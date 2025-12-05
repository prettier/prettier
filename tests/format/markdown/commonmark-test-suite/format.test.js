import { commonmark as commonmarkTestSuite } from "commonmark.json";

const BUGS = new Set([
  "example-11.md",
  "example-43.md",
  "example-47.md",
  "example-77.md",
  "example-146.md",
  "example-196.md",
  "example-273.md",
  "example-274.md",
  "example-349.md",
  "example-417.md",
  "example-438.md",
  "example-493.md",
]);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: commonmarkTestSuite
      .map(({ section, markdown: input }, index) => {
        const filename = `example-${index + 1}.md`;
        if (BUGS.has(filename)) {
          return;
        }

        return {
          name: `example-${index + 1}.md (${section})`,
          filename,
          code: input,
        };
      })
      .filter(Boolean),
  },
  ["markdown"],
  { proseWrap: "always" },
);
