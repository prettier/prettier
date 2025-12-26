import commonmarkTestSuite from "commonmark-test-suite";

const BUGS = new Set([
  "example-43.md",
  "example-47.md",
  "example-77.md",
  "example-146.md",
  "example-349.md",
]);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: commonmarkTestSuite.latest.testCases
      .map(({ section, markdown: input, example }) => {
        const filename = `example-${example}.md`;

        if (BUGS.has(filename)) {
          return;
        }

        return {
          name: `${filename} (${section})`,
          filename,
          code: input,
        };
      })
      .filter(Boolean),
  },
  ["markdown"],
  { proseWrap: "always" },
);
