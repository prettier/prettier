const dedent = require("dedent");

run_spec({
  dirname: __dirname,
  codes: [
    {
      name: "html",
      filename: "prettier.html",
      code: dedent`
        <foo>
                        <bar/>
        </foo>
      `,
    },
    {
      name: "js",
      filename: "prettier.js",
      code: dedent`
        foo(
                        'bar')
      `,
    },
    {
      name: "json",
      filename: "prettier.json",
      code: dedent`
        {foo:
                        'bar'}
      `,
    },
    {
      name: "typescript",
      filename: "prettier.ts",
      code: dedent`
        type foo =
                        'bar'
      `,
    },
    {
      name: "yaml",
      filename: "prettier.yml",
      code: dedent`
        foo:
                 - 'bar'
      `,
    },
  ],
});
