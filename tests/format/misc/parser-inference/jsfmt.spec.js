const { outdent } = require("outdent");

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
      filename: "path/to/.prettierrc",
      code: outdent`
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
      code: outdent`
        # comment
        printWidth: 100
        overrides:
          - files: '.prettierrc'
            options:
              parser: "json"
      `,
    },
    {
      name: ".prettierrc in yaml (with flowMapping)",
      filename: ".prettierrc",
      code: outdent`
        # comment
        printWidth: 100
        overrides: {
          "files": [".prettierrc", "prettierrc.json"],
          "options": { "parser": "json"}
        }
      `,
    },
  ],
});
