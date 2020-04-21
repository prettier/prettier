const dedent = require("dedent");

run_spec({
  dirname: __dirname,
  snippets: [
    {
      name: ".prettierrc in json(empty)",
      filename: ".prettierrc",
      code: "{}",
    },
    {
      name: ".prettierrc in json",
      filename: ".prettierrc",
      code: dedent`
        {"printWidth": 100,
        "overrides": [
          {"files": ".prettierrc",
            "options": {"parser": "json"
          }},
          {"files": "*.js",
            "options": {"parser": "babel",
          "singleQuote": true,"printWidth": 80,"semi":
        false,
        "quoteProps": "as-needed"
          }}
        ]}
      `,
    },
    {
      name: ".prettierrc in yaml",
      filename: ".prettierrc",
      code: dedent`
        # comment
        printWidth: 100
        overrides:
          - files: '.prettierrc'
            options:
              parser: "json"
      `,
    },
  ],
});
