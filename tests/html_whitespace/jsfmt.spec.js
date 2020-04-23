run_spec(
  {
    dirname: __dirname,
    snippets: [
      ...[
        // https://developer.mozilla.org/en-US/docs/Glossary/Whitespace#In_HTML
        // single
        "\u0009",
        "\u000A",
        "\u000C",
        "\u000D",
        "\u0020",

        // many
        "\u0009\u000A\u000C\u000D\u0020",
      ].map((textContent) => ({
        code: `<div>${textContent}</div>`,
        name: "should be empty",
      })),

      ...[
        // single
        "\u0009",
        "\u000A",
        "\u000C",
        "\u000D",
        "\u0020",

        // many
        "\u0009\u000A\u000C\u000D\u0020",
      ].map((textContent) => ({
        code: `<span>${textContent}</span>`,
        name: "should keep one space",
      })),

      // non-space
      ...[
        "\u2005",
        " \u2005        ",
        "        \u2005\u2005 ",
        "        \u2005        \u2005 ",
      ].map((textContent) => `<div>${textContent}</div>`),

      ...[
        "\u2005",
        " \u2005        ",
        "        \u2005\u2005 ",
        "        \u2005        \u2005 ",
      ].map((textContent) => `<span>${textContent}</span>`),

      // #7103
      "<p><span>X</span> \u2005or\u2005 <span>Y</span></p><p>X \u2005or\u2005 Y</p>",
    ],
  },
  ["html"]
);
