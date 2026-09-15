import { outdent } from "outdent";

const snippets = [
  {
    name: "indentless sequence with a literal scalar (issue 16183)",
    code: outdent`
      list:
      - with:
          config-yml: |2
            hello: world
    `,
    output: outdent`
      list:
        - with:
            config-yml: |2
              hello: world
    `,
  },
  {
    name: "indentless sequence with a folded scalar",
    code: outdent`
      list:
      - with:
          value: >2-
            hello
            world
    `,
    output: outdent`
      list:
        - with:
            value: >2-
              hello
              world
    `,
  },
].map((test) => ({ ...test, output: test.output + "\n" }));

runFormatTest({ importMeta: import.meta, snippets }, ["yaml"]);

for (const tabWidth of [1, 4, 8]) {
  for (const proseWrap of ["preserve", "always"]) {
    runFormatTest(import.meta, ["yaml"], { tabWidth, proseWrap });
  }
}
