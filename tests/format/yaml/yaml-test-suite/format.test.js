import yamlTestSuite from "yaml-test-suite";

// https://github.com/prettier/prettier/issues/18302
const BUGS = new Set([
  "DE56-3.yaml",
  "DE56-4.yaml",
  // Bug: https://github.com/eemeli/yaml/issues/646
  "M5DY.yaml",
]);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: yamlTestSuite.flatMap(({ name, id, cases }) =>
      cases
        .map((testCase, index) => {
          if (testCase.fail) {
            return;
          }

          const filename = `${id}${index === 0 ? "" : `-${index + 1}`}.yaml`;

          if (BUGS.has(filename)) {
            // console.log(testCase);
            return;
          }

          return {
            name: filename + " - " + name,
            filename,
            code: testCase.yaml,
          };
        })
        .filter(Boolean),
    ),
  },
  ["yaml"],
);
