import { commonmark as commonmarkTestSuite } from "commonmark.json";

const BUGS = new Set([
  "[FIXED] example-11.md",
  "example-43.md",
  "example-47.md",
  "example-77.md",
  "example-146.md",
  "[FIXED] example-196.md",
  "[FIXED] example-273.md",
  "[FIXED] example-274.md",
  "example-349.md",
  "[FIXED] example-417.md",
  "[FIXED] example-493.md",
  "[FIXED] example-493.md",
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
