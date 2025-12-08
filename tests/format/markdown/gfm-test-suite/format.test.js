import commonmarkTestSuite from "commonmark-test-suite";
import gfmTestSuite from "gfm-test-suite";

const existsInCommonmarkTestSuite = new Set(
  commonmarkTestSuite.latest.testCases.map(({ markdown }) => markdown),
);

const BUGS = new Set(["example-203.md", "example-204.md"]);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: gfmTestSuite.testCases
      .map(({ section, markdown: input, example }) => {
        if (existsInCommonmarkTestSuite.has(input)) {
          return;
        }

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
