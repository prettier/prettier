import yamlTestSuite from "yaml-test-suite";

// https://github.com/eemeli/yaml/blob/086fa6b5bae325da18734750cddee231ce578930/tests/yaml-test-suite.ts#L19
// https://github.com/prettier/yaml-unist-parser/blob/7b29a97bc3c1b98688a0b87709855e430735bb31/src/yaml-test-suite.test.ts#L4
const SKIP = new Set(["2JQS.yaml", "9MMA.yaml", "SF5V.yaml"]);

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

          if (SKIP.has(filename)) {
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
