import commonmarkTestSuite from "commonmark-test-suite";
import gfmTestSuite from "gfm-test-suite";

const BUGS = new Set();

const exclude = new Set(
  [...commonmarkTestSuite.latest.testCases, ...gfmTestSuite.testCases].map(
    ({ markdown }) => markdown,
  ),
);
const testCases = [];
for (const release of Object.values(commonmarkTestSuite)) {
  if (release === commonmarkTestSuite.latest) {
    continue;
  }

  for (const testCase of release.testCases) {
    const { markdown } = testCase;
    if (exclude.has(markdown)) {
      continue;
    }
    exclude.add(markdown);
    testCases.push({ version: release.version, ...testCase });
  }
}

runFormatTest(
  {
    importMeta: import.meta,
    snippets: testCases
      .map(({ version, section, markdown: input, example }) => {
        const filename = `${version}/example-${example}.md`;

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
