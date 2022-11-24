const { outdent } = require("outdent");

const snippets = [
  {
    code: outdent`
      block_with_ideographic_space: |
        \u{3000}x
    `,
    output: outdent`
      block_with_ideographic_space: |
        \u{3000}x
    `,
  },
].map((test) => ({ ...test, output: test.output + "\n" }));

run_spec({ dirname: __dirname, snippets }, ["yaml"]);
run_spec({ dirname: __dirname, snippets }, ["yaml"], { proseWrap: "always" });
